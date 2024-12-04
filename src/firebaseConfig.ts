import { initializeApp } from "firebase/app";
import { getFirestore, doc, addDoc, Timestamp} from "firebase/firestore";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { FirebaseError } from "firebase/app";
import { collection, getDocs, query, where, updateDoc} from "firebase/firestore";
import { getDatabase, ref, set, onValue, push } from "firebase/database"; // Importa Realtime Database
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
export const rtdb = getDatabase(app); // Inicializa Realtime Database
// Login con Google
export async function googleLogin() {
  const provider = new GoogleAuthProvider();
  try {
    const result = await signInWithPopup(auth, provider);
    const user = result.user;

    // Verifica si ya existe un documento para este usuario
    const estudiantesRef = collection(db, "Estudiantes");
    const q = query(estudiantesRef, where("email", "==", user.email));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      // Si no existe el usuario, crea uno nuevo
      const newEstudiante = {
        email: user.email,
        nombreCompleto: user.displayName || "",
        providerId: user.providerId,
        fechaRegistro: Timestamp.now(),
      };
      await addDoc(estudiantesRef, newEstudiante);
      console.log("Usuario registrado en Firestore:", newEstudiante);
    } else {
      console.log("Usuario ya registrado en Firestore.");
    }

    console.log("Inicio de sesión exitoso con Google", user);
    return { success: true, email: user.email };
  } catch (error) {
    console.error("Error al iniciar sesión con Google:", error);
    return { success: false, error };
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
export const getUserData = async (userEmail: string) => {
  try {
    const estudiantesRef = collection(db, "Estudiantes");
    const q = query(estudiantesRef, where("email", "==", userEmail));
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      const userDoc = querySnapshot.docs[0]; // Toma el primer documento que coincida
      return userDoc.data();
    } else {
      console.error("No se encontraron datos para el email:", userEmail);
    }
  } catch (error) {
    console.error("Error al obtener datos del usuario:", error);
  }
  return null;
};

// Actualiza la descripción del usuario
export const updateUserDescription = async (userEmail: string, newDescription: string) => {
  try {
    const estudiantesRef = collection(db, "Estudiantes");
    const q = query(estudiantesRef, where("email", "==", userEmail));
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      const userDoc = querySnapshot.docs[0]; // Toma el primer documento que coincida
      const userDocRef = userDoc.ref;
      
      // Actualiza el campo 'descripcion' en Firestore
      await updateDoc(userDocRef, {
        descripcion: newDescription,
      });
      console.log("Descripción actualizada correctamente.");
    } else {
      console.error("No se encontró el documento para este usuario.");
    }
  } catch (error) {
    console.error("Error al actualizar la descripción:", error);
  }
};

// Actualiza la URL de Instagram del usuario
export const updateInstagramUrl = async (userEmail: string, instagramUrl: string) => {
  try {
    const estudiantesRef = collection(db, "Estudiantes");
    const q = query(estudiantesRef, where("email", "==", userEmail));
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      const userDoc = querySnapshot.docs[0]; // Toma el primer documento que coincida
      const userDocRef = userDoc.ref;

      // Actualiza el campo 'instagram' en Firestore
      await updateDoc(userDocRef, {
        instagram: instagramUrl,
      });
      console.log("URL de Instagram actualizada correctamente.");
    } else {
      console.error("No se encontró el documento para este usuario.");
    }
  } catch (error) {
    console.error("Error al actualizar la URL de Instagram:", error);
  }
};

// Actualiza la foto de perfil del usuario en Firestore
export const updateProfilePhoto = async (userEmail: string, photoDataUrl: string) => {
  try {
    const estudiantesRef = collection(db, "Estudiantes");
    const q = query(estudiantesRef, where("email", "==", userEmail));
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      const userDoc = querySnapshot.docs[0]; // Toma el primer documento que coincida
      const userDocRef = userDoc.ref;

      // Actualiza el campo 'photoUrl' en Firestore
      await updateDoc(userDocRef, {
        photoUrl: photoDataUrl, // Guarda la imagen en formato base64
      });
      console.log("Foto de perfil actualizada correctamente en Firestore.");
    } else {
      console.error("No se encontró el documento para este usuario.");
    }
  } catch (error) {
    console.error("Error al actualizar la foto de perfil:", error);
  }
};

