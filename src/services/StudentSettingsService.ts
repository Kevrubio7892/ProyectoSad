import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  updateDoc,
  where,
} from 'firebase/firestore';
import { auth, db } from '../firebaseConfig';
import { normalizePhoneNumber } from '../utils/phoneNumber';

const resolveStudentReference = async (
  uid: string,
  email?: string | null,
  phoneNumber?: string | null
): Promise<string | null> => {
  const directReference = doc(db, 'Estudiantes', uid);
  if ((await getDoc(directReference)).exists()) {
    return uid;
  }

  const studentCollection = collection(db, 'Estudiantes');
  const lookups: Array<ReturnType<typeof query>> = [
    query(studentCollection, where('uid', '==', uid)),
  ];
  if (email) {
    lookups.push(query(studentCollection, where('email', '==', email)));
  }
  const normalizedPhone = phoneNumber ? normalizePhoneNumber(phoneNumber) : null;
  if (normalizedPhone) {
    lookups.push(query(studentCollection, where('telefono', '==', normalizedPhone)));
  }

  for (const lookup of lookups) {
    const snapshot = await getDocs(lookup);
    if (!snapshot.empty) {
      return snapshot.docs[0].id;
    }
  }

  return null;
};

export const updateStudentDiscoveryPreference = async (
  field: 'isDiscoverable',
  value: boolean
): Promise<void> => {
  const user = auth.currentUser;
  if (!user) {
    throw new Error('Debes iniciar sesión para cambiar las preferencias.');
  }

  const studentId = await resolveStudentReference(
    user.uid,
    user.email,
    user.phoneNumber
  );
  if (!studentId) {
    throw new Error('No se encontró el perfil de estudiante asociado a la cuenta.');
  }

  await updateDoc(doc(db, 'Estudiantes', studentId), { [field]: value });
};

export const getStudentDiscoveryPreference = async (): Promise<boolean> => {
  const user = auth.currentUser;
  if (!user) {
    throw new Error('Debes iniciar sesión para cargar las preferencias.');
  }

  const studentId = await resolveStudentReference(
    user.uid,
    user.email,
    user.phoneNumber
  );
  if (!studentId) {
    throw new Error('No se encontró el perfil de estudiante asociado a la cuenta.');
  }

  const student = await getDoc(doc(db, 'Estudiantes', studentId));
  return student.data()?.isDiscoverable !== false;
};
