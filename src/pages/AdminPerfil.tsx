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
  IonIcon,
  IonActionSheet,
  IonButton
} from '@ionic/react';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { camera } from 'ionicons/icons';
import '../styles/Perfil.css'; // Importamos el archivo CSS

const AdminProfilePage = () => {
  const [isEditing, setIsEditing] = useState(false);
  
  const [name, setName] = useState("Ricardo Vergara");
  const [email, setEmail] = useState("ricardov@gmail.com");
  const [contact, setContact] = useState("945645623");
  const [address, setAddress] = useState("Luis Matte 4020");
  const [showActionSheet, setShowActionSheet] = useState(false);
  const [profilePhoto, setProfilePhoto] = useState("https://image.europafm.com/clipping/cmsimages01/2022/09/28/2FAC71CF-4762-49D3-AA69-B1154B85D5D1/maria-becerra_104.jpg?crop=2457,2457,x476,y0&width=1200&height=1200&optimize=low&format=webply");

  const handleEditToggle = () => {
    setIsEditing(!isEditing);
  };

  const handlePhoneChange = (e: any) => {
    setContact(e.target.value);
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
          <IonTitle>Administrador</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent>
        <div className="profile-container">
          <img
            src={profilePhoto}
            alt="Profile"
            className="profile-image"
          />
          <IonIcon
            icon={camera}
            className="camera-icon"
            onClick={() => setShowActionSheet(true)}
          />
        </div>

        <IonItem className="personal-info-item">
          <IonLabel>Nombre:</IonLabel>
          <IonInput value={name} onIonChange={(e) => setName(e.detail.value!)} />
        </IonItem>

        <IonItem className="personal-info-item">
          <IonLabel>Correo:</IonLabel>
          <IonInput value={email} onIonChange={(e) => setEmail(e.detail.value!)} />
        </IonItem>

        <IonItem className="personal-info-item">
          <IonLabel>Contacto:</IonLabel>
          <IonInput value={contact} onIonChange={(e) => setContact(e.detail.value!)} />
        </IonItem>

        <IonItem className="personal-info-item">
          <IonLabel>Dirección:</IonLabel>
          <IonInput value={address} onIonChange={(e) => setAddress(e.detail.value!)} />
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

export default AdminProfilePage;
