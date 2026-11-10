import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  IonContent,
  IonPage,
  IonHeader,
  IonIcon,
  IonButton,
  IonButtons,
  IonModal,
  IonAlert,
  IonActionSheet,
  IonSelect,
  IonSelectOption,
} from "@ionic/react";
import {
  settingsOutline,
  chatbubbleEllipsesOutline,
  close,
  checkmark,
  heart,
  logoInstagram,
  ellipsisHorizontal,
} from "ionicons/icons";
import { createGesture } from "@ionic/react";
import { useHistory } from "react-router-dom";
import { db, auth, addDislike} from "../firebaseConfig";
import { collection, getDocs, onSnapshot, query, where, addDoc, Timestamp} from "firebase/firestore"; // Asegúrate de importar onSnapshot
import LikeAnimation from "../components/LikeAnimation";
import CheckAnimation from "../components/CheckAnimation";
import XAnimation from "../components/XAnimation";
import logo_SAD from "../assets/logo_SAD.png";
import "../styles/TarjetasStyles.css";
import PayWithPayPal from "../components/PayWithPayPal";
import {
  likeStudent,
  resolveStudentDocumentId,
  sendSuperLike,
} from "../services/MatchingService";
import { blockStudent, reportStudent } from "../services/SafetyService";
import { filterDiscoveryProfiles } from "../utils/discovery";


interface Estudiante {
  id: string;
  nombreCompleto: string;
  sedeAcademica: string;
  fechaNacimiento: string;
  carrera: string;
  anioEstudio: number;
  edad?: number;
  descripcion: string;
  instagram?: string;
  photoUrl?: string; // Campo para la foto de perfil
  email: string; // Agregamos el campo email
  telefono?: string;
  role?: string;
  uid?: string;
}

const calcularEdad = (fechaNacimiento: string) => {
  const nacimiento = new Date(fechaNacimiento);
  const diferencia = Date.now() - nacimiento.getTime();
  const edad = new Date(diferencia).getUTCFullYear() - 1970;
  return edad;
};

