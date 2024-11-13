import React, { useState, useEffect } from 'react';
import { IonPage, IonContent, IonButton, IonInput, IonSelect, IonSelectOption, IonText, IonImg, IonLoading } from '@ionic/react';
import { useHistory } from 'react-router-dom';
import '../styles/Login.css';
import logo from '../assets/logo.png';
import logo_SAD from '../assets/logo_SAD.png';
import { registerEstudiante, getCarreras, getGeneros } from '../services/FireStoreServices';

const RegisterForm: React.FC = () => {
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    anioEstudio: '',
    carrera: '',
    genero: '',
    sedeAcademica: 'Duoc UC Puente Alto', // Valor fijo de la sede
    fechaNacimiento: '', // Agregar el campo para la fecha de nacimiento
    email: '',
    contrasena: ''
  });
  const [formError, setFormError] = useState<string>('');
  const [showLoading, setShowLoading] = useState<boolean>(false);
  const [carreras, setCarreras] = useState<string[]>([]); // Estado para almacenar las carreras
  const [generos, setGeneros] = useState<string[]>([]); // Estado para almacenar los géneros
  const history = useHistory();

  useEffect(() => {
    // Cargar carreras y géneros desde Firestore cuando el componente se monta
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

  const handleFormSubmit = async () => {
    if (Object.values(formData).some((value) => value === '')) {
      setFormError('Por favor, complete todos los campos');
      return;
    }

    setShowLoading(true);

    try {
      const formDataToSubmit = {
        nombreCompleto: `${formData.nombre} ${formData.apellido}`,
        anioEstudio: parseInt(formData.anioEstudio) || 0,
        carrera: formData.carrera,
        genero: formData.genero,
        sedeAcademica: formData.sedeAcademica,
        fechaNacimiento: formData.fechaNacimiento,
        fechaRegistro: new Date().toISOString(), // Asignar la fecha de registro actual
        email: formData.email,
        contrasena: formData.contrasena
      };

      const docId = await registerEstudiante(formDataToSubmit);
      console.log("Estudiante registrado con ID: ", docId);

      alert('Datos enviados correctamente');
      history.push('/tarjetas');
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
          
          {/* Combo box dinámico para las carreras */}
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

          {/* Combo box dinámico para los géneros */}
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
            <IonText className="ion-btn-text">Enviar</IonText>
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
