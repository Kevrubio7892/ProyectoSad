// services/firestoreService.ts
import { db } from '../firebaseConfig';
import { addDoc, collection, getDocs, query, where } from "firebase/firestore";

// Función para registrar un estudiante
export const registerEstudiante = async (data: any) => {
  try {
    const docRef = await addDoc(collection(db, "Estudiantes"), data);
    console.log("Estudiante registrado con ID: ", docRef.id);
    return docRef.id;
  } catch (error) {
    console.error("Error al registrar el estudiante: ", error);
    throw error;
  }
};

// Función para agregar carreras de forma masiva con verificación de existencia en Firestore
export const addCarrerasMasivas = async () => {
  const carreras = [
    "Ingeniería en Informática",
    "Ingeniería en Marketing",
    "Administración de Empresas",
    "Contabilidad",
    "Psicología",
    "Derecho",
    "Medicina",
    "Ingeniería Civil",
    "Arquitectura",
    "Diseño Gráfico"
  ];

  try {
    const carrerasCollection = collection(db, "Carreras");

    for (const carrera of carreras) {
      // Verificar si ya existe una carrera con el mismo nombre en Firestore
      const carreraQuery = query(carrerasCollection, where("nombreCarrera", "==", carrera));
      const querySnapshot = await getDocs(carreraQuery);

      if (querySnapshot.empty) {
        // Si no existe, agregarla
        await addDoc(carrerasCollection, { nombreCarrera: carrera });
        console.log(`Carrera "${carrera}" agregada correctamente`);
      } else {
        console.log(`Carrera "${carrera}" ya existe, no se agregó`);
      }
    }
  } catch (error) {
    console.error("Error al agregar carreras: ", error);
  }
};

// Función para obtener carreras desde Firestore
export const getCarreras = async () => {
  const carrerasCollection = collection(db, "Carreras");
  const carrerasSnapshot = await getDocs(carrerasCollection);
  const carrerasList = carrerasSnapshot.docs.map(doc => doc.data().nombreCarrera);
  return carrerasList;
};

// Función para agregar géneros de forma masiva con verificación de existencia en Firestore
export const addGenerosMasivas = async () => {
  const generos = [
    "Masculino",
    "Femenino",
    "No Binario",
    "Género Fluido",
    "Género No Conforme",
    "Género Queer",
    "Agénero",
    "Transgénero",
    "Bigénero",
    "Pangénero",
    "Otro",
    "Prefiero No Decirlo"
  ];

  try {
    const generosCollection = collection(db, "Generos");

    for (const genero of generos) {
      // Verificar si ya existe un género con el mismo nombre en Firestore
      const generoQuery = query(generosCollection, where("descripcion", "==", genero));
      const querySnapshot = await getDocs(generoQuery);

      if (querySnapshot.empty) {
        // Si no existe, agregarlo
        await addDoc(generosCollection, { descripcion: genero });
        console.log(`Género "${genero}" agregado correctamente`);
      } else {
        console.log(`Género "${genero}" ya existe, no se agregó`);
      }
    }
  } catch (error) {
    console.error("Error al agregar géneros: ", error);
  }
};

// Función para obtener géneros desde Firestore en un orden específico
export const getGeneros = async () => {
  const generosCollection = collection(db, "Generos");
  const generosSnapshot = await getDocs(generosCollection);

  // Definir el orden deseado para los géneros
  const ordenGeneros = [
    "Masculino",
    "Femenino",
    "No Binario",
    "Género Fluido",
    "Género No Conforme",
    "Género Queer",
    "Agénero",
    "Transgénero",
    "Bigénero",
    "Pangénero",
    "Otro",
    "Prefiero No Decirlo"
  ];

  // Mapear los documentos de Firestore a un arreglo de descripciones y ordenarlos
  const generosList = generosSnapshot.docs
    .map(doc => doc.data().descripcion)
    .sort((a, b) => ordenGeneros.indexOf(a) - ordenGeneros.indexOf(b));

  return generosList;
};