const CardView: React.FC = () => {
  const [allStudents, setAllStudents] = useState<Estudiante[]>([]);
  const [excludedIds, setExcludedIds] = useState<Set<string>>(new Set());
  const [blockedIds, setBlockedIds] = useState<Set<string>>(new Set());
  const [careerFilter, setCareerFilter] = useState("");
  const [showXAnimation, setShowXAnimation] = useState(false);
  const [showLikeAnimation, setShowLikeAnimation] = useState(false);
  const [showCheckAnimation, setShowCheckAnimation] = useState(false);
  const [showPremiumModal, setShowPremiumModal] = useState(false);
  const [isPremium, setIsPremium] = useState(false); // Nuevo estado para verificar si es Premium
  const [matchedUserName, setMatchedUserName] = useState("");
  const [showSafetyActions, setShowSafetyActions] = useState(false);
  const [reportedUser, setReportedUser] = useState<Estudiante | null>(null);
  const [safetyError, setSafetyError] = useState("");
  const [feedError, setFeedError] = useState("");
  const cardRef = useRef<HTMLDivElement | null>(null);
  const history = useHistory();
  const currentUser = auth.currentUser;
  const currentIndex = 0;
  const careerOptions = useMemo(
    () => [...new Set(allStudents.map((student) => student.carrera).filter(Boolean))].sort(),
    [allStudents]
  );
  const estudiantes = useMemo(
    () => filterDiscoveryProfiles(allStudents, {
      currentUserId: currentUser?.uid || "",
      currentEmail: currentUser?.email,
      currentPhone: currentUser?.phoneNumber,
      campus: "Duoc UC Puente Alto",
      blockedIds,
      excludedIds,
      career: careerFilter || undefined,
    }) as Estudiante[],
    [allStudents, blockedIds, careerFilter, currentUser?.email, currentUser?.phoneNumber, currentUser?.uid, excludedIds]
  );

  useEffect(() => {
    let active = true;
    let unsubscribeStudents: (() => void) | undefined;

    const fetchEstudiantes = async () => {
      try {
        const userId = auth.currentUser?.uid; // Obtén el ID del usuario actual
        if (!userId) {
          setFeedError("No se pudo identificar la sesión actual. Vuelve a iniciar sesión.");
          return;
        }

        // Consulta las subcolecciones LIKES y DISLIKES del usuario actual
        const profileDocumentId = await resolveStudentDocumentId(
          userId,
          auth.currentUser?.email
        );
        const likesRef = collection(db, `Estudiantes/${profileDocumentId}/LIKES`);
        const dislikesRef = collection(db, `Estudiantes/${profileDocumentId}/DISLIKES`);
  
        const [likesSnapshot, dislikesSnapshot] = await Promise.all([
          getDocs(likesRef),
          getDocs(dislikesRef),
        ]);
  
        // Obtén los IDs de los usuarios ya evaluados
        const likedUserIds = likesSnapshot.docs.map((doc) => doc.data().toUserId);
        const dislikedUserIds = dislikesSnapshot.docs.map(
          (doc) => doc.data().toUserId
        );
  
        const blockedSnapshot = await getDocs(
          collection(db, `Estudiantes/${profileDocumentId}/BLOCKED`)
        );
        const blockedUserIds = blockedSnapshot.docs.map((doc) => doc.id);
        setExcludedIds(new Set([
          ...likedUserIds,
          ...dislikedUserIds,
        ]));
        setBlockedIds(new Set(blockedUserIds));
  
        // Consulta todos los estudiantes
        const estudiantesQuery = query(collection(db, "Estudiantes"));
        unsubscribeStudents = onSnapshot(estudiantesQuery, (snapshot) => {
          if (!active) return;
          const estudiantesData: Estudiante[] = snapshot.docs
            .map((doc) => {
              const data = doc.data() as Omit<Estudiante, "id" | "edad">;
              const edad = calcularEdad(data.fechaNacimiento);
              return { id: data.uid || doc.id, ...data, edad };
            });

          setAllStudents(estudiantesData);
          setFeedError("");
        }, (error) => {
          console.error("Error al escuchar perfiles:", error);
          if (active) {
            setFeedError("No se pudieron cargar los perfiles disponibles.");
          }
        });
      } catch (error) {
        console.error("Error al obtener los estudiantes:", error);
        if (active) {
          setFeedError("No se pudieron cargar los perfiles disponibles.");
        }
      }
    };

    const checkPremiumStatus = async () => {
      try {
        const userEmail = auth.currentUser?.email; // ID del usuario actual
        if (!userEmail) return;

        // Consulta la colección Transacciones buscando transacciones del usuario actual
        const transaccionesRef = collection(db, "Transacciones");
        const q = query(transaccionesRef, where("userEmail", "==", userEmail), where("estado", "==", "completada"));
        const querySnapshot = await getDocs(q);

        // Si hay al menos una transacción completada, el usuario es premium
        if (active) {
          setIsPremium(!querySnapshot.empty);
        }
      } catch (error) {
        console.error("Error al verificar el estado Premium:", error);
      }
    };
    fetchEstudiantes();
    checkPremiumStatus();
    return () => {
      active = false;
      unsubscribeStudents?.();
    };
  }, []);




  const handleSettingsClick = () => {
    history.push("/opciones");
  };

  const handleChatsClick = () => {
    history.push("/chats");
  };

  const handleBlockCurrent = async () => {
    const userId = auth.currentUser?.uid;
    const target = estudiantes[currentIndex];
    if (!userId || !target) return;

    try {
      await blockStudent(userId, target.id);
      setBlockedIds((current) => new Set(current).add(target.id));
      setSafetyError("");
    } catch (error) {
      console.error("Error al bloquear el perfil:", error);
      setSafetyError("No se pudo bloquear este perfil. Inténtalo nuevamente.");
    }
  };

  const handleReportCurrent = async (reason: string) => {
    const userId = auth.currentUser?.uid;
    if (!userId || !reportedUser) return;

    try {
      await reportStudent(userId, reportedUser.id, reason);
      setSafetyError("Gracias. Recibimos el reporte para revisión.");
    } catch (error) {
      console.error("Error al reportar el perfil:", error);
      setSafetyError(error instanceof Error ? error.message : "No se pudo enviar el reporte.");
    } finally {
      setReportedUser(null);
    }
  };

  const handleDislikeClick = async () => {
    setShowXAnimation(true);
  
    if (estudiantes[currentIndex]) {
      const toUserId = estudiantes[currentIndex].id; // ID del estudiante que recibe el Check
      const fromUserId = auth.currentUser?.uid; // ID del usuario actual (quien da el Check)
  
      if (fromUserId && toUserId) {
        try {
          await addDislike(fromUserId, toUserId);
          setExcludedIds((current) => new Set(current).add(toUserId));
          setFeedError("");
        } catch (error) {
          console.error("Error al registrar el dislike:", error);
          setFeedError("No se pudo guardar tu decisión. Inténtalo nuevamente.");
        }
      } else {
        console.error("Faltan IDs para registrar el Check.");
      }
    }
  
    setTimeout(() => setShowXAnimation(false), 500);
  };

  const handleLikeClick = async () => {
    if (isPremium) {
      setShowLikeAnimation(true); // Muestra la animación del like

      // Registrar el Super Like sin crear un match hasta que la otra persona use check
      if (estudiantes[currentIndex]) {
        const toUserId = estudiantes[currentIndex].id; // ID del estudiante que recibe el like
        const fromUserId = auth.currentUser?.uid; // ID del usuario actual

        if (fromUserId && toUserId) {
          try {
            // La subcolección de Likes está dentro del documento del estudiante
            await sendSuperLike(fromUserId, toUserId);
            setExcludedIds((current) => new Set(current).add(toUserId));
          } catch (error) {
            console.error("Error al registrar el Super Like:", error);
            setFeedError("No se pudo registrar el Super Like. Inténtalo nuevamente.");
          }
        }
      }

      setTimeout(() => setShowLikeAnimation(false), 500);
    } else {
      // Mostrar el modal de suscripción si no es Premium
      setShowPremiumModal(true);
    }
  };

  const handleCheckClick = async () => {
    setShowCheckAnimation(true);
  
    if (estudiantes[currentIndex]) {
      const toUserId = estudiantes[currentIndex].id; // ID del estudiante que recibe el Check
      const fromUserId = auth.currentUser?.uid; // ID del usuario actual (quien da el Check)
  
      if (fromUserId && toUserId) {
        try {
          const matchId = await likeStudent(
            fromUserId,
            toUserId,
            auth.currentUser?.email
          );
          setExcludedIds((current) => new Set(current).add(toUserId));
          if (matchId) {
            setMatchedUserName(estudiantes[currentIndex].nombreCompleto);
          }
        } catch (error) {
          console.error("Error al registrar like o comprobar match:", error);
          setFeedError("No se pudo registrar el like. Inténtalo nuevamente.");
        }
      } else {
        console.error("Faltan IDs para registrar el Check.");
      }
    }

    setTimeout(() => setShowCheckAnimation(false), 500);
  };
  
  
  
  

  const handleXAnimationComplete = () => setShowXAnimation(false);
  const handleLikeAnimationComplete = () => setShowLikeAnimation(false);
  const handleCheckAnimationComplete = () => setShowCheckAnimation(false);

  const hasCard = estudiantes.length > 0;
  const gestureActions = useRef({
    dislike: handleDislikeClick,
    like: handleCheckClick,
  });
  gestureActions.current = {
    dislike: handleDislikeClick,
    like: handleCheckClick,
  };

  useEffect(() => {
    if (hasCard && cardRef.current) {
      const gesture = createGesture({
        el: cardRef.current,
        gestureName: "swipe",
        direction: "x",
        onStart: () => {
          if (cardRef.current) {
            cardRef.current.style.transition = "none"; // Deshabilita las transiciones al iniciar el gesto
          }
        },
        onMove: (ev) => {
          if (cardRef.current) {
            cardRef.current.style.transform = `translate(${ev.deltaX}px, ${ev.deltaY}px) rotate(${ev.deltaX / 10}deg)`; // Aplica un ligero giro
          }
        },
        onEnd: (ev) => {
          const deltaX = ev.deltaX;
          const threshold = 150; // Umbral de deslizamiento
  
          if (deltaX < -threshold) {
            // Deslizar a la izquierda
            if (cardRef.current) {
              cardRef.current.style.transition = "transform 0.3s ease-out";
              cardRef.current.style.transform = `translateX(-500px) rotate(-20deg)`; // Desplaza la carta hacia la izquierda
            }
            void gestureActions.current.dislike();
          } else if (deltaX > threshold) {
            // Deslizar a la derecha
            if (cardRef.current) {
              cardRef.current.style.transition = "transform 0.3s ease-out";
              cardRef.current.style.transform = `translateX(500px) rotate(20deg)`; // Desplaza la carta hacia la derecha
            }
            void gestureActions.current.like();
          } else if (cardRef.current) {
            // Si no alcanza el umbral, regresa la carta a su posición inicial
            cardRef.current.style.transition = "transform 0.3s ease-out";
            cardRef.current.style.transform = "translate(0, 0) rotate(0)";
          }
  
          // Restablece el estilo después de la transición
          setTimeout(() => {
            if (cardRef.current) {
              cardRef.current.style.transition = "none";
              cardRef.current.style.transform = "translate(0, 0) rotate(0)";
            }
          }, 300); // Ajusta el tiempo a la duración de la animación
        },
      });
      gesture.enable();
  
      return () => gesture.destroy();
    }
  }, [hasCard]);
  

  return (
    <IonPage className="content">
      <IonHeader className="header">
        <IonButtons slot="start">
          <IonButton color="light" onClick={handleSettingsClick}>
            <IonIcon icon={settingsOutline} size="large" />
          </IonButton>
        </IonButtons>
        <img src={logo_SAD} alt="Logo SAD" className="logo" />
        <IonButtons slot="end">
          <IonButton color="light" onClick={handleChatsClick}>
            <IonIcon icon={chatbubbleEllipsesOutline} size="large" />
          </IonButton>
        </IonButtons>
      </IonHeader>
      <IonContent fullscreen className="content">
        <div className="discovery-filter">
          <IonSelect
            aria-label="Filtrar por carrera"
            value={careerFilter}
            placeholder="Todas las carreras"
            onIonChange={(event) => setCareerFilter(event.detail.value || "")}
          >
            <IonSelectOption value="">Todas las carreras</IonSelectOption>
            {careerOptions.map((career) => (
              <IonSelectOption key={career} value={career}>{career}</IonSelectOption>
            ))}
          </IonSelect>
        </div>
        {currentIndex < estudiantes.length && (
          <div ref={cardRef} id="card" className="card">
            <IonButton
              fill="clear"
              color="light"
              aria-label="Opciones de seguridad del perfil"
              onClick={() => setShowSafetyActions(true)}
            >
              <IonIcon icon={ellipsisHorizontal} />
            </IonButton>
            {/* Background image for the entire card */}
            <img
              src={estudiantes[currentIndex].photoUrl || "https://via.placeholder.com/150"}
              alt="Profile"
              className="card-image"
            />
            <div className="info-container">
              
              <h2 className="name-text">
                {estudiantes[currentIndex].nombreCompleto} {estudiantes[currentIndex].edad}
              </h2>
              <p className="detail-text">Estudiando {estudiantes[currentIndex].carrera} 📕</p>
              <p className="detail-text">Año Estudio: {estudiantes[currentIndex].anioEstudio} 📅</p>
              <p className="detail-text">{estudiantes[currentIndex].sedeAcademica} 🏫</p>
              <p className="desc-text">{estudiantes[currentIndex].descripcion}</p>

              {/* Icono de Instagram en la esquina si la URL existe */}
              {estudiantes[currentIndex].instagram && (
                <a
                  href={estudiantes[currentIndex].instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="instagram-icon"
                >
                  <IonIcon icon={logoInstagram} size="large" />
                </a>
              )}
            </div>
          </div>
        )}

        {feedError && <p role="alert">{feedError}</p>}
        {!feedError && estudiantes.length === 0 && (
          <div className="empty-message" role="status">
            No hay perfiles disponibles en tu sede por ahora. Vuelve más tarde.
          </div>
        )}
        {safetyError && <p role="status">{safetyError}</p>}

        <IonActionSheet
          isOpen={showSafetyActions}
          onDidDismiss={() => setShowSafetyActions(false)}
          buttons={[
            {
              text: "Bloquear perfil",
              role: "destructive",
              handler: () => { void handleBlockCurrent(); },
            },
            {
              text: "Reportar perfil",
              handler: () => setReportedUser(estudiantes[currentIndex] || null),
            },
            { text: "Cancelar", role: "cancel" },
          ]}
        />
        <IonAlert
          isOpen={Boolean(reportedUser)}
          onDidDismiss={() => setReportedUser(null)}
          header="Reportar perfil"
          message="Describe el motivo. El reporte será enviado al equipo de moderación."
          inputs={[{ name: "reason", type: "textarea", placeholder: "Describe el problema (10-1000 caracteres)" }]}
          buttons={[
            { text: "Cancelar", role: "cancel" },
            {
              text: "Enviar reporte",
              handler: ({ reason }) => { void handleReportCurrent(reason || ""); return true; },
            },
          ]}
        />

        <div className="button-container" hidden={estudiantes.length === 0}>
          <IonButton className="icon-button-x" fill="clear" color="light" onClick={handleDislikeClick}>
            <IonIcon icon={close} size="large" />
          </IonButton>
          <IonButton
            className="icon-button-check"
            fill="clear"
            color="light"
            aria-label="Dar like"
            onClick={handleCheckClick}
          >
            <IonIcon icon={checkmark} size="large" />
          </IonButton>
          <IonButton
            className="icon-button-heart"
            fill="clear"
            color="light"
            aria-label="Enviar Super Like premium"
            onClick={handleLikeClick}
          >
            <IonIcon icon={heart} size="large" />
          </IonButton>
        </div>
        {showPremiumModal && (
          <IonModal
            isOpen={showPremiumModal}
            onDidDismiss={() => setShowPremiumModal(false)}
            className="premium-modal"
          >
            <div className="modal-content">
              <h1 className="modal-title">SUSCRÍBETE PARA DAR OBTENER UNA MEJOR EXPERIENCIA!</h1>
              <p className="modal-description">Da super likes o reparte likes ilimitados.</p>
              <IonButton onClick={() => setShowPremiumModal(false)} expand="block" className="ion-button-cancelar">
                Cancelar
              </IonButton>
              <IonButton onClick={() => setShowPremiumModal(false)} expand="block" className="ion-button-cancelar">
                <PayWithPayPal/>
              </IonButton>
            </div>
          </IonModal>
        )}
        <IonAlert
          isOpen={Boolean(matchedUserName)}
          header="¡Es una coincidencia!"
          message={`Tú y ${matchedUserName} se dieron like. Ya pueden conversar.`}
          buttons={[
            { text: "Seguir descubriendo", role: "cancel", handler: () => setMatchedUserName("") },
            { text: "Abrir chats", handler: () => { setMatchedUserName(""); handleChatsClick(); } },
          ]}
          onDidDismiss={() => setMatchedUserName("")}
        />
        {showXAnimation && <XAnimation onComplete={handleXAnimationComplete} />}
        {showLikeAnimation && <LikeAnimation onComplete={handleLikeAnimationComplete} />}
        {showCheckAnimation && <CheckAnimation onComplete={handleCheckAnimationComplete} />}
      </IonContent>
    </IonPage>
  );
};

export default CardView;
