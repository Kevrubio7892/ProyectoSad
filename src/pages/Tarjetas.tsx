import React, { useState, useEffect, useRef } from "react";
import {
  IonContent,
  IonPage,
  IonHeader,
  IonIcon,
  IonButton,
  IonButtons,
  IonModal,
} from "@ionic/react";
import {
  settingsOutline,
  chatbubbleEllipsesOutline,
  close,
  checkmark,
  heart,
  logoInstagram,
} from "ionicons/icons";
import { createGesture } from "@ionic/react";
import { useHistory } from "react-router-dom";
import { db, auth, addLike, addDislike} from "../firebaseConfig";
import { collection, getDocs, onSnapshot, query, where } from "firebase/firestore"; // Asegúrate de importar onSnapshot
import LikeAnimation from "../components/LikeAnimation";
import CheckAnimation from "../components/CheckAnimation";
import XAnimation from "../components/XAnimation";
import logo_SAD from "../assets/logo_SAD.png";
import "../styles/TarjetasStyles.css";

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
}

const calcularEdad = (fechaNacimiento: string) => {
  const nacimiento = new Date(fechaNacimiento);
  const diferencia = Date.now() - nacimiento.getTime();
  const edad = new Date(diferencia).getUTCFullYear() - 1970;
  return edad;
};

const CardView: React.FC = () => {
  const [estudiantes, setEstudiantes] = useState<Estudiante[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showXAnimation, setShowXAnimation] = useState(false);
  const [showLikeAnimation, setShowLikeAnimation] = useState(false);
  const [showCheckAnimation, setShowCheckAnimation] = useState(false);
  const [showPremiumModal, setShowPremiumModal] = useState(false);
  const [showPayPalButton, setShowPayPalButton] = useState(false);

  const cardRef = useRef<HTMLDivElement | null>(null);
  const history = useHistory();

  useEffect(() => {
    const fetchEstudiantes = async () => {
      const estudiantesQuery = query(collection(db, "Estudiantes"));
      onSnapshot(estudiantesQuery, (snapshot) => {
        const estudiantesData: Estudiante[] = snapshot.docs.map((doc) => {
          const data = doc.data() as Omit<Estudiante, "id" | "edad">;
          const edad = calcularEdad(data.fechaNacimiento);
          return { id: doc.id, ...data, edad };
        });
        setEstudiantes(estudiantesData);
      });
    };
    fetchEstudiantes();
  }, []);

  const handleSwipe = (direction: number) => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % estudiantes.length);
    
  };

  const handleSettingsClick = () => {
    history.push("/opciones");
  };

  const handleChatsClick = () => {
    history.push("/chats");
  };

  const handleDislikeClick = async () => {
    setShowXAnimation(true);
  
    if (estudiantes[currentIndex]) {
      const toUserId = estudiantes[currentIndex].id; // ID del estudiante que recibe el Check
      const fromUserId = auth.currentUser?.uid; // ID del usuario actual (quien da el Check)
  
      if (fromUserId && toUserId) {
        await addDislike(fromUserId, toUserId); // Registra el Check en Firestore
      } else {
        console.error("Faltan IDs para registrar el Check.");
      }
    }
  
    setTimeout(() => {
      handleSwipe(1); // Cambia a la siguiente tarjeta después de la animación
    }, 500); // Asegúrate de que este tiempo coincide con la duración de la animación
  };

  const handleLikeClick = () => {
    setShowLikeAnimation(true);
    setShowPremiumModal(true);
  };