export const addLike = async (fromUserId: string, toUserId: string) => {
  try {
    // Referencia a la subcolección LIKES del estudiante que recibe el Check
    const likesCollectionRef = collection(db, "Estudiantes", toUserId, "LIKES");

    // Crear el documento del like 
    const likeData = {
      fromUserId,
      toUserId,
      isSuperLike: false, //
      timestamp: Timestamp.now(),
    };

    await addDoc(likesCollectionRef, likeData);
    console.log("Like registrado correctamente:", likeData);
  } catch (error) {
    console.error("Error al registrar el like:", error);
  }
};

export const addDislike = async (fromUserId: string, toUserId: string) => {
  try {
    // Referencia a la subcolección LIKES del estudiante que recibe el Check
    const DislikesCollectionRef = collection(db, "Estudiantes", toUserId, "DISLIKES");

    
    const DislikeData = {
      fromUserId,
      toUserId,
      isSuperLike: false, //
      timestamp: Timestamp.now(),
    };

    await addDoc(DislikesCollectionRef, DislikeData);
    console.log("Dislike registrado correctamente:", DislikeData);
  } catch (error) {
    console.error("Error al registrar el dislike:", error);
  }
};


export const getUserRoleFromCollections = async (userEmail: string): Promise<string | null> => {
  try {
    // Verificar en la colección "Estudiantes"
    const estudiantesRef = collection(db, "Estudiantes");
    const estudianteQuery = query(estudiantesRef, where("email", "==", userEmail));
    const estudianteSnapshot = await getDocs(estudianteQuery);

    if (!estudianteSnapshot.empty) {
      const userDoc = estudianteSnapshot.docs[0];
      return userDoc.data().role || null; // Devuelve el rol, o null si no existe
    }

    // Verificar en la colección "Administrador"
    const administradoresRef = collection(db, "Administrador");
    const administradorQuery = query(administradoresRef, where("email", "==", userEmail));
    const administradorSnapshot = await getDocs(administradorQuery);

    if (!administradorSnapshot.empty) {
      const userDoc = administradorSnapshot.docs[0];
      return userDoc.data().role || null; // Devuelve el rol, o null si no existe
    }

    // Si no se encuentra el usuario en ninguna colección
    return null;
  } catch (error) {
    console.error("Error al obtener el rol del usuario:", error);
    return null;
  }
};


// Obtener datos del usuario administrador desde Firestore
export const getAdminData = async (userEmail: string) => {
  try {
    const administradoresRef = collection(db, "Administrador");
    const q = query(administradoresRef, where("email", "==", userEmail));
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      const userDoc = querySnapshot.docs[0]; // Toma el primer documento que coincida
      return userDoc.data(); // Devuelve los datos del usuario administrador
    } else {
      console.error("No se encontraron datos para el administrador con el email:", userEmail);
    }
  } catch (error) {
    console.error("Error al obtener datos del administrador:", error);
  }
  return null; // Devuelve null si no se encuentran datos
};


// Actualiza la foto de perfil del administrador en Firestore
export const updateAdminProfilePhoto = async (userEmail: string, photoDataUrl: string) => {
  try {
    const adminRef = collection(db, "Administrador"); // Colección específica para administradores
    const q = query(adminRef, where("email", "==", userEmail));
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      const userDoc = querySnapshot.docs[0]; // Toma el primer documento que coincida
      const userDocRef = userDoc.ref;

      // Actualiza el campo 'photoUrl' en Firestore
      await updateDoc(userDocRef, {
        photoUrl: photoDataUrl, // Guarda la imagen en formato base64
      });
      console.log("Foto de perfil del administrador actualizada correctamente en Firestore.");
    } else {
      console.error("No se encontró el documento para este administrador.");
    }
  } catch (error) {
    console.error("Error al actualizar la foto de perfil del administrador:", error);
  }
};
