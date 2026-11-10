import { useEffect, useState } from 'react';
import { IonToast } from '@ionic/react';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { useHistory } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, db } from '../firebaseConfig';
import { resolveStudentDocumentId } from '../services/MatchingService';

const RECENT_MATCH_WINDOW_MS = 5 * 60 * 1000;

const MatchNotifications = () => {
  const [message, setMessage] = useState('');
  const history = useHistory();

  useEffect(() => {
    let unsubscribeMatches: Array<() => void> = [];
    let activeUserId: string | null = null;
    let alreadyNotified = false;

    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      unsubscribeMatches.forEach((unsubscribe) => unsubscribe());
      unsubscribeMatches = [];
      activeUserId = user?.uid || null;
      alreadyNotified = false;
      setMessage('');
      if (!user) return;

      try {
        const profileDocumentId = await resolveStudentDocumentId(
          user.uid,
          user.email
        );
        const identityIds = [...new Set([user.uid, profileDocumentId])];
        identityIds.forEach((identityId) => {
          const matchesQuery = query(
            collection(db, 'Chats'),
            where('participants', 'array-contains', identityId)
          );
          const unsubscribe = onSnapshot(
            matchesQuery,
            (snapshot) => {
              if (
                alreadyNotified ||
                localStorage.getItem('allowNotifications') === 'false' ||
                localStorage.getItem('onlyMatches') === 'false'
              ) return;

              const recentMatch = snapshot.docs.find((match) => {
                const matchedAt = match.data().matchedAt;
                if (!matchedAt || typeof matchedAt.toMillis !== 'function') return false;
                const notificationKey = `match-notified-${activeUserId}-${match.id}`;
                return (
                  Date.now() - matchedAt.toMillis() <= RECENT_MATCH_WINDOW_MS &&
                  localStorage.getItem(notificationKey) !== 'true'
                );
              });
              if (recentMatch && activeUserId) {
                alreadyNotified = true;
                localStorage.setItem(
                  `match-notified-${activeUserId}-${recentMatch.id}`,
                  'true'
                );
                setMessage('¡Tienes un nuevo match! Ya pueden conversar.');
              }
            },
            (error) => {
              console.error('Error al escuchar nuevos matches:', error);
            }
          );
          unsubscribeMatches.push(unsubscribe);
        });
      } catch (error) {
        console.error('Error al resolver el perfil para notificaciones:', error);
      }
    });

    return () => {
      unsubscribeAuth();
      unsubscribeMatches.forEach((unsubscribe) => unsubscribe());
    };
  }, []);

  return (
    <IonToast
      isOpen={Boolean(message)}
      message={message}
      duration={5000}
      position="top"
      buttons={[
        {
          text: 'Ver chats',
          handler: () => history.push('/chats'),
        },
      ]}
      onDidDismiss={() => setMessage('')}
    />
  );
};

export default MatchNotifications;
