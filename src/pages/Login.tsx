<<<<<<< HEAD
import React, { useState } from "react";
import {
  IonPage,
  IonContent,
  IonButton,
  IonInput,
  IonText,
  IonIcon,
  IonImg,
  IonButtons,
  IonLoading,
} from "@ionic/react";
import { logoGoogle, logoApple, callOutline } from "ionicons/icons";
import { useHistory } from "react-router-dom";
import "../styles/Login.css";
import logo from "../assets/logo.png";
import logo_SAD from "../assets/logo_SAD.png";
import { loginUser, googleLogin } from "../firebaseConfig";
=======
import React, { useState } from 'react';
import { IonPage, IonContent, IonButton, IonInput, IonText, IonIcon, IonImg, IonLoading } from '@ionic/react';
import { logoGoogle, logoApple, callOutline } from 'ionicons/icons';
import { useHistory } from 'react-router-dom';
import '../styles/LoginStyles.css';
import logo from '../assets/logo.png';
import logo_SAD from '../assets/logo_SAD.png';
import { loginUser, googleLogin } from '../firebaseConfig';
>>>>>>> RamaKevin

const Login: React.FC = () => {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [emailError, setEmailError] = useState<string>("");
  const [passwordError, setPasswordError] = useState<string>("");
  const [showLoading, setShowLoading] = useState<boolean>(false); // Estado para el loading
  const history = useHistory();

  const handleLogin = async () => {
    setShowLoading(true);  // Mostrar el loading
    
    let isValid = true;

    if (password.length < 6) {
      setPasswordError("La contraseña debe tener al menos 6 caracteres");
      isValid = false;
    } else {
      setPasswordError("");
    }

    if (isValid) {
      const success = await loginUser(email, password);
      if (success) {
        alert("Inicio de sesión exitoso");
        history.push("/tarjetas");
        alert('Inicio de sesión exitoso');
        history.push('/tarjetas'); // Redirige a tarjetas después de inicio de sesión exitoso
      } else {
        setPasswordError("Error en las credenciales de inicio de sesión.");
      }
    }

    setShowLoading(false);  // Ocultar el loading al terminar
  };

  const handleGoogleLogin = async () => {
    setShowLoading(true); // Mostrar el loading
  
    const result = await googleLogin();
    if (result.success) {
      const email = result.email;
      // Redirige al formulario con la dirección de correo electrónico
      history.push({
        pathname: '/register-form-google',
        state: { email }, // Pasa el email como estado a la vista de registro
      });
      alert('Inicio de sesión exitoso');
    } else {
      alert('Error al iniciar sesión con Google');
    }
  
<<<<<<< HEAD
    setShowLoading(false);  // Ocultar el loading al terminar

  };

    const handlePasswordFocus = () => {
      setEmailError("");
    };
  const handleAppleLogin = () => {
    console.log("Iniciar sesión con Apple");
=======
    setShowLoading(false); // Ocultar el loading al terminar
>>>>>>> RamaKevin
  };
  

  const handlePhoneLogin = () => {
    console.log("Iniciar sesión con el teléfono");
    history.push("/register-number");
  };

  return (
    <IonPage>
      <IonContent className="login-content" fullscreen>
        <IonImg src={logo} className="background-logo" />
        <IonImg src={logo_SAD} className="background-logo-sad" />
        <div className="terms-text">
          <IonText>
            Al tocar "Iniciar sesión", aceptas nuestros Términos. Conoce cómo
            procesamos tus datos en nuestra Política de Privacidad.
          </IonText>
        </div>

        <IonInput
          className="input"
          label="Correo electrónico"
          fill="solid"
          labelPlacement="floating"
          placeholder="Ingresa tu correo"
          value={email}
          onIonChange={(e) => setEmail(e.detail.value!)}
          color="medium"
        />
        {emailError && (
          <IonText color="danger" className="error-text">
            {emailError}
          </IonText>
        )}

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
        {passwordError && (
          <IonText color="danger" className="error-text">
            {passwordError}
          </IonText>
        )}

        <IonButton fill="clear" className="login-button" onClick={handleLogin}>
          <IonText className="ion-btn-text">Iniciar sesión</IonText>
        </IonButton>

        <div className="button-container">
<<<<<<< HEAD
          <IonButton
            fill="clear"
            className="icon-button"
            onClick={handleAppleLogin}
          >
            <IonIcon icon={logoApple} size="large" color="light" />
          </IonButton>

          <IonButton
            fill="clear"
            className="icon-button"
            onClick={handleGoogleLogin}
          >
=======
          <IonButton fill="clear" className="icon-button" onClick={handleGoogleLogin}>
>>>>>>> RamaKevin
            <IonIcon icon={logoGoogle} size="large" color="light" />
          </IonButton>

          <IonButtons>
            <IonButton
              fill="clear"
              className="icon-button"
              onClick={handlePhoneLogin}
            >
              <IonIcon icon={callOutline} size="large" color="light" />
            </IonButton>
          </IonButtons>
        </div>

        <div className="register-text">
          <IonText
            style={{ cursor: "pointer" }}
            onClick={() => history.push("/register")} // Asegúrate de que la ruta /register esté configurada
          >
            ¿No tienes cuenta? Regístrate aquí
          </IonText>
        </div>

        <div className="forgot-password-text">
          <IonText
<<<<<<< HEAD
            className="forgot-password-text"
            onClick={() => history.push("/notificaciones")}
            color="primary"
            style={{ cursor: "pointer" }}
=======
          className="forgot-password-text"
          onClick={() => history.push('/forgot-password')}
          color="primary"
          style={{ cursor: 'pointer' }}
>>>>>>> RamaKevin
          >
          ¿Olvidaste tu contraseña?
          </IonText>
        </div>

        {/* Agregar el IonLoading aquí */}
        <IonLoading
          className="custom-loading" 
          isOpen={showLoading}
          message={'Iniciando sesión...'}
          onDidDismiss={() => setShowLoading(false)}
           // Clase personalizada para estilizar el loading
        />
      </IonContent>
    </IonPage>
  );
};

export default Login;
