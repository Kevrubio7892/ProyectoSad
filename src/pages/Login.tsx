import React, { useState } from 'react';
import { IonPage, IonContent, IonButton, IonInput, IonText, IonIcon, IonImg } from '@ionic/react';
import { logoGoogle, logoApple, callOutline } from 'ionicons/icons';
import { useHistory } from 'react-router-dom';
import '../styles/Login.css';
import logo from '../assets/logo.png';
import logo_SAD from '../assets/logo_SAD.png';
import { loginUser } from '../firebaseConfig';

const Login: React.FC = () => {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [emailError, setEmailError] = useState<string>('');
  const [passwordError, setPasswordError] = useState<string>('');
  const history = useHistory();

  const handleLogin = async () => {
    let isValid = true;

    /*if (!email.endsWith('@duacap.cl')) {
      setEmailError('El correo debe tener el dominio @duacap.cl');
      isValid = false;
    } else {
      setEmailError('');
    }*/

    if (password.length < 6) {
      setPasswordError('La contraseña debe tener al menos 6 caracteres');
      isValid = false;
    } else {
      setPasswordError('');
    }

    if (isValid) {
      const success = await loginUser(email, password);
      if (success) {
        alert('Inicio de sesión exitoso');
        history.push('/tarjetas');
      } else {
        setPasswordError('Error en las credenciales de inicio de sesión.');
      }
    }
  };

  const handleEmailChange = (e: CustomEvent) => {
    const value = e.detail.value!;
    setEmail(value);

    if (!value.endsWith('@duacap.cl')) {
      setEmailError('El correo debe tener el dominio @duacap.cl');
    } else {
      setEmailError('');
    }
  };

  const handlePasswordFocus = () => {
    setEmailError('');
  };

  const handleGoogleLogin = () => {
    console.log('Iniciar sesión con Google');
  };

  const handleAppleLogin = () => {
    console.log('Iniciar sesión con Apple');
  };

  const handlePhoneLogin = () => {
    console.log('Iniciar sesión con el teléfono');
  };

  return (
    <IonPage>
      <IonContent className="login-content" fullscreen>
        <IonImg src={logo} className="background-logo" />
        <IonImg src={logo_SAD} className="background-logo-sad" />
        <div className="terms-text">
          <IonText>
            Al tocar "Iniciar sesión", aceptas nuestros Términos. Conoce cómo procesamos tus datos en nuestra Política de Privacidad.
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
          onFocus={handlePasswordFocus}
          color="medium"
        />
        {passwordError && <IonText color="danger" className="error-text">{passwordError}</IonText>}

        <IonButton fill="clear" className="login-button" onClick={handleLogin}>
          <IonText className="ion-btn-text">Iniciar sesión</IonText>
        </IonButton>

        <div className="button-container">
          <IonButton fill="clear" className="icon-button" onClick={handleAppleLogin}>
            <IonIcon icon={logoApple} size="large" color="light" />
          </IonButton>

          <IonButton fill="clear" className="icon-button" onClick={handleGoogleLogin}>
            <IonIcon icon={logoGoogle} size="large" color="light" />
          </IonButton>

          <IonButton fill="clear" className="icon-button" onClick={handlePhoneLogin}>
            <IonIcon icon={callOutline} size="large" color="light" />
          </IonButton>
        </div>

        {/* Texto para registrar usuario */}
        <div className="register-text">
          <IonText
            
            style={{ cursor: 'pointer' }}
            onClick={() => history.push('/register')} // Asegúrate de que la ruta /register esté configurada
          >
            ¿No tienes cuenta? Regístrate aquí
          </IonText>
        </div>

        <div className="forgot-password-text">
          <IonText
            className="forgot-password-text"
            onClick={() => history.push('/notificaciones')}
            color="primary"
            style={{ cursor: 'pointer' }}
          >
            ¿Olvidaste tu contraseña?
          </IonText>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Login;
