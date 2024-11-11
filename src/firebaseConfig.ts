import { initializeApp } from "firebase/app";
import { getFirestore, doc, getDoc } from "firebase/firestore";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { FirebaseError } from "firebase/app";

const config = {
  apiKey: "AIzaSyBjdhCSMelJZCYJU-Ky6dwNdSSOTejBp6Y",
  authDomain: "prueba-aa0db.firebaseapp.com",
  projectId: "prueba-aa0db",
  storageBucket: "prueba-aa0db.firebasestorage.app",
  messagingSenderId: "657792321743",
  appId: "1:657792321743:web:25e8e626618662d46c0fba"
};

const app = initializeApp(config);
export const db = getFirestore(app);
export const auth = getAuth();

// Login con Google
export async function googleLogin() {
  const provider = new GoogleAuthProvider();
  try {
    const result = await signInWithPopup(auth, provider);
    const user = result.user;
    console.log("Inicio de sesión exitoso con Google", user);
    return true;
  } catch (error) {
    console.error("Error al iniciar sesión con Google:", error);
    return false;
  }
}

// Iniciar sesión con email y contraseña
export async function loginUser(username: string, password: string) {
  const email = `${username}`;
  try {
    const res = await signInWithEmailAndPassword(auth, email, password);
    console.log("Inicio de sesión exitoso:", res);
    return true;
  } catch (error) {
    console.error("Error al iniciar sesión:", error);
    return false;
  }
}

// Registrar usuario con email y contraseña
export async function registerUser(username: string, password: string) {
  const email = `${username}`.trim();
  try {
    const res = await createUserWithEmailAndPassword(auth, email, password);
    console.log("Registro exitoso:", res);
    return true;
  } catch (error) {
    const firebaseError = error as FirebaseError;
    console.error("Error al registrar usuario:", firebaseError.code, firebaseError.message);
    return false;
  }
}

// Obtener datos del usuario desde Firestore
export async function getUserData(uid: string) {
  try {
    const docRef = doc(db, "Estudiantes", uid);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return docSnap.data();
    } else {
      console.error("No se encontró el documento");
      return null;
    }
  } catch (error) {
    console.error("Error al obtener datos del usuario:", error);
    return null;
  }
}
