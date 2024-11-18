import React, { useState, useEffect } from 'react';
import { IonPage, IonContent, IonButton, IonInput, IonSelect, IonSelectOption, IonText, IonImg, IonLoading } from '@ionic/react';
import { useHistory, useLocation } from 'react-router-dom';
import '../styles/LoginStyles.css';
import logo from '../assets/logo.png';
import logo_SAD from '../assets/logo_SAD.png';
import { collection, query, where, getDocs, updateDoc } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { getCarreras, getGeneros } from '../services/FireStoreServices';

const RegisterForm: React.FC = () => {
  const location = useLocation<{ email: string }>();
  const email = location.state?.email || ''; // Recuperar el correo electrónico del estado
  const [formData, setFormData] = useState({
    telefono: '',
    anioEstudio: '',
    carrera: '',
    genero: '',
    sedeAcademica: 'Duoc UC Puente Alto', // Valor fijo de la sede
    fechaNacimiento: '', // Campo para la fecha de nacimiento
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
      // Buscar el documento del usuario en Firestore basado en el correo electrónico
      const estudiantesRef = collection(db, "Estudiantes");
      const q = query(estudiantesRef, where("email", "==", email));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const userDoc = querySnapshot.docs[0];
        const userDocRef = userDoc.ref;

        // Actualizar el documento existente con los datos del formulario
        await updateDoc(userDocRef, {
          telefono: formData.telefono,
          anioEstudio: parseInt(formData.anioEstudio) || 0,
          carrera: formData.carrera,
          genero: formData.genero,
          sedeAcademica: formData.sedeAcademica,
          fechaNacimiento: formData.fechaNacimiento,
        });
        alert('Datos enviados correctamente');
        history.push('/tarjetas');
      } else {
        console.error('No se encontró el documento para este usuario.');
        setFormError('Error: No se encontró el usuario.');
      }
    } catch (error) {
      console.error('Error al guardar los datos en Firestore:', error);
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
            label="Teléfono"
            fill="solid"
            labelPlacement="floating"
            placeholder="Ingresa tu número de teléfono"
            name="telefono"
            value={formData.telefono}
            onIonChange={handleInputChange}
            type="tel"
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
