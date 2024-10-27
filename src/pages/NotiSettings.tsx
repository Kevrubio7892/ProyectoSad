import React, { useState } from 'react';
import { IonPage, IonHeader, IonToolbar, IonTitle, IonButtons, IonBackButton, IonContent, IonList, IonItem, IonLabel, IonToggle } from '@ionic/react';
import './NotiSettings.css'

const NotificationsSettings = () => {
  const [allowNotifications, setAllowNotifications] = useState(true);
  const [onlyMessages, setOnlyMessages] = useState(true);
  const [onlyMatches, setOnlyMatches] = useState(true);

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
          <IonItem lines="full">
            <IonLabel className="ion-text-center" style={{ fontWeight: 'bold' }}>
              Configura tus notificaciones
            </IonLabel>
          </IonItem>
          <IonItem lines="full">
            <IonLabel>Permitir notificaciones</IonLabel>
            <IonToggle checked={allowNotifications} onIonChange={(e) => setAllowNotifications(e.detail.checked)} />
          </IonItem>
          <IonItem>
            <IonLabel>Solo mensajes</IonLabel>
            <IonToggle checked={onlyMessages} onIonChange={(e) => setOnlyMessages(e.detail.checked)} />
          </IonItem>
          <IonItem>
            <IonLabel>Solo coincidencias</IonLabel>
            <IonToggle checked={onlyMatches} onIonChange={(e) => setOnlyMatches(e.detail.checked)} />
          </IonItem>
        </IonList>
      </IonContent>
    </IonPage>
  );
};

export default NotificationsSettings;
