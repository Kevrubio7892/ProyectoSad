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
  IonSelect,
  IonSelectOption,
  IonButton,
  IonActionSheet,
  IonIcon,
} from "@ionic/react";
import { Camera, CameraResultType, CameraSource } from "@capacitor/camera";
import { camera } from "ionicons/icons";
import { onAuthStateChanged } from "firebase/auth";
import {
  getFirestore,
  collection,
  query,
  getDocs,
  doc,
  updateDoc,
  where,
} from "firebase/firestore";
import { auth } from "../firebaseConfig";
import "../styles/PerfilStyles.css";

const ProfilePage = () => {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [career, setCareer] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [showActionSheet, setShowActionSheet] = useState(false);
  const [profilePhoto, setProfilePhoto] = useState("");
  const [userData, setUserData] = useState<any>(null);
  const [docId, setDocId] = useState<string>("");
  const [availableCareers, setAvailableCareers] = useState<string[]>([]); // Opciones de carreras

  const handleEditToggle = async () => {
    if (isEditing) {
      // Guardar cambios en Firestore
      try {
        const db = getFirestore();
        const userDocRef = doc(db, "Estudiantes", docId);

        await updateDoc(userDocRef, {
          telefono: phoneNumber,
          carrera: career,
        });

        alert("Información actualizada correctamente.");
      } catch (error) {
        console.error("Error al actualizar los datos:", error);
        alert("Hubo un problema al actualizar los datos. Inténtalo nuevamente.");
      }
    }

    setIsEditing(!isEditing); // Alternar entre edición y visualización
  };

  const handlePhoneChange = (e: any) => {
    setPhoneNumber(e.target.value);
  };

  const handleCareerChange = (value: string) => {
    setCareer(value);
  };

  const handleTakePhoto = async () => {
    const image = await Camera.getPhoto({
      quality: 90,
      allowEditing: false,
      resultType: CameraResultType.DataUrl,
      source: CameraSource.Camera,
    });
    const photoDataUrl = image.dataUrl || "";

    // Actualizar la foto en Firestore
    if (docId) {
      const db = getFirestore();
      const userDocRef = doc(db, "Estudiantes", docId);

      try {
        await updateDoc(userDocRef, { photoUrl: photoDataUrl });
        setProfilePhoto(photoDataUrl);
        alert("Foto de perfil actualizada correctamente.");
      } catch (error) {
        console.error("Error al actualizar la foto:", error);
        alert("Hubo un problema al actualizar la foto. Inténtalo nuevamente.");
      }
    }

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

    // Actualizar la foto en Firestore
    if (docId) {
      const db = getFirestore();
      const userDocRef = doc(db, "Estudiantes", docId);

      try {
        await updateDoc(userDocRef, { photoUrl: photoDataUrl });
        setProfilePhoto(photoDataUrl);
        alert("Foto de perfil actualizada correctamente.");
      } catch (error) {
        console.error("Error al actualizar la foto:", error);
        alert("Hubo un problema al actualizar la foto. Inténtalo nuevamente.");
      }
    }

    setShowActionSheet(false);
  };

  useEffect(() => {
    const fetchCareers = async () => {
      try {
        const db = getFirestore();
        const carrerasRef = collection(db, "Carreras");
        const querySnapshot = await getDocs(carrerasRef);

        const careersList = querySnapshot.docs.map(
          (doc) => doc.data().nombreCarrera
        ); // Suponiendo que cada documento tiene un campo "nombreCarrera"
        setAvailableCareers(careersList);
      } catch (error) {
        console.error("Error al obtener las carreras:", error);
      }
    };

    const fetchUserData = async (userEmail: string) => {
      try {
        const db = getFirestore();
        const estudiantesRef = collection(db, "Estudiantes");
        const q = query(estudiantesRef, where("email", "==", userEmail));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
          const doc = querySnapshot.docs[0];
          setDocId(doc.id); // Guarda el ID del documento
          const data = doc.data();
          setUserData(data);
          setPhoneNumber(data.telefono || "");
          setCareer(data.carrera || "");
          setProfilePhoto(data.photoUrl || "https://via.placeholder.com/150");
        }
      } catch (error) {
        console.error("Error al obtener los datos del usuario:", error);
      }
    };

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user && user.email) {
        fetchUserData(user.email);
        fetchCareers(); // Cargar las carreras disponibles
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
          <img src={profilePhoto} alt="Profile" className="profile-photo" />
          <IonIcon
            icon={camera}
            className="camera-icon"
            onClick={() => setShowActionSheet(true)}
          />
          <h2 className="profile-name">{userData?.nombreCompleto || "Nombre del Usuario"}</h2>
        </div>

        <IonItem>
          <IonLabel className="section-label">Datos Personales</IonLabel>
        </IonItem>
        <hr />

        <IonItem className="personal-info-item">
          <IonLabel>Nombre:</IonLabel>
          <p>{userData?.nombreCompleto || "Nombre no disponible"}</p>
        </IonItem>

        <IonItem className="personal-info-item">
          <IonLabel>Correo:</IonLabel>
          <p>{userData?.email || "Correo no disponible"}</p>
        </IonItem>

        <IonItem className="personal-info-item">
          <IonLabel>Carrera:</IonLabel>
          {isEditing ? (
            <IonSelect
              value={career}
              onIonChange={(e) => handleCareerChange(e.detail.value)}
              placeholder="Seleccionar carrera"
            >
              {availableCareers.map((career, index) => (
                <IonSelectOption key={index} value={career}>
                  {career}
                </IonSelectOption>
              ))}
            </IonSelect>
          ) : (
            <p>{career || "Carrera no disponible"}</p>
          )}
        </IonItem>

        <IonItem className="personal-info-item">
          <IonLabel>Número:</IonLabel>
          {isEditing ? (
            <IonInput
              value={phoneNumber}
              onIonChange={handlePhoneChange}
              placeholder="Editar teléfono"
            />
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
              text: "Tomar Foto",
              handler: handleTakePhoto,
            },
            {
              text: "Subir desde Galería",
              handler: handleUploadPhoto,
            },
            {
              text: "Cancelar",
              role: "cancel",
            },
          ]}
        />
      </IonContent>
    </IonPage>
  );
};

export default ProfilePage;
