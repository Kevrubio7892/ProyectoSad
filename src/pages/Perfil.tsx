import React, { useState } from 'react';
import { IonPage, IonHeader, IonToolbar, IonTitle, IonButtons, IonBackButton, IonContent, IonItem, IonLabel, IonInput, IonButton } from '@ionic/react';

const ProfilePage = () => {
  const [phoneNumber, setPhoneNumber] = useState("+569 30597502");
  const [isEditing, setIsEditing] = useState(false);

  const handleEditToggle = () => {
    setIsEditing(!isEditing);
  };

  const handlePhoneChange = (e: any) => {
    setPhoneNumber(e.target.value);
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
        <div style={{ textAlign: 'center', padding: '20px' }}>
          <img
            src="https://image.europafm.com/clipping/cmsimages01/2022/09/28/2FAC71CF-4762-49D3-AA69-B1154B85D5D1/maria-becerra_104.jpg?crop=2457,2457,x476,y0&width=1200&height=1200&optimize=low&format=webply"
            alt="Profile"
            style={{ borderRadius: '50%', width: '100px', height: '100px' }}
          />
          <h2 style={{ fontWeight: 'bold', margin: '10px 0 0' }}>Jenny Nails</h2>
          <p style={{ fontSize: '16px' }}>Técnico vetenrinario</p>
        </div>

        <IonItem lines="none">
          <IonLabel style={{ fontWeight: 'bold' }}>Datos Personales</IonLabel>
        </IonItem>
        <hr />

        <IonItem>
          <IonLabel>Nombre:</IonLabel>
          <p>María de los Ángeles Becerra</p>
        </IonItem>

        <IonItem>
          <IonLabel>Correo:</IonLabel>
          <p>Mar.Becerra@duacap.cl</p>
        </IonItem>

        <IonItem>
          <IonLabel>Carrera:</IonLabel>
          <p>Técnico Enfermería</p>
        </IonItem>

        <IonItem>
          <IonLabel>Numero:</IonLabel>
          {isEditing ? (
            <IonInput value={phoneNumber} onIonChange={handlePhoneChange} />
          ) : (
            <p>{phoneNumber}</p>
          )}
        </IonItem>

        <IonButton expand="block" onClick={handleEditToggle}>
          {isEditing ? "Guardar" : "Editar"}
        </IonButton>
      </IonContent>
    </IonPage>
  );
};

export default ProfilePage;
