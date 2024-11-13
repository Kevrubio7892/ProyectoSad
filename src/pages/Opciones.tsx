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
import { useHistory } from "react-router";
import { onAuthStateChanged } from "firebase/auth";
import { getUserData, auth, updateUserDescription, updateInstagramUrl } from "../firebaseConfig";
import "../styles/Opciones.css";

const SettingsPage: React.FC = () => {
  const [description, setDescription] = useState("");
  const [instagramUrl, setInstagramUrl] = useState<string | null>(null);
  const [instagramUsername, setInstagramUsername] = useState<string | null>(null);
  const [userData, setUserData] = useState<any>(null);
  const [showInstagramAlert, setShowInstagramAlert] = useState(false);
  const maxDescriptionLength = 100;
  const history = useHistory();

  const handleDescriptionChange = (e: any) => {
    setDescription(e.target.value);
  };

  const handleSaveDescription = async () => {
    if (userData) {
      await updateUserDescription(userData.email, description);
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
          <IonItem button onClick={handleInstagramLinkClick}>
            <IonIcon slot="start" icon={logoInstagram} />
            <IonLabel>Vincular Instagram</IonLabel>
            {instagramUsername && <IonLabel slot="end">@{instagramUsername}</IonLabel>}
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
