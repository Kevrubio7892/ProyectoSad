import React, { useState, useEffect } from "react";
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
  IonAvatar,
  IonIcon,
} from "@ionic/react";
import {
  collection,
  addDoc,
  query,
  orderBy,
  onSnapshot,
  doc,
  getDoc,
  updateDoc,
} from "firebase/firestore";
import { db, auth } from "../firebaseConfig";
import { arrowUpOutline } from "ionicons/icons"; // Importa el ícono de flecha hacia arriba
import "../styles/ChatIndividualStyles.css";

interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  timestamp: any;
}

interface User {
  id: string;
  nombreCompleto: string;
  photoUrl: string;
}

interface ChatViewProps {
  match: {
    params: {
      userId: string;
    };
  };
}

const ChatView: React.FC<ChatViewProps> = ({ match }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState<string>("");
  const [receiverData, setReceiverData] = useState<User | null>(null);
  const [isTyping, setIsTyping] = useState<boolean>(false);

  const receiverId = match.params.userId;
  const currentUserId = auth.currentUser?.uid;

  useEffect(() => {
    if (!receiverId) return;

    const fetchReceiverData = async () => {
      const userDoc = await getDoc(doc(db, "Estudiantes", receiverId));
      if (userDoc.exists()) {
        setReceiverData(userDoc.data() as User);
      }
    };

    fetchReceiverData();
  }, [receiverId]);

  useEffect(() => {
    if (!currentUserId || !receiverId) return;

    const messagesRef = collection(db, "Messages");
    const messagesQuery = query(messagesRef, orderBy("timestamp", "asc"));

    const unsubscribe = onSnapshot(messagesQuery, (snapshot) => {
      const loadedMessages = snapshot.docs
        .map((doc) => ({ id: doc.id, ...doc.data() }))
        .filter(
          (message: any) =>
            (message.senderId === currentUserId && message.receiverId === receiverId) ||
            (message.senderId === receiverId && message.receiverId === currentUserId)
        ) as Message[];
      setMessages(loadedMessages);
    });

    return () => unsubscribe();
  }, [currentUserId, receiverId]);

  const sendMessage = async () => {
    if (!newMessage.trim() || !currentUserId || !receiverId) return;

    try {
      await addDoc(collection(db, "Messages"), {
        senderId: currentUserId,
        receiverId: receiverId,
        content: newMessage.trim(),
        timestamp: new Date(),
      });
      setNewMessage("");
      await updateDoc(doc(db, "TypingStatus", receiverId), {
        isTyping: false,
      });
    } catch (error) {
      console.error("Error enviando mensaje:", error);
    }
  };

  useEffect(() => {
    if (!currentUserId || !receiverId) return;

    const typingRef = doc(db, "TypingStatus", receiverId);

    const unsubscribe = onSnapshot(typingRef, (doc) => {
      if (doc.exists()) {
        setIsTyping(doc.data()?.isTyping || false);
      }
    });

    return () => unsubscribe();
  }, [currentUserId, receiverId]);

  const handleTyping = async () => {
    if (!currentUserId) return;

    const typingRef = doc(db, "TypingStatus", currentUserId);
    await updateDoc(typingRef, {
      isTyping: newMessage.length > 0,
    });
  };

  return (
    <IonPage className="chat-page">
      <IonHeader>
        <IonToolbar className="chat-header">
          <IonButtons slot="start">
            <IonBackButton defaultHref="/chats" />
          </IonButtons>
          {receiverData && (
            <>
              <IonAvatar className="chat-avatar">
                <img
                  src={receiverData.photoUrl || "https://via.placeholder.com/150"}
                  alt="Avatar del Usuario"
                />
              </IonAvatar>
              <IonTitle className="chat-title">{receiverData.nombreCompleto}</IonTitle>
            </>
          )}
        </IonToolbar>
      </IonHeader>

      <IonContent>
        <div className="messages-container">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`message-bubble ${
                message.senderId === currentUserId ? "sent" : "received"
              }`}
            >
              {message.content}
            </div>
          ))}
          {isTyping && <div className="typing-indicator">Escribiendo...</div>}
        </div>
      </IonContent>

      <IonFooter>
        <div className="message-input-container">
          <IonInput
            value={newMessage}
            placeholder="Escribe un mensaje..."
            onIonInput={(e) => {
              setNewMessage(e.detail.value!);
              handleTyping();
            }}
            className="message-input"
          />
          <IonButton onClick={sendMessage} className="send-button">
            <IonIcon icon={arrowUpOutline} />
          </IonButton>
        </div>
      </IonFooter>
    </IonPage>
  );
};

export default ChatView;
