import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
<<<<<<< HEAD
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPhoneNumber,
  RecaptchaVerifier,
} from "firebase/auth"; // Importa los módulos específicos para autenticación
=======
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from "firebase/auth";
>>>>>>> 6d9ab620d477cb30df5739b06b316dc330cf0616

const config = {
  apiKey: "AIzaSyBjdhCSMelJZCYJU-Ky6dwNdSSOTejBp6Y",
  authDomain: "prueba-aa0db.firebaseapp.com",
  projectId: "prueba-aa0db",
  storageBucket: "prueba-aa0db.firebasestorage.app",
  messagingSenderId: "657792321743",
  appId: "1:657792321743:web:25e8e626618662d46c0fba"
};

const app = initializeApp(config); // Inicializa la app de Firebase
export const db = getFirestore(app);
export const auth = getAuth(); // Obtén la instancia de autenticación

<<<<<<< HEAD
// Inicializa la app y la autenticación de Firebase
const auth = getAuth(app);

export const registerUserWithPhone = async (
  phoneNumber: string,
  appVerifier: RecaptchaVerifier
) => {
  try {
    const confirmationResult = await signInWithPhoneNumber(
      auth,
      phoneNumber,
      appVerifier
    );
    return confirmationResult;
  } catch (error) {
    console.error("Error en la autenticación con número telefónico:", error);
    throw error;
  }
};

export { auth, RecaptchaVerifier };

=======
export async function googleLogin() {
  const provider = new GoogleAuthProvider();
  try {
    const result = await signInWithPopup(auth, provider);
    const user = result.user;
    console.log("Inicio de sesión exitoso con Google", user);
    return true; // Puedes redirigir al usuario a otra página o almacenar su información
  } catch (error) {
    console.error("Error al iniciar sesión con Google:", error);
    return false;
  }
}
>>>>>>> 6d9ab620d477cb30df5739b06b316dc330cf0616
// Función para iniciar sesión
export async function loginUser(username: string, password: string) {
  const email = `${username}`;
  const auth = getAuth(); // Obtiene la instancia de autenticación

  try {
    const res = await signInWithEmailAndPassword(auth, email, password);
    console.log(res);
    return true;
  } catch (error) {
    console.error("Error al iniciar sesión:", error);
    return false;
  }
}

// Función para registrar usuario
import { FirebaseError } from "firebase/app"; // Asegúrate de importar FirebaseError

export async function registerUser(username: string, password: string) {
  const email = `${username}`.trim();
  const auth = getAuth();

  try {
    const res = await createUserWithEmailAndPassword(auth, email, password);
    console.log("Registro exitoso:", res);
    return true;
  } catch (error) {
    const firebaseError = error as FirebaseError; // Aquí se hace la afirmación de tipo
    console.error(
      "Error al registrar usuario:",
      firebaseError.code,
      firebaseError.message
    );
    return false;
  }

  
}

