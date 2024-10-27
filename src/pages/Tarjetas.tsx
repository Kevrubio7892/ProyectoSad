import React, { useState, useEffect, useRef } from 'react';
import { IonContent, IonPage, IonHeader, IonIcon, IonButton, IonButtons } from '@ionic/react';
import { settingsOutline, chatbubbleEllipsesOutline, close, checkmark, heart } from 'ionicons/icons';
import { createGesture } from '@ionic/react';
import logo_SAD from '../assets/logo_SAD.png';
import imageLeia from '../assets/leia.jpg';
import imageBambi from '../assets/bambi.jpg';
import LikeAnimation from '../components/LikeAnimation'; // Importa el componente de animación de like
import CheckAnimation from '../components/CheckAnimation'; // Importa el componente de animación de check
import { useHistory } from 'react-router-dom';
import '../styles/Tarjetas.css';


interface CardData {
  id: number;
  name: string;
  details: string[];
  image: string;
}

const data: CardData[] = [
  { id: 1, name: 'José Manuel 22', details: ['Ingeniería Civil', 'Deportes', 'Conocer personas'], image: imageLeia },
  { id: 2, name: 'María 20', details: ['Diseño Gráfico', 'Arte', 'Fotografía'], image: imageBambi },
];

const CardView: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showLikeAnimation, setShowLikeAnimation] = useState(false); // Estado para la animación de like
  const [showCheckAnimation, setShowCheckAnimation] = useState(false); // Estado para la animación de check
  const cardRef = useRef<HTMLDivElement | null>(null);

  const handleSwipe = (direction: number) => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % data.length);
  };

  const handleLikeClick = () => {
    setShowLikeAnimation(true); // Mostrar la animación al hacer clic en el corazón
  };

  const handleCheckClick = () => {
    setShowCheckAnimation(true); // Mostrar la animación al hacer clic en el check
  };

  const handleLikeAnimationComplete = () => {
    setShowLikeAnimation(false); // Ocultar la animación de like al completarse
  };

  const handleCheckAnimationComplete = () => {
    setShowCheckAnimation(false); // Ocultar la animación de check al completarse
  };

  useEffect(() => {
    if (cardRef.current) {
      const gesture = createGesture({
        el: cardRef.current,
        gestureName: 'swipe',
        direction: 'x',
        onStart: () => {
          if (cardRef.current) {
            cardRef.current.style.transition = 'none'; // Desactiva la transición al iniciar el gesto
          }
        },
        onMove: (ev) => {
          // Mover la tarjeta según el gesto
          if (cardRef.current) {
            cardRef.current.style.transform = `translate(${ev.deltaX}px, ${ev.deltaY}px)`;
          }
        },
        onEnd: (ev) => {
          const deltaX = ev.deltaX;
          const deltaY = ev.deltaY;
          const direction = deltaX > 0 ? 1 : -1;

          // Deslizar a la izquierda para pasar a la siguiente carta
          if (deltaX < -150) {
            handleSwipe(direction);
            if (cardRef.current) {
              cardRef.current.style.transition = 'transform 0.3s ease-out';
              cardRef.current.style.transform = `translateX(-500px)`; // Desplazar a la izquierda
            }
          } else {
            // Regresar la tarjeta a su posición original si no se desliza suficiente
            if (cardRef.current) {
              cardRef.current.style.transition = 'transform 0.3s ease-out';
              cardRef.current.style.transform = 'translate(0, 0)'; // Regresar a la posición original
            }
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
          <IonButton color="light">
            <IonIcon icon={settingsOutline} size="large"/>
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
        {currentIndex < data.length && (
          <div ref={cardRef} id="card" className="card">
            <img src={data[currentIndex].image} alt={data[currentIndex].name} className="card-image" />
            <div className="info-container">
              <h2 className="name-text">{data[currentIndex].name}</h2>
              {data[currentIndex].details.map((detail, index) => (
                <p key={index} className="detail-text">{detail}</p>
              ))}
            </div>
          </div>
        )}
        <div className="button-container">
          <IonButton className="icon-button-x" fill="clear" color="light">
            <IonIcon icon={close} size="large" />
          </IonButton>
          <IonButton className="icon-button-check" fill="clear" color="light" onClick={() => { handleSwipe(1); handleCheckClick(); }}>
            <IonIcon icon={checkmark} size="large" />
          </IonButton>
          <IonButton className="icon-button-heart" fill="clear" color="light" onClick={handleLikeClick}>
            <IonIcon icon={heart} size="large" />
          </IonButton>
        </div>
        {showLikeAnimation && <LikeAnimation onComplete={handleLikeAnimationComplete} />} {/* Mostrar animación de like */}
        {showCheckAnimation && <CheckAnimation onComplete={handleCheckAnimationComplete} />} {/* Mostrar animación de check */}
      </IonContent>
    </IonPage>
  );
};

export default CardView;
