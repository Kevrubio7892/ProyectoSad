import React, { useState, useEffect } from 'react';
import { 
  IonPage, 
  IonContent, 
  IonButton, 
  IonInput, 
  IonText, 
  IonLoading, 
  IonHeader,
  IonToolbar,
  IonButtons,
  IonBackButton,
  IonTitle
} from '@ionic/react';
import { useHistory } from 'react-router-dom';
import { getFirestore, doc, updateDoc, collection, where, query, getDocs } from "firebase/firestore";
import '../styles/ForgotPassStyles.css';

const ResetPasswordForm: React.FC = () => {
  const [formData, setFormData] = useState({
    email: '',
    contrasena: '',
    confirmContrasena: '',
  });
  const [formError, setFormError] = useState<string>('');
  const [showLoading, setShowLoading] = useState<boolean>(false);
  const history = useHistory();

  const handleInputChange = (e: any) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const validateForm = () => {
    const { email, contrasena, confirmContrasena } = formData;

    if (!email || !contrasena || !confirmContrasena) {
      setFormError('Todos los campos son obligatorios.');
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setFormError('Por favor, ingrese un correo electrónico válido.');
      return false;
    }

    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;
    if (!passwordRegex.test(contrasena)) {
      setFormError('La contraseña debe tener al menos 8 caracteres, incluir al menos una letra y un número.');
      return false;
    }

    if (contrasena !== confirmContrasena) {
      setFormError('Las contraseñas no coinciden.');
      return false;
    }

    setFormError('');
    return true;
  };

  const handleFormSubmit = async () => {
    if (!validateForm()) return;

    setShowLoading(true);

    try {
      const db = getFirestore();
      const estudiantesRef = collection(db, "Estudiantes");
      const q = query(estudiantesRef, where("email", "==", formData.email));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        setFormError('El correo no está registrado.');
        setShowLoading(false);
        return;
      }

      // Obtenemos el ID del documento
      const docId = querySnapshot.docs[0].id;

      // Actualizamos el campo confirmContrasena en Firestore
      const studentRef = doc(db, "Estudiantes", docId);
      await updateDoc(studentRef, { confirmContrasena: formData.contrasena });

      alert('Contraseña actualizada exitosamente.');
      history.push('/login');
    } catch (error) {
      console.error("Error al actualizar la contraseña: ", error);
      setFormError('Hubo un problema al actualizar la contraseña. Intente nuevamente.');
    } finally {
      setShowLoading(false);
    }
  };

  // Limpia el formulario al salir de la vista
  useEffect(() => {
    return () => {
      setFormData({
        email: '',
        contrasena: '',
        confirmContrasena: '',
      });
      setFormError('');
    };
  }, []);

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar color="danger">
          <IonButtons slot="start">
            <IonBackButton />
          </IonButtons>
          <IonTitle>Recuperar contraseña</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="forgot-container" fullscreen>
        <div className="form-container">
          <IonInput
            className="input"
            label="Correo electrónico"
            fill="solid"
            labelPlacement="floating"
            placeholder="Ingresa tu correo"
            name="email"
            value={formData.email}
            onIonChange={handleInputChange}
            type="email"
          />
          <IonInput
            className="input"
            label="Nueva Contraseña"
            fill="solid"
            labelPlacement="floating"
            placeholder="Mínimo 8 caracteres, al menos una letra y un número"
            name="contrasena"
            value={formData.contrasena}
            onIonChange={handleInputChange}
            type="password"
          />
          <IonInput
            className="input"
            label="Confirmar Contraseña"
            fill="solid"
            labelPlacement="floating"
            placeholder="Confirma tu contraseña"
            name="confirmContrasena"
            value={formData.confirmContrasena}
            onIonChange={handleInputChange}
            type="password"
          />

          {formError && <IonText color="danger" className="error-text">{formError}</IonText>}

          <IonButton fill="clear" className="login-button" onClick={handleFormSubmit}>
            <IonText className="ion-btn-text">Actualizar Contraseña</IonText>
          </IonButton>
        </div>

        <IonLoading
          className="custom-loading" 
          isOpen={showLoading}
          message={'Actualizando contraseña...'}
          onDidDismiss={() => setShowLoading(false)}
        />
      </IonContent>
    </IonPage>
  );
};

export default ResetPasswordForm;
