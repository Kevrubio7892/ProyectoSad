import React, { useState } from "react";
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
  IonTextarea,
  IonIcon,
} from "@ionic/react";
import {
  personCircle,
  notifications,
  lockClosed,
  logoInstagram,
  card,
  logOut,
  refresh,
} from "ionicons/icons";
import { useHistory } from "react-router";
import "../styles/Opciones.css";
import InstagramLogin from "./IgLogin";

const SettingsPage = () => {
  const [description, setDescription] = useState("");
  const maxDescriptionLength = 100;
  const history = useHistory();

  const instagramAuthUrl = `https://api.instagram.com/oauth/authorize
  ?client_id=1084662546664405
  &redirect_uri=https://localhost:8100/auth/instagram/callback
  &scope=user_profile,user_media
  &response_type=code`;

  const handleInstagramLogin = () => {
    window.location.href = instagramAuthUrl;
  };

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
        <div className="profile-container">
          <img
            src="https://image.europafm.com/clipping/cmsimages01/2022/09/28/2FAC71CF-4762-49D3-AA69-B1154B85D5D1/maria-becerra_104.jpg?crop=2457,2457,x476,y0&width=1200&height=1200&optimize=low&format=webply"
            alt="Profile"
            className="profile-image"
          />
          <h2 className="profile-name">Jenny Nails</h2>
          <p>Técnico Veterinario</p>
        </div>

        <IonList>
          <IonItem lines="none">
            <IonLabel className="description-label">Descripción</IonLabel>
          </IonItem>
          <IonItem>
            <IonTextarea
              placeholder="Ingrese su descripción"
              maxlength={maxDescriptionLength}
              value={description}
              onIonChange={(e) => setDescription(e.target.value || "")}
            ></IonTextarea>
          </IonItem>
          <IonItem lines="none" className="description-counter">
            {description.length}/{maxDescriptionLength}
          </IonItem>
        </IonList>

        <IonList>
          <IonItem button onClick={() => history.push("/perfil")}>
            <IonIcon slot="start" icon={refresh} />
            <IonLabel>Datos personales</IonLabel>
          </IonItem>
          <IonItem button onClick={() => history.push("/notificaciones")}>
            <IonIcon slot="start" icon={notifications} />
            <IonLabel>Notificaciones</IonLabel>
          </IonItem>
          <IonItem button onClick={() => history.push("/privacidad")}>
            <IonIcon slot="start" icon={lockClosed} />
            <IonLabel>Privacidad de la cuenta</IonLabel>
          </IonItem>
          <IonItem button onClick={handleInstagramLogin}>
            <IonIcon slot="start" icon={logoInstagram} />
            <IonLabel>Vincular Instagram</IonLabel>
          </IonItem>

          {/* Aquí se agrega el botón para vincular Instagram */}
          <InstagramLogin />
          <IonItem button onClick={() => history.push("/gestion-suscripcion")}>
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
