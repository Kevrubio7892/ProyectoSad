import { initializeApp } from "firebase/app";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth"; // Importa los módulos específicos para autenticación

const config = {
  apiKey: "AIzaSyDLTuAWrWpS_IvQ-hizXOo8Z2xHUM6tpaU",
  authDomain: "appsad-f3410.firebaseapp.com",
  projectId: "appsad-f3410",
  storageBucket: "appsad-f3410.firebasestorage.app",
  messagingSenderId: "616774467617",
  appId: "1:616774467617:web:0d57ac8750740c24676360",
};

const app = initializeApp(config); // Inicializa la app de Firebase

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
import { FirebaseError } from 'firebase/app'; // Asegúrate de importar FirebaseError

export async function registerUser(username: string, password: string) {
  const email = `${username}`.trim();
  const auth = getAuth();

  try {
    const res = await createUserWithEmailAndPassword(auth, email, password);
    console.log("Registro exitoso:", res);
    return true;
  } catch (error) {
    const firebaseError = error as FirebaseError; // Aquí se hace la afirmación de tipo
    console.error("Error al registrar usuario:", firebaseError.code, firebaseError.message);
    return false;
  }
}


