import {
  collection,
  doc,
  getDocs,
  getDoc,
  limit,
  query,
  serverTimestamp,
  setDoc,
  where,
} from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { getMatchId } from '../utils/match';

const hasLikeFrom = async (
  recipientProfileId: string,
  senderId: string,
  collectionName: 'LIKES' | 'SUPER_LIKES'
): Promise<boolean> => {
  const deterministicLike = await getDoc(
    doc(db, 'Estudiantes', recipientProfileId, collectionName, senderId)
  );
  if (deterministicLike.exists()) {
    return true;
  }

  const legacyLikes = await getDocs(
    query(
      collection(db, 'Estudiantes', recipientProfileId, collectionName),
      where('fromUserId', '==', senderId),
      limit(1)
    )
  );
  return !legacyLikes.empty;
};

export const resolveStudentDocumentId = async (
  uid: string,
  email?: string | null
): Promise<string> => {
  const directProfile = await getDoc(doc(db, 'Estudiantes', uid));
  if (directProfile.exists()) return uid;

  const students = collection(db, 'Estudiantes');
  const byUid = await getDocs(
    query(students, where('uid', '==', uid), limit(1))
  );
  if (!byUid.empty) return byUid.docs[0].id;

  if (email) {
    const byEmail = await getDocs(
      query(students, where('email', '==', email), limit(1))
    );
    if (!byEmail.empty) return byEmail.docs[0].id;
  }

  throw new Error('No se encontró el perfil asociado a la cuenta autenticada.');
};

export const likeStudent = async (
  fromUserId: string,
  toUserId: string,
  fromEmail?: string | null
): Promise<string | null> => {
  if (!fromUserId || !toUserId || fromUserId === toUserId) {
    throw new Error('No se puede registrar un like para este perfil.');
  }

  const [fromProfileId, toProfileId] = await Promise.all([
    resolveStudentDocumentId(fromUserId, fromEmail),
    resolveStudentDocumentId(toUserId),
  ]);

  await setDoc(doc(db, 'Estudiantes', toProfileId, 'LIKES', fromUserId), {
    fromUserId,
    toUserId,
    createdAt: serverTimestamp(),
  });

  const [reciprocalLike, reciprocalSuperLike] = await Promise.all([
    hasLikeFrom(fromProfileId, toUserId, 'LIKES'),
    hasLikeFrom(fromProfileId, toUserId, 'SUPER_LIKES'),
  ]);
  if (!reciprocalLike && !reciprocalSuperLike) {
    return null;
  }

  const matchId = getMatchId(fromUserId, toUserId);
  const participants = [fromUserId, toUserId].sort();
  await setDoc(
    doc(db, 'Chats', matchId),
    {
      participants,
      createdAt: serverTimestamp(),
      lastMessageAt: serverTimestamp(),
      matchedAt: serverTimestamp(),
    },
    { merge: true }
  );

  return matchId;
};

export const sendSuperLike = async (
  fromUserId: string,
  toUserId: string
): Promise<void> => {
  if (!fromUserId || !toUserId || fromUserId === toUserId) {
    throw new Error('No se puede enviar un Super Like a este perfil.');
  }

  const toProfileId = await resolveStudentDocumentId(toUserId);
  await setDoc(doc(db, 'Estudiantes', toProfileId, 'SUPER_LIKES', fromUserId), {
    fromUserId,
    toUserId,
    createdAt: serverTimestamp(),
  });
};
