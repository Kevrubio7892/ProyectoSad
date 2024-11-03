import React, { useState } from 'react';
import { IonPage, IonContent, IonButton, IonInput, IonText, IonImg } from '@ionic/react';
import { useHistory } from 'react-router-dom';
import { registerUser } from '../firebaseConfig'; // Asegúrate de tener una función de registro en firebaseConfig
import '../styles/Login.css';
import logo from '../assets/logo.png';
import logo_SAD from '../assets/logo_SAD.png';

const Register: React.FC = () => {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>(''); // Nuevo estado para confirmación
  const [emailError, setEmailError] = useState<string>('');
  const [passwordError, setPasswordError] = useState<string>('');
  const [confirmPasswordError, setConfirmPasswordError] = useState<string>(''); // Error para confirmación
  const history = useHistory();

  // Función de validación de correo electrónico
  const validateEmail = (email: string) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  const handleRegister = async () => {
    let isValid = true;

    // Validación del correo con formato y dominio correcto
    const trimmedEmail = email.trim();
    if (!validateEmail(trimmedEmail)) {
      setEmailError('El correo debe ser válido y tener el dominio @duacap.cl');
      isValid = false;
    } else {
      setEmailError('');
    }

    if (password.length < 6) {
      setPasswordError('La contraseña debe tener al menos 6 caracteres');
      isValid = false;
    } else {
      setPasswordError('');
    }

    if (password !== confirmPassword) {
      setConfirmPasswordError('Las contraseñas no coinciden');
      isValid = false;
    } else {
      setConfirmPasswordError('');
    }

    if (isValid) {
      console.log("Registrando usuario:", trimmedEmail, password);
      const success = await registerUser(trimmedEmail, password);
      if (success) {
        alert('Registro exitoso');
        history.push('/login'); // Redirige a la página de inicio de sesión
      } else {
        setPasswordError('Error en el registro. Intente nuevamente.');
      }
    }
  };

  const handleEmailChange = (e: CustomEvent) => {
    const value = e.detail.value!.trim();
    setEmail(value);

    if (!validateEmail(value)) {
      setEmailError('El correo debe ser válido y tener el dominio @duacap.cl');
    } else {
      setEmailError('');
    }
  };

  return (
    <IonPage>
      <IonContent className="login-content" fullscreen>
        <IonImg src={logo} className="background-logo" />
        <IonImg src={logo_SAD} className="background-logo-sad" />
        <div className="terms-text">
          <IonText>
            Al tocar "Registrar", aceptas nuestros Términos. Conoce cómo procesamos tus datos en nuestra Política de Privacidad.
          </IonText>
        </div>

        <IonInput
          className="input"
          label="Correo electrónico"
          fill="solid"
          labelPlacement="floating"
          placeholder="Ingresa tu correo"
          value={email}
          onIonChange={handleEmailChange}
          color="medium"
        />
        {emailError && <IonText color="danger" className="error-text">{emailError}</IonText>}

        <IonInput
          className="input"
          label="Contraseña"
          fill="solid"
          labelPlacement="floating"
          type="password"
          placeholder="Ingresa tu contraseña"
          value={password}
          onIonChange={(e) => setPassword(e.detail.value!)}
          color="medium"
        />
        {passwordError && <IonText color="danger" className="error-text">{passwordError}</IonText>}

        <IonInput
          className="input"
          label="Confirmar Contraseña"
          fill="solid"
          labelPlacement="floating"
          type="password"
          placeholder="Confirma tu contraseña"
          value={confirmPassword}
          onIonChange={(e) => setConfirmPassword(e.detail.value!)}
          color="medium"
        />
        {confirmPasswordError && <IonText color="danger" className="error-text">{confirmPasswordError}</IonText>}

        <IonButton fill="clear" className="login-button" onClick={handleRegister}>
          <IonText className="ion-btn-text">Registrar</IonText>
        </IonButton>

        <div className="forgot-password-text">
          <IonText
            className="forgot-password-text"
            onClick={() => history.push('/login')}
            color="primary"
            style={{ cursor: 'pointer' }}
          >
            ¿Ya tienes una cuenta? Inicia sesión aquí
          </IonText>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Register;
