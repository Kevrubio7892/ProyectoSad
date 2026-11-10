import React, { useRef, useState } from 'react';
import { IonPage, IonContent, IonButton, IonInput, IonText, IonIcon, IonImg, IonLoading } from '@ionic/react';
import { logoGoogle, callOutline } from 'ionicons/icons';
import { useHistory } from 'react-router-dom';
import { ConfirmationResult, RecaptchaVerifier, signInWithPhoneNumber, signOut } from 'firebase/auth';
import '../styles/LoginStyles.css';
import logo from '../assets/logo.png';
import logo_SAD from '../assets/logo_SAD.png';
import { auth, loginUser, googleLogin, getUserRoleByPhone, getUserRoleFromCollections } from '../firebaseConfig';
import { normalizePhoneNumber } from '../utils/phoneNumber';

const Login: React.FC = () => {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [emailError, setEmailError] = useState<string>('');
  const [passwordError, setPasswordError] = useState<string>('');
  const [showLoading, setShowLoading] = useState<boolean>(false); // Estado para el loading
  const [phoneStep, setPhoneStep] = useState<'closed' | 'phone' | 'code'>('closed');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const recaptchaContainerRef = useRef<HTMLDivElement>(null);
  const recaptchaVerifierRef = useRef<RecaptchaVerifier | null>(null);
  const confirmationResultRef = useRef<ConfirmationResult | null>(null);
  const history = useHistory();

  const clearRecaptcha = () => {
    recaptchaVerifierRef.current?.clear();
    recaptchaVerifierRef.current = null;
  };

  const handleLogin = async () => {
    setShowLoading(true);
  
    const success = await loginUser(email, password);
    if (success) {
      const role = await getUserRoleFromCollections(email);
      if (role === "Administrador") {
        history.push("/admin"); // Redirige a la vista de administrador
      } else if (role === "Estudiante") {
        history.push("/tarjetas"); // Redirige a la vista de estudiante
      } else {
        setPasswordError("No tienes permisos para acceder. Contacta al administrador.");
      }
    } else {
      setPasswordError("Error en las credenciales de inicio de sesión.");
    }
  
    setShowLoading(false);
  };
  
  

  const handleGoogleLogin = async () => {
    setShowLoading(true); // Mostrar el loading
  
    const result = await googleLogin();
    if (result.success) {
      const email = result.email;
      const role = email ? await getUserRoleFromCollections(email) : null;
      if (role === 'Administrador') {
        history.push('/admin');
      } else if (role === 'Estudiante') {
        history.push('/tarjetas');
      } else if (email) {
        history.push({
          pathname: '/register-form-google',
          state: { email },
        });
      } else {
        setPasswordError('Google no devolvió un correo asociado a la cuenta.');
      }
    } else {
      setPasswordError('No se pudo iniciar sesión con Google. Inténtalo nuevamente.');
    }
  
    setShowLoading(false); // Ocultar el loading al terminar
  };
  

  const handlePhoneLogin = () => {
    setPhoneError('');
    setPhoneStep('phone');
  };

  const handleSendPhoneCode = async () => {
    const normalizedPhone = normalizePhoneNumber(phoneNumber);
    if (!normalizedPhone) {
      setPhoneError('Ingresa el teléfono con código de país, por ejemplo +56912345678.');
      return;
    }

    setShowLoading(true);
    setPhoneError('');
    try {
      if (!recaptchaContainerRef.current) {
        throw new Error('No se pudo inicializar la verificación reCAPTCHA.');
      }

      recaptchaVerifierRef.current = new RecaptchaVerifier(auth, recaptchaContainerRef.current, {
        size: 'invisible',
      });
      confirmationResultRef.current = await signInWithPhoneNumber(
        auth,
        normalizedPhone,
        recaptchaVerifierRef.current
      );
      setPhoneNumber(normalizedPhone);
      setPhoneStep('code');
    } catch (error) {
      console.error('Error al enviar el código SMS:', error);
      setPhoneError('No se pudo enviar el código. Revisa el número y vuelve a intentarlo.');
      clearRecaptcha();
    } finally {
      setShowLoading(false);
    }
  };

  const handleVerifyPhoneCode = async () => {
    const confirmationResult = confirmationResultRef.current;
    if (!confirmationResult) {
      setPhoneError('Solicita un nuevo código antes de verificarlo.');
      setPhoneStep('phone');
      return;
    }

    if (!/^\d{6}$/.test(verificationCode.trim())) {
      setPhoneError('Ingresa el código de verificación de 6 dígitos.');
      return;
    }

    setShowLoading(true);
    setPhoneError('');
    let credential;
    try {
      credential = await confirmationResult.confirm(verificationCode.trim());
    } catch (error) {
      console.error('Error al verificar el código SMS:', error);
      setPhoneError('El código es incorrecto o expiró. Solicita otro e inténtalo nuevamente.');
      setShowLoading(false);
      clearRecaptcha();
      return;
    }

    try {
      const verifiedPhone = credential.user.phoneNumber || phoneNumber;
      const role = await getUserRoleByPhone(verifiedPhone);

      if (role === 'Administrador') {
        history.push('/admin');
      } else if (role === 'Estudiante') {
        history.push('/tarjetas');
      } else {
        history.push('/register-form-phone');
      }
    } catch (error) {
      console.error('Error al buscar el perfil asociado al teléfono:', error);
      try {
        await signOut(auth);
      } catch (signOutError) {
        console.error('Error al cerrar la sesión telefónica sin perfil:', signOutError);
      }
      setPhoneError('No se pudo consultar el perfil del teléfono. Inténtalo nuevamente.');
    } finally {
      setShowLoading(false);
      clearRecaptcha();
    }
  };

  const cancelPhoneLogin = () => {
    clearRecaptcha();
    confirmationResultRef.current = null;
    setPhoneNumber('');
    setVerificationCode('');
    setPhoneError('');
    setPhoneStep('closed');
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
          onIonChange={(e) => setEmail(e.detail.value!)}
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

        <IonButton fill="clear" className="login-button" onClick={handleLogin}>
          <IonText className="ion-btn-text">Iniciar sesión</IonText>
        </IonButton>

        <div className="button-container">
          <IonButton fill="clear" className="icon-button" onClick={handleGoogleLogin}>
            <IonIcon icon={logoGoogle} size="large" color="light" />
          </IonButton>

          <IonButton fill="clear" className="icon-button" onClick={handlePhoneLogin} aria-label="Iniciar sesión con teléfono">
            <IonIcon icon={callOutline} size="large" color="light" />
          </IonButton>
        </div>

        {phoneStep !== 'closed' && (
          <div className="phone-login-form">
            {phoneStep === 'phone' ? (
              <>
                <IonInput
                  className="input"
                  label="Teléfono (formato internacional)"
                  labelPlacement="floating"
                  placeholder="+56912345678"
                  type="tel"
                  value={phoneNumber}
                  onIonChange={(event) => setPhoneNumber(event.detail.value || '')}
                />
                <IonButton className="login-button" onClick={handleSendPhoneCode}>
                  Enviar código SMS
                </IonButton>
              </>
            ) : (
              <>
                <IonText className="phone-code-hint">
                  Ingresa el código enviado por SMS a {phoneNumber}.
                </IonText>
                <IonInput
                  className="input"
                  label="Código de verificación"
                  labelPlacement="floating"
                  placeholder="123456"
                  type="text"
                  inputMode="numeric"
                  value={verificationCode}
                  onIonChange={(event) => setVerificationCode(event.detail.value || '')}
                />
                <IonButton className="login-button" onClick={handleVerifyPhoneCode}>
                  Verificar código
                </IonButton>
                <IonButton fill="clear" onClick={() => setPhoneStep('phone')}>
                  Cambiar teléfono
                </IonButton>
              </>
            )}
            {phoneError && <IonText color="danger" className="error-text">{phoneError}</IonText>}
            <IonButton fill="clear" onClick={cancelPhoneLogin}>
              Cancelar
            </IonButton>
            <div ref={recaptchaContainerRef} id="phone-recaptcha-container" />
          </div>
        )}

        <div className="register-text">
          <IonText
            style={{ cursor: 'pointer' }}
            onClick={() => history.push('/register')}
          >
            ¿No tienes cuenta? Regístrate aquí
          </IonText>
        </div>

        <div className="forgot-password-text">
          <IonText
          className="forgot-password-text"
          onClick={() => history.push('/forgot-password')}
          color="primary"
          style={{ cursor: 'pointer' }}
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