import React, { useState } from "react";
import {
  IonPage,
  IonContent,
  IonButton,
  IonInput,
  IonText,
  IonImg,
  IonBackButton,
  IonButtons,
} from "@ionic/react";
import { useHistory } from "react-router-dom";
import {
  registerUserWithPhone,
  auth,
  RecaptchaVerifier,
} from "../firebaseConfig";
import "../styles/Login.css";

const RegisterNumber: React.FC = () => {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [confirmationResult, setConfirmationResult] = useState<any>(null);
  const [isCodeSent, setIsCodeSent] = useState(false);
  const history = useHistory();

  const sendVerificationCode = async () => {
    const appVerifier = new RecaptchaVerifier(auth, "recaptcha-container", {
      size: "invisible",
    });
    try {
      const result = await registerUserWithPhone(
        `+56${phoneNumber}`,
        appVerifier
      );
      setConfirmationResult(result);
      setIsCodeSent(true);
    } catch (error) {
      console.error("Error al enviar el código de verificación:", error);
    }
  };

  const verifyCode = async () => {
    if (!confirmationResult) return;
    try {
      await confirmationResult.confirm(verificationCode);
      console.log("Usuario autenticado con éxito");
      history.push("/tarjetas"); // Redirige a la página de inicio o a la que prefieras
    } catch (error) {
      console.error("Código de verificación incorrecto:", error);
    }
  };

  return (
    <IonPage>
      <IonContent className="login-content" fullscreen>
        <IonButtons>
          <IonBackButton />
        </IonButtons>

        <div className="terms-text">
          <IonText>Nos brindas tu número telefónico?</IonText>
        </div>

        {!isCodeSent ? (
          <div className="number">
            <IonText>+56</IonText>
            <IonInput
              className="input"
              label="Número de teléfono"
              fill="solid"
              labelPlacement="floating"
              placeholder="9XXXXXXXX"
              color="medium"
              value={phoneNumber}
              onIonChange={(e) => setPhoneNumber(e.detail.value!)}
            />
          </div>
        ) : (
          <div className="verification">
            <IonText>Ingresa el código de verificación</IonText>
            <IonInput
              className="input"
              placeholder="Código de verificación"
              value={verificationCode}
              onIonChange={(e) => setVerificationCode(e.detail.value!)}
            />
          </div>
        )}

        <IonButton
          fill="clear"
          className="login-button"
          onClick={!isCodeSent ? sendVerificationCode : verifyCode}
        >
          <IonText className="ion-btn-text">
            {!isCodeSent ? "Enviar Código" : "Verificar Código"}
          </IonText>
        </IonButton>

        <div id="recaptcha-container"></div>
      </IonContent>
    </IonPage>
  );
};

export default RegisterNumber;
