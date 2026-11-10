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
  IonText,
  IonNote,
} from '@ionic/react';
import { callOutline, locationOutline, eyeOffOutline } from 'ionicons/icons';
import {
  getStudentDiscoveryPreference,
  updateStudentDiscoveryPreference,
} from '../services/StudentSettingsService';
import '../styles/PrivacySettingsStyles.css';

const PrivacySettings = () => {
  const [isDiscoverable, setIsDiscoverable] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    getStudentDiscoveryPreference()
      .then((value) => {
        if (active) setIsDiscoverable(value);
      })
      .catch((loadError: unknown) => {
        console.error('Error al cargar las preferencias de privacidad:', loadError);
        if (active) setError('No se pudo cargar tu preferencia de visibilidad.');
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const handleVisibilityChange = async (hidden: boolean) => {
    const previousValue = isDiscoverable;
    setIsDiscoverable(!hidden);
    setIsSaving(true);
    setError('');
    try {
      await updateStudentDiscoveryPreference('isDiscoverable', !hidden);
    } catch (saveError: unknown) {
      console.error('Error al guardar la preferencia de privacidad:', saveError);
      setIsDiscoverable(previousValue);
      setError('No se pudo guardar el cambio. Inténtalo nuevamente.');
    } finally {
      setIsSaving(false);
    }
  };

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

          <IonItem lines="full" className="privacy-item">
            <IonIcon icon={callOutline} slot="start" /> {/* Icono de contactos */}
            <IonLabel className="privacy-label">Sincronización de contactos</IonLabel>
            <IonText color="medium">No disponible</IonText>
          </IonItem>
          <IonItem lines="full" className="privacy-item">
            <IonIcon icon={locationOutline} slot="start" /> {/* Icono de ubicación */}
            <IonLabel className="privacy-label">Ubicación precisa</IonLabel>
            <IonText color="medium">No disponible</IonText>
          </IonItem>
          <IonItem lines="full" className="privacy-item">
            <IonIcon icon={eyeOffOutline} slot="start" /> {/* Icono de ocultar perfil */}
            <IonLabel className="privacy-label">Pausar aparición en el feed</IonLabel>
            <IonToggle
              checked={!isDiscoverable}
              disabled={isLoading || isSaving}
              onIonChange={(e) => { void handleVisibilityChange(e.detail.checked); }}
              slot="end"
            />
          </IonItem>
        </IonList>
        <IonNote className="ion-padding">
          Al pausar, el perfil se omite en el feed de la aplicación. La protección contra
          accesos directos requiere reglas de seguridad de Firestore en el servidor.
        </IonNote>
        {error && <p role="alert">{error}</p>}
      </IonContent>
    </IonPage>
  );
};

export default PrivacySettings;
