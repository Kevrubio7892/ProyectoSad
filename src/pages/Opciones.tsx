import React, { useState } from 'react';
import { IonPage, IonHeader, IonToolbar, IonTitle, IonButtons, IonBackButton, IonContent, IonList, IonItem, IonLabel, IonTextarea, IonIcon } from '@ionic/react';
import { personCircle, notifications, lockClosed, logoInstagram, card, logOut, refresh } from 'ionicons/icons';
import { useHistory } from 'react-router';

const SettingsPage = () => {
  const [description, setDescription] = useState('');
  const maxDescriptionLength = 100;
  const history = useHistory();

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar color="danger">
          <IonButtons slot="start">
            <IonBackButton />
          </IonButtons>
          <IonTitle>Opciones</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent>
        <div style={{ textAlign: 'center', padding: '20px' }}>
          <img
            src="https://image.europafm.com/clipping/cmsimages01/2022/09/28/2FAC71CF-4762-49D3-AA69-B1154B85D5D1/maria-becerra_104.jpg?crop=2457,2457,x476,y0&width=1200&height=1200&optimize=low&format=webply"
            alt="Profile"
            style={{ borderRadius: '50%', width: '100px', height: '100px' }}
          />
          <h2 style={{ fontWeight: 'bold', margin: '10px 0 0' }}>Jenny Nails</h2>
          <p>Técnico Veterinario</p>
        </div>

        <IonList>
          <IonItem lines="none">
            <IonLabel style={{ fontWeight: 'bold' }}>Descripción</IonLabel>
          </IonItem>
          <IonItem>
            <IonTextarea
              placeholder="Ingrese su descripción"
              maxlength={maxDescriptionLength}
              value={description}
              onIonChange={(e) => setDescription(e.target.value || '')}
            ></IonTextarea>
          </IonItem>
          <IonItem lines="none" style={{ textAlign: 'right', fontSize: '12px', paddingRight: '10px' }}>
            {description.length}/{maxDescriptionLength} 
          </IonItem>
        </IonList>

        <IonList>
          <IonItem button onClick={() => history.push('/perfil')}>
            <IonIcon slot="start" icon={refresh} />
            <IonLabel>Datos personales</IonLabel>
          </IonItem>
          <IonItem button onClick={() => history.push('/notificaciones')}>
            <IonIcon slot="start" icon={notifications} />
            <IonLabel>Notificaciones</IonLabel>
          </IonItem>
          <IonItem button>
            <IonIcon slot="start" icon={lockClosed} />
            <IonLabel>Privacidad de la cuenta</IonLabel>
          </IonItem>
          <IonItem button>
            <IonIcon slot="start" icon={logoInstagram} />
            <IonLabel>Vincular Instagram</IonLabel>
          </IonItem>
          <IonItem button>
            <IonIcon slot="start" icon={card} />
            <IonLabel>Gestión suscripción</IonLabel>
          </IonItem>
          <IonItem button>
            <IonIcon slot="start" icon={logOut} />
            <IonLabel>Cerrar sesión</IonLabel>
          </IonItem>
        </IonList>
      </IonContent>
    </IonPage>
  );
};

export default SettingsPage;