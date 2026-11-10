import React, { useState } from 'react';
import { IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonButton, IonImg, IonInput } from '@ionic/react';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { db } from '../services/FireStoreServices';
import { doc, setDoc } from 'firebase/firestore';

const ProfilePhoto: React.FC = () => {
  const [photo, setPhoto] = useState<string | undefined>(undefined);
  const [name, setName] = useState<string>("");

  const takePhoto = async () => {
    try {
      const image = await Camera.getPhoto({
        quality: 90,
        allowEditing: false,
        resultType: CameraResultType.DataUrl,
        source: CameraSource.Camera, // Usa CameraSource.Photos si prefieres la galería
      });

      setPhoto(image.dataUrl);
    } catch (error) {
      console.error('Error al tomar la foto:', error);
    }
  };

  const savePhotoToFirestore = async () => {
    if (!name.trim() || !photo) {
      alert('Por favor introduce un nombre y toma una foto.');
      return;
    }

    try {
      // Crear un documento en la colección "Estudiantes"
      const studentDoc = doc(db, 'Estudiantes', name);
      await setDoc(studentDoc, { photoUrl: photo });

      alert('Foto guardada con éxito en Firestore.');
    } catch (error) {
      console.error('Error al guardar en Firestore:', error);
      alert('Error al guardar la foto.');
    }
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Seleccionar Foto de Perfil</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        <div style={{ textAlign: 'center' }}>
          {/* Foto actual o placeholder */}
          <IonImg
            src={photo || 'https://via.placeholder.com/150'}
            style={{
              width: 150,
              height: 150,
              borderRadius: '50%',
              border: '2px solid #ccc',
              margin: '20px auto',
            }}
          />
          {/* Botón para tomar la foto */}
          <IonButton expand="block" onClick={takePhoto}>
            Tomar Foto
          </IonButton>
          {/* Campo de entrada para el nombre */}
          <IonInput
            placeholder="Introduce tu nombre"
            value={name}
            onIonChange={(e) => setName(e.detail.value!)}
            style={{ marginTop: '20px' }}
          />
          {/* Botón para guardar la foto */}
          <IonButton expand="block" color="success" onClick={savePhotoToFirestore}>
            Guardar Foto en Firestore
          </IonButton>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default ProfilePhoto;
