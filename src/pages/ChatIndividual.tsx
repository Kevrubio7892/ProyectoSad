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
} from "firebase/firestore";
import { db, auth } from "../firebaseConfig";
import { arrowUpOutline } from "ionicons/icons";
import "../styles/ChatIndividualStyles.css";
import { useParams } from "react-router";

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
  const [loadingMessages, setLoadingMessages] = useState<boolean>(true);

  const { userId: receiverId } = useParams<{ userId: string }>();
  const currentUserId = auth.currentUser?.uid;

  useEffect(() => {
    if (!receiverId) return;

    const fetchReceiverData = async () => {
      try {
        const userDoc = await getDoc(doc(db, "Estudiantes", receiverId));
        if (userDoc.exists()) {
          setReceiverData(userDoc.data() as User);
        } else {
          console.warn("Usuario receptor no encontrado.");
        }
      } catch (error) {
        console.error("Error al obtener datos del receptor:", error);
      }
    };

    fetchReceiverData();
  }, [receiverId]);

  useEffect(() => {
    if (!currentUserId || !receiverId) return;

    const messagesRef = collection(db, "Messages");
    const messagesQuery = query(messagesRef, orderBy("timestamp", "asc"));

    const unsubscribe = onSnapshot(messagesQuery, (snapshot) => {
      const loadedMessages = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      } as Message));

      console.log("Loaded Messages:", loadedMessages);

      setMessages(
        loadedMessages.filter(
          (message) =>
            (message.senderId === currentUserId && message.receiverId === receiverId) ||
            (message.senderId === receiverId && message.receiverId === currentUserId)
        )
      );
      setLoadingMessages(false);
    });

    return () => unsubscribe();
  }, [currentUserId, receiverId]);

  useEffect(() => {
    const messagesContainer = document.querySelector(".messages-container");
    if (messagesContainer) {
      messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
  }, [messages]);

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
    } catch (error) {
      console.error("Error enviando mensaje:", error);
    }
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
          {loadingMessages ? (
            <div className="loading-indicator">Cargando mensajes...</div>
          ) : (
            messages.map((message) => (
              <div
                key={message.id}
                className={`message-bubble ${
                  message.senderId === currentUserId ? "sent" : "received" 
                }`}
              >
                {message.content}
                {message.timestamp && (
                  <div className="message-timestamp">
                    {new Date(message.timestamp.toDate()).toLocaleString()}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </IonContent>

      <IonFooter>
        <div className="message-input-container">
          <IonInput
            value={newMessage}
            placeholder="Escribe un mensaje..."
            onIonInput={(e) => setNewMessage(e.detail.value!)}
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
