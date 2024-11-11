import React, { useState, useEffect } from "react";
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
import { useHistory, useLocation } from "react-router";
import { onAuthStateChanged } from "firebase/auth";
import { getUserData, auth } from "../firebaseConfig"; // Ajusta el path según tu configuración
import "../styles/Opciones.css";

const SettingsPage: React.FC = () => {
  const [description, setDescription] = useState("");
  const [instagramName, setInstagramName] = useState<string | null>(null);
  const [userData, setUserData] = useState<any>(null); // Usa any para desactivar la verificación de tipos
  const maxDescriptionLength = 100;
  const history = useHistory();
  const location = useLocation();

  const clientId = '1764117657748954';
  const clientSecret = '8a8379cd6015f037ecd896b8fb217f6c';
  const redirectUri = 'https://a247-2800-300-6a14-8010-195e-b95d-79a3-64e2.ngrok-free.app/opciones';

  const handleLinkInstagram = () => {
    const instagramAuthUrl = `https://api.instagram.com/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&scope=user_profile,user_media&response_type=code`;
    window.location.href = instagramAuthUrl;
  };

  const fetchAccessToken = async (code: string) => {
    const response = await fetch('https://api.instagram.com/oauth/access_token', {
      method: 'POST',
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        grant_type: 'authorization_code',
        redirect_uri: redirectUri,
        code,
      }),
    });

    const data = await response.json();
    return data.access_token;
  };

  const fetchInstagramProfile = async (accessToken: string) => {
    const response = await fetch(
      `https://graph.instagram.com/me?fields=id,username&access_token=${accessToken}`
    );
    const data = await response.json();
    return data.username;
  };

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const code = params.get("code");

    if (code) {
      fetchAccessToken(code)
        .then((accessToken) => fetchInstagramProfile(accessToken))
        .then((username) => {
          setInstagramName(username);
          history.push("/opciones");
        })
        .catch((error) => console.error("Error al obtener el perfil de Instagram", error));
    }
  }, [location.search, history]);

  // Obtenemos datos del usuario autenticado de Firestore
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const data = await getUserData(user.uid);
        setUserData(data); // No necesitamos casting aquí porque userData es de tipo any
      }
    });
    return () => unsubscribe();
  }, []);

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
          {userData ? (
            <>
              <h2 className="profile-name">{userData.nombreCompleto}</h2>
              <p>Carrera: {userData.carrera}</p>
            </>
          ) : (
            <p>Cargando datos del usuario...</p>
          )}
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
          <IonItem button onClick={handleLinkInstagram}>
            <IonIcon slot="start" icon={logoInstagram} />
            <IonLabel>Vincular Instagram</IonLabel>
            {instagramName && <IonLabel slot="end">{instagramName}</IonLabel>}
          </IonItem>
          <IonItem button onClick={() => history.push("/gestion-suscripcion")}>
            <IonIcon slot="start" icon={card} />
            <IonLabel>Gestión suscripción</IonLabel>
          </IonItem>
          <IonItem button onClick={() => history.push("/login")}>
            <IonIcon slot="start" icon={logOut} />
            <IonLabel>Cerrar sesión</IonLabel>
          </IonItem>
        </IonList>
      </IonContent>
    </IonPage>
  );
};

export default SettingsPage;
