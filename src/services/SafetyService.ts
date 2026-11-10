import {
  addDoc,
  collection,
  doc,
  serverTimestamp,
  setDoc,
} from 'firebase/firestore';
import { db } from '../firebaseConfig';

const validatePair = (reporterId: string, subjectId: string) => {
  if (!reporterId || !subjectId || reporterId === subjectId) {
    throw new Error('La acción de seguridad requiere dos usuarios válidos.');
  }
};

export const blockStudent = async (reporterId: string, blockedUserId: string) => {
  validatePair(reporterId, blockedUserId);
  await setDoc(doc(db, 'Estudiantes', reporterId, 'BLOCKED', blockedUserId), {
    blockedUserId,
    createdAt: serverTimestamp(),
  });
}

export const reportStudent = async (
  reporterId: string,
  reportedUserId: string,
  reason: string
) => {
  validatePair(reporterId, reportedUserId);
  const normalizedReason = reason.trim();
  if (normalizedReason.length < 10 || normalizedReason.length > 1000) {
    throw new Error('Describe el reporte con entre 10 y 1000 caracteres.');
  }

  await addDoc(collection(db, 'UserReports'), {
    reporterId,
    reportedUserId,
    reason: normalizedReason,
    status: 'pending',
    createdAt: serverTimestamp(),
  });
};
