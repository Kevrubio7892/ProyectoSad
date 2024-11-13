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
import { db } from "../firebaseConfig";
import { collection, getDocs, onSnapshot, query, where } from "firebase/firestore"; // Asegúrate de importar onSnapshot
import LikeAnimation from "../components/LikeAnimation";
import CheckAnimation from "../components/CheckAnimation";
import XAnimation from "../components/XAnimation";
import logo_SAD from "../assets/logo_SAD.png";
import "../styles/Tarjetas.css";

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

  const handleXClick = () => {
    setShowXAnimation(true);
  };

  const handleLikeClick = () => {
    setShowLikeAnimation(true);
    setShowPremiumModal(true);
  };

  const handleCheckClick = () => {
    setShowCheckAnimation(true);
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
          <IonButton color="light">
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
          <IonButton className="icon-button-x" fill="clear" color="light" onClick={handleXClick}>
            <IonIcon icon={close} size="large" />
          </IonButton>
          <IonButton className="icon-button-check" fill="clear" color="light" onClick={() => handleSwipe(1)}>
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
            <div className="modal-content">
              <h1 className="modal-title">¡CAMBIATE A PREMIUM!</h1>
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
      </IonContent>
    </IonPage>
  );
};

export default CardView;
