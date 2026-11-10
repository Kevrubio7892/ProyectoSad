import React, { useState, useEffect, useRef } from "react";
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonButtons,
  IonBackButton,
  IonTitle,
  IonContent,
  IonFooter,
  IonInput,
  IonButton,
  IonIcon,
  IonAvatar,
  IonLabel,
  IonList,
  IonItem,
  IonActionSheet,
  IonAlert,
} from "@ionic/react";
import { ellipsisHorizontal } from "ionicons/icons";
import {
  collection,
  doc,
  query,
  orderBy,
  onSnapshot,
  getDoc,
  addDoc,
  updateDoc,
  serverTimestamp,
  limit,
  where,
} from "firebase/firestore";
import { db, auth } from "../firebaseConfig";
import { useParams } from "react-router";
import { useHistory } from "react-router-dom";
import "../styles/ChatIndividualStyles.css"; // Asegúrate de que los estilos están importados
import { getMatchId } from "../utils/match";
import { blockStudent, reportStudent } from "../services/SafetyService";
import { resolveStudentDocumentId } from "../services/MatchingService";

interface Message {
  id: string;
  text: string;
  uid: string;
  timestamp: unknown;
}

const normalizeMessage = (
  id: string,
  data: Record<string, unknown>
): Message => ({
  id,
  text: String(data.text ?? data.content ?? data.message ?? ''),
  uid: String(data.uid ?? data.senderId ?? data.fromUserId ?? ''),
  timestamp: data.timestamp ?? data.createdAt ?? null,
});

const timestampToMillis = (timestamp: unknown): number => {
  if (
    typeof timestamp === 'object' &&
    timestamp !== null &&
    'toMillis' in timestamp &&
    typeof timestamp.toMillis === 'function'
  ) {
    return timestamp.toMillis();
  }
  if (timestamp instanceof Date) return timestamp.getTime();
  if (typeof timestamp === 'number') return timestamp;
  return 0;
};

