import React, { useState } from 'react';
import { IonPage, IonContent, IonButton, IonInput, IonSelect, IonSelectOption, IonText, IonImg, IonLoading } from '@ionic/react';
import { useHistory } from 'react-router-dom';
import '../styles/Login.css';
import logo from '../assets/logo.png';
import logo_SAD from '../assets/logo_SAD.png';
import { db, auth, googleLogin } from '../firebaseConfig';
import { addDoc, collection } from "firebase/firestore";

const RegisterFormGoogle: React.FC = () => {
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    anioEstudio: '',
    carrera: '',
    genero: '',
    sedeAcademica: 'Duoc UC Puente Alto' // Valor fijo de la sede
  });
  const [formError, setFormError] = useState<string>('');
  const [showLoading, setShowLoading] = useState<boolean>(false); 
  const history = useHistory();

  // Lista de carreras para el combo box
  const carreras = [
    "Ingeniería en Informática",
    "Ingeniería en Marketing",
    "Administración de Empresas",
    "Contabilidad",
    "Psicología",
    "Derecho",
    "Medicina",
    "Ingeniería Civil",
    "Arquitectura",
    "Diseño Gráfico"
  ];

  const handleInputChange = (e: any) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleFormSubmit = async () => {
    if (Object.values(formData).some((value) => value === '')) {
      setFormError('Por favor, complete todos los campos');
      return;
    }

    setShowLoading(true);

    try {
      const formDataToSubmit = {
        ...formData,
        anioEstudio: parseInt(formData.anioEstudio) || 0  // Convierte a número o usa 0 si no es válido
      };

      const docRef = await addDoc(collection(db, "estudiante"), formDataToSubmit);
      console.log("Documento escrito con ID: ", docRef.id);
      
      alert('Datos enviados correctamente');
      history.push('/tarjetas');
    } catch (error) {
      console.error("Error al guardar los datos en Firestore: ", error);
      setFormError('Hubo un problema al enviar los datos. Intente nuevamente.');
    } finally {
      setShowLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setShowLoading(true);
    try {
      const result = await googleLogin();
      if (result) {
        const user = auth.currentUser;
        if (user) {
          // Almacena la información del usuario en Firestore si es necesario
          await addDoc(collection(db, "estudiante"), {
            uid: user.uid,
            nombre: user.displayName,
            email: user.email,
            fotoPerfil: user.photoURL,
            provider: "google",
            creadoEn: new Date()
          });

          alert("Inicio de sesión exitoso");
          history.push('/tarjetas');
        }
      }
    } catch (error) {
      console.error("Error al iniciar sesión con Google:", error);
      setFormError('Error al iniciar sesión con Google');
    } finally {
      setShowLoading(false);
    }
  };

  return (
    <IonPage>
      <IonContent className="login-content" fullscreen>
        <IonImg src={logo} className="background-logo" />
        <IonImg src={logo_SAD} className="background-logo-sad" />

        <div className="form-container">
          <IonInput
            className="input"
            label="Nombre"
            fill="solid"
            labelPlacement="floating"
            placeholder="Ingresa tu nombre"
            name="nombre"
            value={formData.nombre}
            onIonChange={handleInputChange}
          />
          <IonInput
            className="input"
            label="Apellido"
            fill="solid"
            labelPlacement="floating"
            placeholder="Ingresa tu apellido"
            name="apellido"
            value={formData.apellido}
            onIonChange={handleInputChange}
          />
          <IonInput
            className="input"
            label="Año de Estudio"
            fill="solid"
            labelPlacement="floating"
            placeholder="Ingresa tu año de estudio"
            name="anioEstudio"
            value={formData.anioEstudio}
            onIonChange={handleInputChange}
            type="number"  // Asegura que solo se ingresen números
          />
          
          {/* Combo box para seleccionar una carrera */}
          <IonSelect
            className="input"
            label="Carrera"
            labelPlacement="floating"
            placeholder="Selecciona tu carrera"
            name="carrera"
            value={formData.carrera}
            onIonChange={handleInputChange}
          >
            {carreras.map((carrera, index) => (
              <IonSelectOption key={index} value={carrera}>
                {carrera}
              </IonSelectOption>
            ))}
          </IonSelect>

          <IonSelect
            className="input"
            label="Género"
            labelPlacement="floating"
            value={formData.genero}
            name="genero"
            onIonChange={handleInputChange}
          >
            <IonSelectOption value="masculino">Masculino</IonSelectOption>
            <IonSelectOption value="femenino">Femenino</IonSelectOption>
            <IonSelectOption value="otro">Otro</IonSelectOption>
          </IonSelect>

          {/* Campo fijo para Sede Académica */}
          <IonInput
            className="input"
            label="Sede Académica"
            fill="solid"
            labelPlacement="floating"
            value={formData.sedeAcademica}
            readonly
          />

          {formError && <IonText color="danger" className="error-text">{formError}</IonText>}

          <IonButton fill="clear" className="login-button" onClick={handleFormSubmit}>
            <IonText className="ion-btn-text">Enviar</IonText>
          </IonButton>

          {/* Botón para iniciar sesión con Google */}
          <IonButton fill="clear" className="login-button" onClick={handleGoogleLogin}>
            <IonText className="ion-btn-text">Iniciar sesión con Google</IonText>
          </IonButton>
        </div>

        <IonLoading
          className="custom-loading" 
          isOpen={showLoading}
          message={'Guardando datos...'}
          onDidDismiss={() => setShowLoading(false)}
        />
      </IonContent>
    </IonPage>
  );
};

export default RegisterFormGoogle;
