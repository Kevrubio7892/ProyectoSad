import React, { useState } from 'react';
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
  IonIcon
} from '@ionic/react';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { camera } from 'ionicons/icons';
import '../styles/Perfil.css';  // Importamos el archivo CSS

const ProfilePage = () => {
  const [phoneNumber, setPhoneNumber] = useState("+569 30597502");
  const [isEditing, setIsEditing] = useState(false);
  const [showActionSheet, setShowActionSheet] = useState(false);
  const [profilePhoto, setProfilePhoto] = useState("https://image.europafm.com/clipping/cmsimages01/2022/09/28/2FAC71CF-4762-49D3-AA69-B1154B85D5D1/maria-becerra_104.jpg?crop=2457,2457,x476,y0&width=1200&height=1200&optimize=low&format=webply");

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
      source: CameraSource.Camera
    });
    setProfilePhoto(image.dataUrl || "");
    setShowActionSheet(false);
  };

  const handleUploadPhoto = async () => {
    const image = await Camera.getPhoto({
      quality: 90,
      allowEditing: false,
      resultType: CameraResultType.DataUrl,
      source: CameraSource.Photos
    });
    setProfilePhoto(image.dataUrl || "");
    setShowActionSheet(false);
  };

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
          <h2 className="profile-name">Jenny Nails</h2>
          <p className="profile-role">Técnico veterinario</p>
        </div>

        <IonItem >
          <IonLabel className="section-label">Datos Personales</IonLabel>
        </IonItem>
        <hr />


        <IonItem className="personal-info-item">
          <IonLabel>Nombre:</IonLabel>
          <p>María de los Ángeles Becerra</p>
        </IonItem>

        <IonItem className="personal-info-item">
          <IonLabel>Correo:</IonLabel>
          <p>Mar.Becerra@duacap.cl</p>
        </IonItem>

        <IonItem className="personal-info-item">
          <IonLabel>Carrera:</IonLabel>
          <p>Técnico Enfermería</p>
        </IonItem>


        <IonItem className="personal-info-item">
          <IonLabel>Número:</IonLabel>
          {isEditing ? (
            <IonInput value={phoneNumber} onIonChange={handlePhoneChange} />
          ) : (
            <p>{phoneNumber}</p>
          )}
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
