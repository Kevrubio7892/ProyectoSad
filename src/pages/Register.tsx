import React, { useState, useEffect } from 'react';
import { 
  IonPage, 
  IonContent, 
  IonButton, 
  IonInput, 
  IonSelect, 
  IonSelectOption, 
  IonText, 
  IonImg, 
  IonLoading 
} from '@ionic/react';
import { useHistory } from 'react-router-dom';
import '../styles/LoginStyles.css';
import logo from '../assets/logo.png';
import logo_SAD from '../assets/logo_SAD.png';
import { registerUser } from '../firebaseConfig'; // Para autenticación en Firebase
import { registerEstudiante, getCarreras, getGeneros } from '../services/FireStoreServices';
import { getAuth, fetchSignInMethodsForEmail } from "firebase/auth";
const RegisterForm: React.FC = () => {
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    anioEstudio: '',
    carrera: '',
    genero: '',
    sedeAcademica: 'Duoc UC Puente Alto',
    fechaNacimiento: '',
    telefono: '',
    email: '',
    contrasena: '',
    confirmContrasena: '',
  });
  const [formError, setFormError] = useState<string>('');
  const [showLoading, setShowLoading] = useState<boolean>(false);
  const [carreras, setCarreras] = useState<string[]>([]);
  const [generos, setGeneros] = useState<string[]>([]);
  const history = useHistory();

  useEffect(() => {
    const fetchData = async () => {
      const carrerasFromFirestore = await getCarreras();
      setCarreras(carrerasFromFirestore);
      
      const generosFromFirestore = await getGeneros();
      setGeneros(generosFromFirestore);
    };
    fetchData();
  }, []);

  const handleInputChange = (e: any) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const validateForm = async () => {
    const { email, contrasena, confirmContrasena, ...otherFields } = formData;
    let isValid = true;
  
    // Validar que ningún campo quede vacío
    for (const [key, value] of Object.entries({ ...otherFields, email, contrasena, confirmContrasena })) {
      if (value.trim() === '') {
        setFormError(`El campo ${key} no puede estar vacío.`);
        isValid = false;
        return isValid; // Salir en cuanto encuentre un campo vacío
      }
    }
  
    // Validar formato de correo (estándar)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setFormError('Por favor, ingrese un correo electrónico válido.');
      isValid = false;
      return isValid;
    }
  
    // Verificar si el correo ya está registrado
    const auth = getAuth();
    try {
      const signInMethods = await fetchSignInMethodsForEmail(auth, email);
      if (signInMethods.length > 0) {
        setFormError('El correo ya está registrado en la aplicación.');
        isValid = false;
        return isValid;
      }
    } catch (error) {
      console.error("Error al verificar el correo: ", error);
      setFormError('Hubo un problema al verificar el correo. Intente nuevamente.');
      isValid = false;
      return isValid;
    }
  
    // Validar contraseña (mínimo 8 caracteres, al menos una letra y un número)
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;
    if (!passwordRegex.test(contrasena)) {
      setFormError('La contraseña debe tener al menos 8 caracteres, incluir al menos una letra y un número.');
      isValid = false;
      return isValid;
    }
  
    // Validar confirmación de contraseña
    if (contrasena !== confirmContrasena) {
      setFormError('Las contraseñas no coinciden');
      isValid = false;
      return isValid;
    }
  
    return isValid;
  };
  
  

  const handleFormSubmit = async () => {
    if (!validateForm()) return;

    setShowLoading(true);

    try {
      // Registro en Firebase Authentication
      const success = await registerUser(formData.email, formData.contrasena);
      if (!success) {
        setFormError('Error en el registro. Intente nuevamente.');
        return;
      }

      // Guardar información adicional en Firestore
      const formDataToSubmit = {
        nombreCompleto: `${formData.nombre} ${formData.apellido}`,
        anioEstudio: parseInt(formData.anioEstudio) || 0,
        carrera: formData.carrera,
        genero: formData.genero,
        sedeAcademica: formData.sedeAcademica,
        fechaNacimiento: formData.fechaNacimiento,
        fechaRegistro: new Date().toISOString(),
        telefono: formData.telefono,
        email: formData.email,
        confirmContrasena: formData.contrasena
      };

      const docId = await registerEstudiante(formDataToSubmit);
      console.log("Estudiante registrado con ID: ", docId);

      alert('Registro exitoso');
      history.push('/login'); // Redirigir a la página de inicio de sesión
    } catch (error) {
      console.error("Error al guardar los datos en Firestore: ", error);
      setFormError('Hubo un problema al enviar los datos. Intente nuevamente.');
    } finally {
      setShowLoading(false);
    }
  };

  return (
    <IonPage>
      <IonContent className="login-content" fullscreen>
        <IonImg src={logo} className="background-logo" />
        <IonImg src={logo_SAD} className="bg-logo-sad-reg" />

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
            type="number"
          />
          <IonInput
            className="input"
            label="Fecha de Nacimiento"
            fill="solid"
            labelPlacement="floating"
            placeholder="Ingresa tu fecha de nacimiento"
            name="fechaNacimiento"
            value={formData.fechaNacimiento}
            onIonChange={handleInputChange}
            type="date"
          />
          <IonInput
            className="input"
            label="Teléfono"
            fill="solid"
            labelPlacement="floating"
            placeholder="Ingresa un teléfono"
            name="telefono" 
            value={formData.telefono} 
            onIonChange={handleInputChange}
            type="tel" 
          />

          <IonInput
            className="input"
            label="Correo electrónico"
            fill="solid"
            labelPlacement="floating"
            placeholder="Ingresa correo"
            name="email"
            value={formData.email}
            onIonChange={handleInputChange}
            type="email"
          />
          <IonInput
            className="input"
            label="Contraseña"
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
            placeholder="Selecciona tu género"
            name="genero"
            value={formData.genero}
            onIonChange={handleInputChange}
          >
            {generos.map((genero, index) => (
              <IonSelectOption key={index} value={genero}>
                {genero}
              </IonSelectOption>
            ))}
          </IonSelect>

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
            <IonText className="ion-btn-text">Registrar</IonText>
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

export default RegisterForm;
