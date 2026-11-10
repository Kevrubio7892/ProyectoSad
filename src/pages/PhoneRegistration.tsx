import React, { useEffect, useState } from 'react';
import {
  IonButton,
  IonContent,
  IonInput,
  IonLoading,
  IonPage,
  IonSelect,
  IonSelectOption,
  IonText,
} from '@ionic/react';
import { onAuthStateChanged, reload, User, verifyBeforeUpdateEmail } from 'firebase/auth';
import { doc, serverTimestamp, setDoc } from 'firebase/firestore';
import { useHistory } from 'react-router-dom';
import { auth, db } from '../firebaseConfig';
import { getCarreras, getGeneros } from '../services/FireStoreServices';
import { isAdultOnDate, isDuocInstitutionalEmail } from '../utils/studentEligibility';
import { normalizePhoneNumber } from '../utils/phoneNumber';
import '../styles/LoginStyles.css';

const CAMPUS = 'Duoc UC Puente Alto';

const PhoneRegistration: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [name, setName] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [institutionalEmail, setInstitutionalEmail] = useState('');
  const [career, setCareer] = useState('');
  const [gender, setGender] = useState('');
  const [careers, setCareers] = useState<string[]>([]);
  const [genders, setGenders] = useState<string[]>([]);
  const [verificationSent, setVerificationSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const history = useHistory();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (authenticatedUser) => {
      if (!authenticatedUser?.phoneNumber) {
        history.replace('/login');
        return;
      }
      setUser(authenticatedUser);
    });

    getCarreras().then(setCareers).catch((loadError) => {
      console.error('Error al cargar carreras:', loadError);
      setError('No se pudieron cargar las carreras. Recarga la página para intentar nuevamente.');
    });
    getGeneros().then(setGenders).catch((loadError) => {
      console.error('Error al cargar géneros:', loadError);
      setError('No se pudieron cargar los géneros. Recarga la página para intentar nuevamente.');
    });

    return unsubscribe;
  }, [history]);

  const sendInstitutionalVerification = async () => {
    const email = institutionalEmail.trim().toLowerCase();
    if (!user?.phoneNumber) {
      setError('La sesión telefónica expiró. Vuelve a iniciar sesión.');
      return;
    }
    if (!name.trim() || !birthDate || !career || !gender) {
      setError('Completa todos los campos del perfil.');
      return;
    }
    if (!isAdultOnDate(birthDate)) {
      setError('Para usar esta comunidad debes tener al menos 18 años.');
      return;
    }
    if (!isDuocInstitutionalEmail(email)) {
      setError('Usa tu correo institucional terminado en @duocuc.cl.');
      return;
    }

    setLoading(true);
    setError('');
    try {
      await verifyBeforeUpdateEmail(user, email);
      setVerificationSent(true);
    } catch (verificationError) {
      console.error('Error al enviar verificación institucional:', verificationError);
      setError('No se pudo enviar el correo de verificación. Comprueba que no esté asociado a otra cuenta y vuelve a intentar.');
    } finally {
      setLoading(false);
    }
  };

  const completeRegistration = async () => {
    if (!user) {
      setError('La sesión expiró. Vuelve a iniciar sesión.');
      return;
    }

    setLoading(true);
    setError('');
    try {
      await reload(user);
      if (!user.emailVerified || !user.email || !isDuocInstitutionalEmail(user.email)) {
        setError('Aún no se ha verificado el correo institucional. Abre el enlace enviado y vuelve a intentarlo.');
        return;
      }

      const phoneNumber = normalizePhoneNumber(user.phoneNumber || '');
      if (!phoneNumber || !isAdultOnDate(birthDate) || !career || !gender || !name.trim()) {
        setError('Los datos del perfil no están completos o no cumplen los requisitos.');
        return;
      }

      await setDoc(doc(db, 'Estudiantes', user.uid), {
        uid: user.uid,
        nombreCompleto: name.trim(),
        email: user.email,
        emailVerified: true,
        telefono: phoneNumber,
        fechaNacimiento: birthDate,
        carrera: career,
        genero: gender,
        sedeAcademica: CAMPUS,
        role: 'Estudiante',
        fechaRegistro: serverTimestamp(),
      });

      history.replace('/tarjetas');
    } catch (saveError) {
      console.error('Error al completar el perfil telefónico:', saveError);
      setError('No se pudo guardar el perfil. Revisa la conexión y las reglas de Firestore.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <IonPage>
      <IonContent className="login-content ion-padding">
        <section className="phone-login-form">
          <h1>Completa tu perfil</h1>
          <IonText color="medium">
            Comunidad Duoc UC Puente Alto para mayores de 18. Verificaremos tu correo institucional.
          </IonText>
          <IonInput
            className="input"
            label="Nombre completo"
            labelPlacement="floating"
            value={name}
            onIonChange={(event) => setName(event.detail.value || '')}
            autocomplete="name"
          />
          <IonInput
            className="input"
            label="Fecha de nacimiento"
            labelPlacement="floating"
            type="date"
            value={birthDate}
            onIonChange={(event) => setBirthDate(event.detail.value || '')}
          />
          <IonInput
            className="input"
            label="Correo institucional"
            labelPlacement="floating"
            type="email"
            placeholder="nombre@duocuc.cl"
            value={institutionalEmail}
            onIonChange={(event) => setInstitutionalEmail(event.detail.value || '')}
            disabled={verificationSent}
          />
          <IonSelect
            className="input"
            label="Carrera"
            labelPlacement="floating"
            placeholder="Selecciona tu carrera"
            value={career}
            onIonChange={(event) => setCareer(event.detail.value)}
          >
            {careers.map((item) => <IonSelectOption key={item} value={item}>{item}</IonSelectOption>)}
          </IonSelect>
          <IonSelect
            className="input"
            label="Género"
            labelPlacement="floating"
            placeholder="Selecciona tu género"
            value={gender}
            onIonChange={(event) => setGender(event.detail.value)}
          >
            {genders.map((item) => <IonSelectOption key={item} value={item}>{item}</IonSelectOption>)}
          </IonSelect>

          {verificationSent && (
            <IonText color="medium">
              Enviamos un enlace a {institutionalEmail}. Ábrelo y vuelve aquí para terminar el registro.
            </IonText>
          )}
          {error && <IonText color="danger" className="error-text">{error}</IonText>}

          {!verificationSent ? (
            <IonButton expand="block" onClick={sendInstitutionalVerification}>
              Verificar correo institucional
            </IonButton>
          ) : (
            <IonButton expand="block" onClick={completeRegistration}>
              Ya verifiqué mi correo
            </IonButton>
          )}
          <IonButton fill="clear" onClick={() => history.replace('/login')}>
            Cancelar
          </IonButton>
        </section>
        <IonLoading isOpen={loading} message="Procesando registro..." />
      </IonContent>
    </IonPage>
  );
};

export default PhoneRegistration;