const ChatView: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [currentUserName, setCurrentUserName] = useState<string | null>(null);
  const [currentUserPhoto, setCurrentUserPhoto] = useState<string>(''); // Para la foto del usuario
  const [otherUserName, setOtherUserName] = useState('Estudiante');
  const [otherUserPhoto, setOtherUserPhoto] = useState('');
  const currentUser = auth.currentUser;
  const { chatId: routeChatId, userId: otherUserId } = useParams<{
    chatId?: string;
    userId: string;
  }>();
  const history = useHistory();
  const [chatId, setChatId] = useState<string | null>(null);
  const [currentProfileId, setCurrentProfileId] = useState<string | null>(null);
  const [isResolvingChat, setIsResolvingChat] = useState(true);
  const [isLoadingMessages, setIsLoadingMessages] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [chatError, setChatError] = useState('');
  const [showSafetyActions, setShowSafetyActions] = useState(false);
  const [showReportAlert, setShowReportAlert] = useState(false);
  const messagesContentRef = useRef<HTMLIonContentElement | null>(null);

  useEffect(() => {
    let active = true;
    const resolveMatch = async () => {
      if (!currentUser?.uid || !otherUserId) {
        history.replace('/chats');
        setIsResolvingChat(false);
        return;
      }

      setIsResolvingChat(true);
      try {
        const currentProfileId = await resolveStudentDocumentId(
          currentUser.uid,
          currentUser.email
        );
        if (active) setCurrentProfileId(currentProfileId);
        const id = routeChatId || getMatchId(currentUser.uid, otherUserId);
        const [
          match,
          blockedByCurrentUser,
          blockedByCurrentProfile,
          blockedByOtherUser,
        ] = await Promise.all([
          getDoc(doc(db, 'Chats', id)),
          getDoc(doc(db, 'Estudiantes', currentUser.uid, 'BLOCKED', otherUserId)),
          getDoc(doc(db, 'Estudiantes', currentProfileId, 'BLOCKED', otherUserId)),
          getDoc(doc(db, 'Estudiantes', otherUserId, 'BLOCKED', currentUser.uid)),
        ]);
        const participants = match.data()?.participants;
        const isParticipant =
          Array.isArray(participants) &&
          (participants.includes(currentUser.uid) ||
            participants.includes(currentProfileId)) &&
          participants.includes(otherUserId);

        if (
          match.exists() &&
          isParticipant &&
          !blockedByCurrentUser.exists() &&
          !blockedByCurrentProfile.exists() &&
          !blockedByOtherUser.exists() &&
          active
        ) {
          setChatId(id);
        } else if (active) {
          setChatError('No se pudo encontrar esta coincidencia o ya no tienes acceso a ella.');
        }
      } catch (error) {
        console.error('Error al comprobar la coincidencia:', error);
        if (active) {
          setChatError('No se pudo comprobar el acceso a esta conversación.');
        }
      } finally {
        if (active) setIsResolvingChat(false);
      }
    };

    resolveMatch();
    return () => {
      active = false;
    };
  }, [currentUser?.uid, history, otherUserId, routeChatId]);

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        if (currentUser?.uid) {
          const currentProfileId = await resolveStudentDocumentId(
            currentUser.uid,
            currentUser.email
          );
          const userRef = doc(db, 'Estudiantes', currentProfileId);
          const userSnap = await getDoc(userRef);
          if (userSnap.exists()) {
            const userData = userSnap.data();
            setCurrentUserName(userData?.nombreCompleto || 'Anonymous');
            setCurrentUserPhoto(userData?.photoUrl || 'https://via.placeholder.com/150');
          }
        }
        if (otherUserId) {
          const otherProfileId = await resolveStudentDocumentId(otherUserId);
          const otherUserRef = doc(db, 'Estudiantes', otherProfileId);
          const otherUserSnap = await getDoc(otherUserRef);
          if (otherUserSnap.exists()) {
            const otherUserData = otherUserSnap.data();
            setOtherUserName(otherUserData.nombreCompleto || 'Estudiante');
            setOtherUserPhoto(otherUserData.photoUrl || 'https://via.placeholder.com/150');
          }
        }
      } catch (error) {
        console.error('Error al cargar los perfiles de la conversación:', error);
        setChatError('No se pudieron cargar los datos de la conversación.');
      }
    };

    fetchUserInfo();
  }, [currentUser, otherUserId]);

  useEffect(() => {
    if (!chatId || !currentUser?.uid || !otherUserId) return;

    let active = true;
    const messagesBySource = new Map<string, Message>();
    const unsubscribeAll: Array<() => void> = [];
    const publishMessages = () => {
      if (!active) return;
      const sorted = [...messagesBySource.values()].sort((first, second) => {
        const firstTime = timestampToMillis(first.timestamp);
        const secondTime = timestampToMillis(second.timestamp);
        return firstTime - secondTime;
      });
      setMessages(sorted.slice(-100));
      setIsLoadingMessages(false);
    };

    const handleReadError = (error: Error & { code?: string }) => {
      console.error('Error al escuchar mensajes:', error);
      if (active) {
        setIsLoadingMessages(false);
        const code = error.code ? ` (${error.code})` : '';
        setChatError(`No se pueden recibir mensajes${code}. Revisa los permisos de Firestore.`);
      }
    };

    const subscribe = async () => {
      try {
        const [currentProfileId, otherProfileId] = await Promise.all([
          resolveStudentDocumentId(currentUser.uid, currentUser.email),
          resolveStudentDocumentId(otherUserId),
        ]);
        if (!active) return;

        const nestedMessagesQuery = query(
          collection(db, 'Chats', chatId, 'messages'),
          orderBy('timestamp', 'desc'),
          limit(100)
        );
        unsubscribeAll.push(onSnapshot(nestedMessagesQuery, (snapshot) => {
          for (const [key, message] of messagesBySource) {
            if (key.startsWith('chat:')) messagesBySource.delete(key);
          }
          snapshot.docs.forEach((messageDoc) => {
            messagesBySource.set(
              `chat:${messageDoc.id}`,
              normalizeMessage(messageDoc.id, messageDoc.data())
            );
          });
          publishMessages();
        }, handleReadError));

        const senderIds = [...new Set([currentUser.uid, currentProfileId])];
        const receiverIds = [...new Set([otherUserId, otherProfileId])];
        const legacyQueries = [
          ...senderIds.flatMap((senderId) =>
            receiverIds.map((receiverId) =>
              query(
                collection(db, 'Messages'),
                where('senderId', '==', senderId),
                where('receiverId', '==', receiverId),
                orderBy('timestamp', 'desc'),
                limit(100)
              )
            )
          ),
          ...receiverIds.flatMap((senderId) =>
            senderIds.map((receiverId) =>
              query(
                collection(db, 'Messages'),
                where('senderId', '==', senderId),
                where('receiverId', '==', receiverId),
                orderBy('timestamp', 'desc'),
                limit(100)
              )
            )
          ),
        ];

        legacyQueries.forEach((legacyQuery, queryIndex) => {
          unsubscribeAll.push(onSnapshot(legacyQuery, (snapshot) => {
            const sourcePrefix = `legacy:${queryIndex}:`;
            for (const key of messagesBySource.keys()) {
              if (key.startsWith(sourcePrefix)) messagesBySource.delete(key);
            }
            snapshot.docs.forEach((messageDoc) => {
              messagesBySource.set(
                `${sourcePrefix}${messageDoc.id}`,
                normalizeMessage(messageDoc.id, messageDoc.data())
              );
            });
            publishMessages();
          }, handleReadError));
        });
      } catch (error) {
        console.error('Error al preparar la recepción de mensajes:', error);
        if (active) setChatError('No se pudieron preparar los mensajes de esta conversación.');
      }
    };

    void subscribe();
    return () => {
      active = false;
      unsubscribeAll.forEach((unsubscribe) => unsubscribe());
    };
  }, [chatId, currentUser?.email, currentUser?.uid, otherUserId]);

  useEffect(() => {
    if (messages.length > 0) {
      void messagesContentRef.current?.scrollToBottom(250);
    }
  }, [messages]);

  const sendMessage = async () => {
    const text = newMessage.trim();
    if (!text || !chatId || !currentUser?.uid) return;
    if (text.length > 2000) {
      setChatError('El mensaje no puede superar los 2000 caracteres.');
      return;
    }

    setIsSending(true);
    try {
      await addDoc(collection(db, 'Chats', chatId, 'messages'), {
        text,
        uid: currentUser.uid,
        timestamp: serverTimestamp(),
      });

      setNewMessage('');
      setChatError('');
      try {
        await updateDoc(doc(db, 'Chats', chatId), {
          lastMessage: text,
          lastMessageSenderId: currentUser.uid,
          lastMessageAt: serverTimestamp(),
        });
      } catch (metadataError) {
        console.error('El mensaje se envió, pero no se pudo actualizar su vista previa:', metadataError);
        setChatError('Mensaje enviado. No se pudo actualizar la vista previa del chat.');
      }
    } catch (error) {
      console.error('Error al enviar el mensaje:', error);
      const code =
        typeof error === 'object' && error && 'code' in error
          ? ` (${String(error.code)})`
          : '';
      setChatError(`No se pudo enviar el mensaje${code}. Inténtalo nuevamente.`);
    } finally {
      setIsSending(false);
    }
  };

  const handleBlock = async () => {
    if (!currentUser?.uid || !otherUserId) return;
    try {
      await blockStudent(currentUser.uid, otherUserId);
      history.replace('/chats');
    } catch (error) {
      console.error('Error al bloquear al usuario:', error);
      setChatError('No se pudo bloquear este perfil. Inténtalo nuevamente.');
    }
  };

  const handleReport = async (reason: string) => {
    if (!currentUser?.uid || !otherUserId) return;
    try {
      await reportStudent(currentUser.uid, otherUserId, reason);
      setChatError('Reporte enviado. Gracias por ayudarnos a mantener segura la comunidad.');
    } catch (error) {
      console.error('Error al reportar al usuario:', error);
      setChatError(error instanceof Error ? error.message : 'No se pudo enviar el reporte.');
    }
  };

  return (
    <IonPage className="chat-page">
      <IonHeader>
        <IonToolbar className="chat-header">
          <IonButtons slot="start">
            <IonBackButton defaultHref="/" className="back-button" />
          </IonButtons>
          <IonTitle>{otherUserName}</IonTitle>
          <IonButtons slot="end">
            <IonButton
              aria-label="Opciones de seguridad de la conversación"
              onClick={() => setShowSafetyActions(true)}
            >
              <IonIcon icon={ellipsisHorizontal} />
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>

      <IonContent ref={messagesContentRef} className="messages-container">
        {chatError && <p role="alert">{chatError}</p>}
        {isResolvingChat && <p role="status">Conectando a la conversación...</p>}
        {!isResolvingChat && chatId && isLoadingMessages && (
          <p role="status">Cargando mensajes...</p>
        )}
        {!isResolvingChat && chatId && !isLoadingMessages && messages.length === 0 && (
          <p role="status" className="empty-chat">
            Aún no hay mensajes. ¡Saluda para iniciar la conversación!
          </p>
        )}
        <IonList>
          {messages.map((message) => (
            <IonItem
              key={message.id}
              className={
                message.uid === currentUser?.uid || message.uid === currentProfileId
                  ? 'my-message'
                  : 'other-message'
              }
            >
              <IonAvatar className="chat-avatar">
                <img
                  src={
                    message.uid === currentUser?.uid || message.uid === currentProfileId
                      ? currentUserPhoto || 'https://via.placeholder.com/150'
                      : otherUserPhoto || 'https://via.placeholder.com/150'
                  }
                  alt={message.uid === currentUser?.uid ? currentUserName || 'Tú' : otherUserName}
                />
              </IonAvatar>
              <IonLabel>
                <h3>
                  {message.uid === currentUser?.uid || message.uid === currentProfileId
                    ? currentUserName || 'Tú'
                    : otherUserName}
                </h3>
                <p
                  className={
                    message.uid === currentUser?.uid || message.uid === currentProfileId
                      ? 'message-bubble sent'
                      : 'message-bubble received'
                  }
                >
                  {message.text}
                </p>
              </IonLabel>
            </IonItem>
          ))}
        </IonList>
        <IonActionSheet
          isOpen={showSafetyActions}
          onDidDismiss={() => setShowSafetyActions(false)}
          buttons={[
            { text: 'Bloquear perfil', role: 'destructive', handler: () => { void handleBlock(); } },
            { text: 'Reportar perfil', handler: () => setShowReportAlert(true) },
            { text: 'Cancelar', role: 'cancel' },
          ]}
        />
        <IonAlert
          isOpen={showReportAlert}
          onDidDismiss={() => setShowReportAlert(false)}
          header="Reportar perfil"
          message="Describe el motivo. El reporte será enviado para revisión."
          inputs={[
            {
              name: 'reason',
              type: 'textarea',
              placeholder: 'Describe el problema (10-1000 caracteres)',
            },
          ]}
          buttons={[
            { text: 'Cancelar', role: 'cancel' },
            {
              text: 'Enviar reporte',
              handler: ({ reason }) => {
                void handleReport(reason || '');
                return true;
              },
            },
          ]}
        />
      </IonContent>

      <IonFooter>
        <IonToolbar>
          <IonInput
            value={newMessage}
            placeholder="Escribe un mensaje..."
            onIonInput={(e) => setNewMessage(e.detail.value || '')}
            maxlength={2000}
            className="message-input"
            disabled={!chatId || isSending}
          />
          <IonButton
            expand="full"
            onClick={() => { void sendMessage(); }}
            className="send-button"
            fill="clear"
            disabled={!chatId || isSending || !newMessage.trim()}
          >
            Enviar
          </IonButton>
        </IonToolbar>
      </IonFooter>
    </IonPage>
  );
};

export default ChatView;
