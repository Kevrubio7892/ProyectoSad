import React, { useEffect, useState } from 'react';
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonBackButton,
  IonContent,
  IonList,
  IonItem,
  IonLabel,
  IonToggle,
  IonIcon
} from '@ionic/react';
import { notificationsOutline, chatbubblesOutline, peopleOutline } from 'ionicons/icons'; // Importa los íconos
import '../styles/NotiSettingsStyles.css';

const NotificationsSettings = () => {
  // Función para recuperar el estado desde el Local Storage
  const getInitialToggleState = (key: string, defaultValue: boolean) => {
    const savedState = localStorage.getItem(key);
    return savedState !== null ? JSON.parse(savedState) : defaultValue;
  };

  // Estado de los toggles
  const [allowNotifications, setAllowNotifications] = useState(() => getInitialToggleState('allowNotifications', true));
  const [onlyMessages, setOnlyMessages] = useState(() => getInitialToggleState('onlyMessages', true));
  const [onlyMatches, setOnlyMatches] = useState(() => getInitialToggleState('onlyMatches', true));

  // Efecto para guardar el estado en el Local Storage
  useEffect(() => {
    localStorage.setItem('allowNotifications', JSON.stringify(allowNotifications));
  }, [allowNotifications]);

  useEffect(() => {
    localStorage.setItem('onlyMessages', JSON.stringify(onlyMessages));
  }, [onlyMessages]);

  useEffect(() => {
    localStorage.setItem('onlyMatches', JSON.stringify(onlyMatches));
  }, [onlyMatches]);

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar color="danger">
          <IonButtons slot="start">
            <IonBackButton />
          </IonButtons>
          <IonTitle>Notificaciones</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent>
        <IonList>
          <IonItem lines="full" className="notification-item">
            <IonLabel className="config-tittle-label">
              Configura tus notificaciones
            </IonLabel>
          </IonItem>
          <IonItem lines="full" className="notification-item">
            <IonIcon icon={notificationsOutline} slot="start" /> {/* Icono para permitir notificaciones */}
            <IonLabel className="notification-label">Permitir notificaciones</IonLabel>
            <IonToggle
              checked={allowNotifications}
              onIonChange={(e) => setAllowNotifications(e.detail.checked)}
              slot="end"
            />
          </IonItem>
          <IonItem className="notification-item">
            <IonIcon icon={chatbubblesOutline} slot="start" /> {/* Icono para solo mensajes */}
            <IonLabel className="notification-label">Solo mensajes</IonLabel>
            <IonToggle
              checked={onlyMessages}
              onIonChange={(e) => setOnlyMessages(e.detail.checked)}
              slot="end"
            />
          </IonItem>
          <IonItem className="notification-item">
            <IonIcon icon={peopleOutline} slot="start" /> {/* Icono para solo coincidencias */}
            <IonLabel className="notification-label">Solo coincidencias</IonLabel>
            <IonToggle
              checked={onlyMatches}
              onIonChange={(e) => setOnlyMatches(e.detail.checked)}
              slot="end"
            />
          </IonItem>
        </IonList>
      </IonContent>
    </IonPage>
  );
};

export default NotificationsSettings;
