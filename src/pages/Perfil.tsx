import React, { useState, useEffect } from "react";
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonBackButton,
  IonContent,
  IonItem,
  IonLabel,
  IonInput,
  IonButton,
  IonActionSheet,
  IonIcon,
} from "@ionic/react";
import { Camera, CameraResultType, CameraSource } from "@capacitor/camera";
import { camera } from "ionicons/icons";
import { onAuthStateChanged } from "firebase/auth";
import { getUserData, auth, updateProfilePhoto } from "../firebaseConfig";
import "../styles/PerfilStyles.css";

const ProfilePage = () => {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [showActionSheet, setShowActionSheet] = useState(false);
  const [profilePhoto, setProfilePhoto] = useState("");
  const [userData, setUserData] = useState<any>(null);

  const handleEditToggle = () => {
    setIsEditing(!isEditing);
  };

  const handlePhoneChange = (e: any) => {
    setPhoneNumber(e.target.value);
  };

  const handleTakePhoto = async () => {
    const image = await Camera.getPhoto({
      quality: 90,
      allowEditing: false,
      resultType: CameraResultType.DataUrl,
      source: CameraSource.Camera,
    });
    const photoDataUrl = image.dataUrl || "";
    setProfilePhoto(photoDataUrl); // Muestra la foto en la interfaz de usuario
    await updateProfilePhoto(userData.email, photoDataUrl); // Guarda la foto en Firestore
    setShowActionSheet(false);
  };

  const handleUploadPhoto = async () => {
    const image = await Camera.getPhoto({
      quality: 90,
      allowEditing: false,
      resultType: CameraResultType.DataUrl,
      source: CameraSource.Photos,
    });
    const photoDataUrl = image.dataUrl || "";
    setProfilePhoto(photoDataUrl); // Muestra la foto en la interfaz de usuario
    await updateProfilePhoto(userData.email, photoDataUrl); // Guarda la foto en Firestore
    setShowActionSheet(false);
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user && user.email) {
        const data = await getUserData(user.email);
        if (data) {
          setUserData(data);
          setPhoneNumber(data.telefono || "");
          setProfilePhoto(data.photoUrl || "https://via.placeholder.com/150"); // Muestra la foto si existe en Firestore
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
          <IonTitle>Perfil de usuario</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent>
        <div className="profile-container">
          <img
            src={profilePhoto}
            alt="Profile"
            className="profile-photo"
          />
          <IonIcon
            icon={camera}
            className="camera-icon"
            onClick={() => setShowActionSheet(true)}
          />
          <h2 className="profile-name">{userData?.nombreCompleto || "Nombre del Usuario"}</h2>
          <p className="profile-role">{userData?.carrera || "Carrera"}</p>
        </div>

        <IonItem >
          <IonLabel className="section-label">Datos Personales</IonLabel>
        </IonItem>
        <hr />

        <IonItem className="personal-info-item">
          <IonLabel>Nombre:</IonLabel>
          <p>{userData?.nombreCompleto || "Nombre del Usuario"}</p>
        </IonItem>

        <IonItem className="personal-info-item">
          <IonLabel>Correo:</IonLabel>
          <p>{userData?.email || "Correo no disponible"}</p>
        </IonItem>

        <IonItem className="personal-info-item">
          <IonLabel>Carrera:</IonLabel>
          <p>{userData?.carrera || "Carrera no disponible"}</p>
        </IonItem>

        <IonItem className="personal-info-item">
          <IonLabel>Número:</IonLabel>
          {isEditing ? (
            <IonInput value={phoneNumber} onIonChange={handlePhoneChange} />
          ) : (
            <p>{phoneNumber || "Número no disponible"}</p>
          )}
        </IonItem>
        
        <IonItem className="personal-info-item">
          <IonLabel>Género:</IonLabel>
          <p>{userData?.genero || "Género no disponible"}</p>
        </IonItem>
        
        <IonButton expand="block" onClick={handleEditToggle} className="edit-button">
          {isEditing ? "Guardar" : "Editar"}
        </IonButton>

        <IonActionSheet
          isOpen={showActionSheet}
          onDidDismiss={() => setShowActionSheet(false)}
          buttons={[
            {
              text: 'Tomar Foto',
              handler: handleTakePhoto
            },
            {
              text: 'Subir desde Galería',
              handler: handleUploadPhoto
            },
            {
              text: 'Cancelar',
              role: 'cancel'
            }
          ]}
        />
      </IonContent>
    </IonPage>
  );
};

export default ProfilePage;