<<<<<<< HEAD
  const handlePremiumClick = () => {
    setShowPayPalButton(true); // Muestra el botón de PayPal cuando el usuario quiere pasarse a premium
  };

  const handleCheckClick = () => {
    setShowCheckAnimation(true); // Mostrar la animación al hacer clic en el check
=======
  const handleCheckClick = async () => {
    setShowCheckAnimation(true);
  
    if (estudiantes[currentIndex]) {
      const toUserId = estudiantes[currentIndex].id; // ID del estudiante que recibe el Check
      const fromUserId = auth.currentUser?.uid; // ID del usuario actual (quien da el Check)
  
      if (fromUserId && toUserId) {
        await addLike(fromUserId, toUserId); // Registra el Check en Firestore
      } else {
        console.error("Faltan IDs para registrar el Check.");
      }
    }
  
    setTimeout(() => {
      handleSwipe(1); // Cambia a la siguiente tarjeta después de la animación
    }, 500); // Asegúrate de que este tiempo coincide con la duración de la animación
>>>>>>> RamaKevin
  };
  
  
  

  const handleXAnimationComplete = () => setShowXAnimation(false);
  const handleLikeAnimationComplete = () => setShowLikeAnimation(false);
  const handleCheckAnimationComplete = () => setShowCheckAnimation(false);

  useEffect(() => {
    if (cardRef.current) {
      const gesture = createGesture({
        el: cardRef.current,
        gestureName: "swipe",
        direction: "x",
        onStart: () => {
          if (cardRef.current) {
            cardRef.current.style.transition = "none";
          }
        },
        onMove: (ev) => {
          if (cardRef.current) {
            cardRef.current.style.transform = `translate(${ev.deltaX}px, ${ev.deltaY}px)`;
          }
        },
        onEnd: (ev) => {
          const deltaX = ev.deltaX;
          const direction = deltaX > 0 ? 1 : -1;

          if (deltaX < -150) {
            handleSwipe(direction);
            if (cardRef.current) {
              cardRef.current.style.transition = "transform 0.3s ease-out";
              cardRef.current.style.transform = `translateX(-500px)`;
            }
          } else if (cardRef.current) {
            cardRef.current.style.transition = "transform 0.3s ease-out";
            cardRef.current.style.transform = "translate(0, 0)";
          }
        },
      });
      gesture.enable();

      return () => gesture.destroy();
    }
  }, [currentIndex]);

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
        {currentIndex < estudiantes.length && (
          <div ref={cardRef} id="card" className="card">
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

        <div className="button-container">
          <IonButton className="icon-button-x" fill="clear" color="light" onClick={handleDislikeClick}>
            <IonIcon icon={close} size="large" />
          </IonButton>
          <IonButton className="icon-button-check" fill="clear" color="light" onClick={handleCheckClick}>
            <IonIcon icon={checkmark} size="large" />
          </IonButton>
          <IonButton className="icon-button-heart" fill="clear" color="light" onClick={handleLikeClick}>
            <IonIcon icon={heart} size="large" />
          </IonButton>
        </div>
        {showPremiumModal && (
          <IonModal
            isOpen={showPremiumModal}
            onDidDismiss={() => setShowPremiumModal(false)}
            className="premium-modal"
          >
<<<<<<< HEAD

          <div className="modal-content">
            <h1 className="modal-title">¡CAMBIATE A PREMIUM!</h1>
            <p className="modal-description">Da super likes o reparte likes ilimitados.</p>
            <p className="modal-instruction">Presiona el botón para dirigirte al pago.</p>
            <IonButton onClick={() => setShowPremiumModal(false)} expand="block" className="ion-button-premium">
              Pasarme a premium
            </IonButton>
            <IonButton
              onClick={() => setShowPremiumModal(false)}
              expand="block"           
              className="ion-button-cancelar"
            >
              Cancelar
            </IonButton>
          </div>
        </IonModal>
      )}

        {showXAnimation && <XAnimation onComplete={handleXAnimationComplete} />}{" "}
        {/* Mostrar animación de X */}
        {showLikeAnimation && (
          <LikeAnimation onComplete={handleLikeAnimationComplete} />
        )}{" "}
        {/* Mostrar animación de like */}
        {showCheckAnimation && (
          <CheckAnimation onComplete={handleCheckAnimationComplete} />
        )}{" "}
        {/* Mostrar animación de check */}
=======
            <div className="modal-content">
              <h1 className="modal-title">¡PRONTO ESTARÁ DISPONIBLE EL PLAN PREMIUM!</h1>
              <p className="modal-description">Da super likes o reparte likes ilimitados.</p>
              <IonButton onClick={() => setShowPremiumModal(false)} expand="block" className="ion-button-premium">
                Pasarme a premium
              </IonButton>
              <IonButton onClick={() => setShowPremiumModal(false)} expand="block" className="ion-button-cancelar">
                Cancelar
              </IonButton>
            </div>
          </IonModal>
        )}
        {showXAnimation && <XAnimation onComplete={handleXAnimationComplete} />}
        {showLikeAnimation && <LikeAnimation onComplete={handleLikeAnimationComplete} />}
        {showCheckAnimation && <CheckAnimation onComplete={handleCheckAnimationComplete} />}
>>>>>>> RamaKevin
      </IonContent>
    </IonPage>
  );
};

export default CardView;
