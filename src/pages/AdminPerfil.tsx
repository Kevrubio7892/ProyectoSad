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
  IonButton,
  IonAlert
} from '@ionic/react';
import { useHistory } from 'react-router-dom';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { camera, logOut } from 'ionicons/icons';
import '../styles/PerfilStyles.css';

const AdminProfilePage = () => {
  const history = useHistory();
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState("Ricardo Vergara");
  const [email, setEmail] = useState("ricardov@gmail.com");
  const [contact, setContact] = useState("945645623");
  const [address, setAddress] = useState("Luis Matte 4020");
  const [showActionSheet, setShowActionSheet] = useState(false);
  const [profilePhoto, setProfilePhoto] = useState("https://image.europafm.com/clipping/cmsimages01/2022/09/28/2FAC71CF-4762-49D3-AA69-B1154B85D5D1/maria-becerra_104.jpg?crop=2457,2457,x476,y0&width=1200&height=1200&optimize=low&format=webply");
  const [showLogoutAlert, setShowLogoutAlert] = useState(false); // Estado para mostrar la alerta

  const handleEditToggle = () => {
    setIsEditing(!isEditing);
  };
  
  const handleEmailChange= (e: any) => {
    setEmail(e.target.value);
  };

  const handlePhoneChange = (e: any) => {
    setContact(e.target.value);
  };

  const handleAddressChange= (e: any) => {
    setAddress(e.target.value);
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

  const handleLogout = () => {
    setShowLogoutAlert(true); // Mostramos la alerta de confirmación
  };

  const confirmLogout = () => {
    setShowLogoutAlert(false); // Cerramos la alerta
    history.push('/login'); // Redirigimos al usuario a la pantalla de login
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar className="nav-container" color="danger">
          <IonButtons slot="start">
            <IonBackButton />
          </IonButtons>
          <IonTitle>Administrador</IonTitle>
          <IonButtons slot="end">
            <IonButton onClick={handleLogout}>
              <IonIcon icon={logOut} slot="icon-only" />
            </IonButton>
          </IonButtons>
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
          <IonLabel>Nombre: </IonLabel>
          <p>{name}</p>         
        </IonItem>

        <IonItem className="personal-info-item">
          <IonLabel>Correo:</IonLabel>
          {isEditing ? (
            <IonInput value={email} onIonChange={handlePhoneChange} />
          ) : (
            <p>{email}</p> 
          )}
        </IonItem>

        <IonItem className="personal-info-item">
          <IonLabel>Contacto:</IonLabel>
          {isEditing ? (
            <IonInput value={contact} onIonChange={handleEmailChange} />
          ) : (
            <p>{contact}</p> 
          )}
        </IonItem>

        <IonItem className="personal-info-item">
          <IonLabel>Dirección:</IonLabel>
          {isEditing ? (
            <IonInput value={address} onIonChange={handleAddressChange} />
          ) : (
            <p>{address}</p> 
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

        {/* Alerta de confirmación de cierre de sesión */}
        <IonAlert
          isOpen={showLogoutAlert}
          onDidDismiss={() => setShowLogoutAlert(false)}
          header={'Confirmación'}
          message={'¿Desea cerrar su sesión?'}
          buttons={[
            {
              text: 'Cancelar',
              role: 'cancel',
              handler: () => setShowLogoutAlert(false)
            },
            {
              text: 'Aceptar',
              handler: confirmLogout
            }
          ]}
        />
      </IonContent>
    </IonPage>
  );
};

export default AdminProfilePage;
