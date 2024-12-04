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
  IonAlert,
} from "@ionic/react";
import { Camera, CameraResultType, CameraSource } from "@capacitor/camera";
import { camera, logOut } from "ionicons/icons";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "../firebaseConfig";
import { getAdminData, updateAdminProfilePhoto } from "../firebaseConfig";
import "../styles/PerfilStyles.css";
import { doc, getFirestore, updateDoc } from "firebase/firestore";

const AdminProfilePage = () => {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [showActionSheet, setShowActionSheet] = useState(false);
  const [profilePhoto, setProfilePhoto] = useState("");
  const [userData, setUserData] = useState<any>(null);
  const [docId, setDocId] = useState<string>("");
  const [showLogoutAlert, setShowLogoutAlert] = useState(false); // Estado para el IonAlert

  const handleEditToggle = async () => {
    if (isEditing) {
      // Guardar cambios en Firestore
      try {
        const db = getFirestore();
        const userDocRef = doc(db, "Administrador", docId);

        await updateDoc(userDocRef, {
          telefono: phoneNumber,
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

  const handleTakePhoto = async () => {
    try {
      const image = await Camera.getPhoto({
        quality: 90,
        allowEditing: false,
        resultType: CameraResultType.DataUrl,
        source: CameraSource.Camera,
      });

      if (image.dataUrl && userData?.email) {
        await updateAdminProfilePhoto(userData.email, image.dataUrl);
        setProfilePhoto(image.dataUrl);
        alert("Foto de perfil actualizada correctamente.");
      }
    } catch (error) {
      console.error("Error al tomar la foto:", error);
      alert("Hubo un problema al tomar la foto. Inténtalo nuevamente.");
    } finally {
      setShowActionSheet(false);
    }
  };

  const handleUploadPhoto = async () => {
    try {
      const image = await Camera.getPhoto({
        quality: 90,
        allowEditing: false,
        resultType: CameraResultType.DataUrl,
        source: CameraSource.Photos,
      });

      if (image.dataUrl && userData?.email) {
        await updateAdminProfilePhoto(userData.email, image.dataUrl);
        setProfilePhoto(image.dataUrl);
        alert("Foto de perfil actualizada correctamente.");
      }
    } catch (error) {
      console.error("Error al subir la foto:", error);
      alert("Hubo un problema al subir la foto. Inténtalo nuevamente.");
    } finally {
      setShowActionSheet(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth); // Cerrar sesión en Firebase
      window.location.href = "/login"; // Redirigir al login
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
      alert("Hubo un problema al cerrar sesión. Inténtalo nuevamente.");
    }
  };

  useEffect(() => {
    const fetchAdminData = async (userEmail: string) => {
      const data = await getAdminData(userEmail);
      if (data) {
        setDocId(data.id);
        setUserData(data);
        setPhoneNumber(data.telefono || "");
        setProfilePhoto(data.photoUrl || "https://via.placeholder.com/150");
      }
    };

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user && user.email) {
        fetchAdminData(user.email);
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
          <IonTitle>Perfil Administrador</IonTitle>
          <IonButtons slot="end">
            <IonButton onClick={() => setShowLogoutAlert(true)}>
              <IonIcon icon={logOut} />
            </IonButton>
          </IonButtons>
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
          <h2 className="profile-name">{userData?.nombre || "Nombre del Administrador"}</h2>
        </div>

        <IonItem>
          <IonLabel className="section-label">Datos Personales</IonLabel>
        </IonItem>
        <hr />

        <IonItem className="personal-info-item">
          <IonLabel>Nombre:</IonLabel>
          <p>{userData?.nombre || "Nombre no disponible"}</p>
        </IonItem>

        <IonItem className="personal-info-item">
          <IonLabel>Correo:</IonLabel>
          <p>{userData?.email || "Correo no disponible"}</p>
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

        <IonAlert
          isOpen={showLogoutAlert}
          onDidDismiss={() => setShowLogoutAlert(false)}
          header={"Cerrar sesión"}
          message={"¿Estás seguro de que deseas cerrar sesión?"}
          buttons={[
            {
              text: "Cancelar",
              role: "cancel",
            },
            {
              text: "Cerrar sesión",
              handler: handleLogout,
            },
          ]}
        />
      </IonContent>
    </IonPage>
  );
};

export default AdminProfilePage;
