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
  IonIcon,
  IonAvatar
} from '@ionic/react';
import { callOutline, locationOutline, eyeOffOutline } from 'ionicons/icons';
import '../styles/PrivacySettingsStyles.css';

const PrivacySettings = () => {
  const getInitialToggleState = (key: string, defaultValue: boolean) => {
    const savedState = localStorage.getItem(key);
    return savedState !== null ? JSON.parse(savedState) : defaultValue;
  };

  const [syncContacts, setSyncContacts] = useState(() => getInitialToggleState('syncContacts', true));
  const [locationAccess, setLocationAccess] = useState(() => getInitialToggleState('locationAccess', true));
  const [hideProfile, setHideProfile] = useState(() => getInitialToggleState('hideProfile', true));

  useEffect(() => {
    localStorage.setItem('syncContacts', JSON.stringify(syncContacts));
  }, [syncContacts]);

  useEffect(() => {
    localStorage.setItem('locationAccess', JSON.stringify(locationAccess));
  }, [locationAccess]);

  useEffect(() => {
    localStorage.setItem('hideProfile', JSON.stringify(hideProfile));
  }, [hideProfile]);

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar color="danger">
          <IonButtons slot="start">
            <IonBackButton />
          </IonButtons>
          <IonTitle>Privacidad</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent>
        <IonList>
          <IonItem lines="none" className="profile-item">
            <IonAvatar slot="start">
              <img src="path/to/profile-image.jpg" alt="Profile" /> {/* Reemplaza con la ruta de la imagen */}
            </IonAvatar>
            <IonLabel className="profile-label">
              <h2>María Becerra</h2>
              <p>Técnico en enfermería</p>
            </IonLabel>
          </IonItem>

          <IonItem lines="full" className="privacy-item">
            <IonIcon icon={callOutline} slot="start" /> {/* Icono de contactos */}
            <IonLabel className="privacy-label">Permitir sincronizar contactos</IonLabel>
            <IonToggle
              checked={syncContacts}
              onIonChange={(e) => setSyncContacts(e.detail.checked)}
              slot="end"
            />
          </IonItem>
          <IonItem lines="full" className="privacy-item">
            <IonIcon icon={locationOutline} slot="start" /> {/* Icono de ubicación */}
            <IonLabel className="privacy-label">Acceso a la ubicación</IonLabel>
            <IonToggle
              checked={locationAccess}
              onIonChange={(e) => setLocationAccess(e.detail.checked)}
              slot="end"
            />
          </IonItem>
          <IonItem lines="full" className="privacy-item">
            <IonIcon icon={eyeOffOutline} slot="start" /> {/* Icono de ocultar perfil */}
            <IonLabel className="privacy-label">Ocultar perfil</IonLabel>
            <IonToggle
              checked={hideProfile}
              onIonChange={(e) => setHideProfile(e.detail.checked)}
              slot="end"
            />
          </IonItem>
        </IonList>
      </IonContent>
    </IonPage>
  );
};

export default PrivacySettings;
