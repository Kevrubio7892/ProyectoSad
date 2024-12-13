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
  IonButton,
  IonIcon,
  IonAlert,
} from "@ionic/react";
import {
  notifications,
  lockClosed,
  logoInstagram,
  card,
  logOut,
  refresh,
} from "ionicons/icons";
<<<<<<< HEAD
import { useHistory, useLocation } from "react-router";
import "../styles/Opciones.css";
import InstagramLogin from "./IgLogin";
=======
import { useHistory } from "react-router";
import { onAuthStateChanged } from "firebase/auth";
import { getUserData, auth, updateUserDescription, updateInstagramUrl } from "../firebaseConfig";
import "../styles/OpcionesStyles.css";
>>>>>>> RamaKevin

const SettingsPage: React.FC = () => {
  const [description, setDescription] = useState("");
  const [instagramUrl, setInstagramUrl] = useState<string | null>(null);
  const [instagramUsername, setInstagramUsername] = useState<string | null>(null);
  const [userData, setUserData] = useState<any>(null);
  const [showInstagramAlert, setShowInstagramAlert] = useState(false);
  const maxDescriptionLength = 100;
  const history = useHistory();

<<<<<<< HEAD
  const clientId = "1764117657748954"; // Tu Client ID de Instagram
  const clientSecret = "8a8379cd6015f037ecd896b8fb217f6c"; // Tu Client Secret de Instagram
  const redirectUri =
    "https://a247-2800-300-6a14-8010-195e-b95d-79a3-64e2.ngrok-free.app/opciones"; // Cambia esto a tu ruta "/opciones"

  // Redirige a la página de autorización de Instagram
  const handleLinkInstagram = () => {
    const instagramAuthUrl = `https://api.instagram.com/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&scope=user_profile,user_media&response_type=code`;
    window.location.href = instagramAuthUrl;
  };

  // Función para obtener el token de acceso con el 'code'
  const fetchAccessToken = async (code: string) => {
    const response = await fetch(
      "https://api.instagram.com/oauth/access_token",
      {
        method: "POST",
        body: new URLSearchParams({
          client_id: clientId,
          client_secret: clientSecret,
          grant_type: "authorization_code",
          redirect_uri: redirectUri,
          code,
        }),
      }
    );

    const data = await response.json();
    return data.access_token;
  };

  // Función para obtener el nombre de usuario del perfil de Instagram
  const fetchInstagramProfile = async (accessToken: string) => {
    const response = await fetch(
      `https://graph.instagram.com/me?fields=id,username&access_token=${accessToken}`
    );
    const data = await response.json();
    return data.username;
  };

  // Captura el código de la URL, obtiene el perfil y redirige
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const code = params.get("code");

    if (code) {
      fetchAccessToken(code)
        .then((accessToken) => fetchInstagramProfile(accessToken))
        .then((username) => {
          setInstagramName(username);
          // Redirige a la página de opciones y actualiza el estado con el nombre de usuario
          history.push("/opciones");
        })
        .catch((error) =>
          console.error("Error al obtener el perfil de Instagram", error)
        );
=======
  const handleDescriptionChange = (e: any) => {
    setDescription(e.target.value);
  };

  const handleSaveDescription = async () => {
    if (userData) {
      await updateUserDescription(userData.email, description);
>>>>>>> RamaKevin
    }
  };

  const handleInstagramLinkClick = () => {
    setShowInstagramAlert(true);
  };

  const handleInstagramUrlSave = async (url: string) => {
    setInstagramUrl(url);
    const username = extractInstagramUsername(url);
    setInstagramUsername(username);

    if (userData && userData.email) {
      await updateInstagramUrl(userData.email, url);
    }

    setShowInstagramAlert(false);
  };

  const extractInstagramUsername = (url: string) => {
    const username = url.split("instagram.com/")[1];
    return username ? username.replace("/", "") : null;
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user && user.email) {
        const data = await getUserData(user.email);
        if (data) {
          setUserData(data);
          setDescription(data.descripcion || "");
          setInstagramUrl(data.instagram || "");
          setInstagramUsername(extractInstagramUsername(data.instagram || ""));
        }
      }
    });
    return () => unsubscribe();
  }, []);

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
            src={userData?.photoUrl || "https://via.placeholder.com/150"} // Usar la foto de perfil si está disponible
            alt="Profile"
            className="profile-image"
          />
          {userData ? (
            <>
              <h2 className="profile-name">{userData.nombreCompleto}</h2>
              <p>{userData.carrera}</p>
            </>
          ) : (
            <p>Cargando datos del usuario o no se encontraron datos.</p>
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
              onIonChange={handleDescriptionChange}
            ></IonTextarea>
          </IonItem>
          <IonItem lines="none" className="description-counter">
            {description.length}/{maxDescriptionLength}
          </IonItem>
          <IonButton expand="block" onClick={handleSaveDescription} className="edit-button">
            Guardar
          </IonButton>
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
<<<<<<< HEAD
          <IonItem button onClick={handleInstagramLogin} />
          <IonItem button onClick={handleLinkInstagram}>
=======
          <IonItem button onClick={handleInstagramLinkClick}>
>>>>>>> RamaKevin
            <IonIcon slot="start" icon={logoInstagram} />
            <IonLabel>Vincular Instagram</IonLabel>
            {instagramUsername && <IonLabel slot="end">@{instagramUsername}</IonLabel>}
          </IonItem>

          {/* Aquí se agrega el botón para vincular Instagram */}
          <InstagramLogin />
          <IonItem button onClick={() => history.push("/gestion-suscripcion")}>
            <IonIcon slot="start" icon={card} />
            <IonLabel>Gestión suscripción</IonLabel>
          </IonItem>
          <IonItem button onClick={() => history.push("/login")}>
            <IonIcon slot="start" icon={logOut} />
            <IonLabel>Cerrar sesión</IonLabel>
          </IonItem>
        </IonList>

        <IonAlert
          isOpen={showInstagramAlert}
          onDidDismiss={() => setShowInstagramAlert(false)}
          header={"Vincular Instagram"}
          message={
            "Para obtener el enlace de tu perfil de Instagram, abre Instagram, ve a tu perfil y copia la URL que aparece en la barra de direcciones. Por ejemplo, 'https://www.instagram.com/tuusuario'"
          }
          inputs={[
            {
              name: "instagramUrl",
              type: "url",
              placeholder: "https://www.instagram.com/tuusuario",
              value: instagramUrl || "",
            },
          ]}
          buttons={[
            {
              text: "Cancelar",
              role: "cancel",
              handler: () => {
                setShowInstagramAlert(false);
              },
            },
            {
              text: "Guardar",
              handler: (data) => {
                handleInstagramUrlSave(data.instagramUrl);
              },
            },
          ]}
        />
      </IonContent>
    </IonPage>
  );
};

export default SettingsPage;
