import React, { useState } from 'react';
import { IonPage, IonContent, IonButton, IonInput, IonText, IonIcon, IonImg } from '@ionic/react';
import { logoGoogle, logoApple, callOutline } from 'ionicons/icons';
import { useHistory } from 'react-router-dom';
import '../styles/Login.css';
import logo from '../assets/logo.png'; // Asegúrate de que la ruta sea correcta
import logo_SAD from '../assets/logo_SAD.png'; // Asegúrate de que la ruta sea correcta

const Login: React.FC = () => {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [emailError, setEmailError] = useState<string>('');
  const [passwordError, setPasswordError] = useState<string>('');
  const history = useHistory();

  const handleLogin = () => {
    let isValid = true;

    if (emailError === '') {
      if (password.length < 6) {
        setPasswordError('La contraseña debe tener al menos 6 caracteres');
        isValid = false;
      } else {
        setPasswordError('');
      }
    }

    if (isValid) {
      console.log('Iniciar sesión con correo:', email);
      alert('Inicio de sesión exitoso');
      history.push('/tarjetas');
    }
  };

  const handleEmailChange = (e: CustomEvent) => {
    const value = e.detail.value!;
    setEmail(value);

    // Validación del correo
    if (!value.endsWith('@duacap.cl')) {
      setEmailError('El correo debe tener el dominio @duacap.cl');
    } else {
      setEmailError(''); // Eliminar el error si el formato es correcto
    }
  };

  const handlePasswordFocus = () => {
    // Eliminar el error de correo al hacer clic en el input de contraseña
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
        {/* Logos */}
        <IonImg src={logo} className="background-logo" />
        <IonImg src={logo_SAD} className="background-logo-sad" />
        <div className="terms-text">
          <IonText>
            Al tocar "Iniciar sesión", aceptas nuestros Términos. Conoce cómo procesamos tus datos en nuestra Política de Privacidad.
          </IonText>
        </div>
        
        {/* Formulario de correo */}
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

        {/* Formulario de contraseña */}
        <IonInput
          className="input"
          label="Contraseña"
          fill="solid"
          labelPlacement="floating"
          type="password"
          placeholder="Ingresa tu contraseña"
          value={password}
          onIonChange={(e) => setPassword(e.detail.value!)}
          onFocus={handlePasswordFocus} // Agregado para manejar el enfoque
          color="medium"
        />
        {passwordError && <IonText color="danger" className="error-text">{passwordError}</IonText>}

        {/* Botón de inicio de sesión */}
        <IonButton fill="clear" className="login-button" onClick={handleLogin}>
          <IonText className="ion-btn-text">Iniciar sesión</IonText>
        </IonButton>

        {/* Botones de iconos (Apple, Google, Teléfono) */}
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

        {/* Texto para "Olvidaste tu contraseña?" */}
        <div className="forgot-password-text">
          <IonText
            className="forgot-password-text"
            onClick={() => history.push('/notificaciones')}
            color="primary" // Cambia el color si lo deseas
            style={{ cursor: 'pointer' }} // Cambia el cursor a pointer
          >
            ¿Olvidaste tu contraseña?
          </IonText>
        </div>
        
      </IonContent>
    </IonPage>
  );
};

export default Login;
