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
} from "@ionic/react";
import {
  collection,
  addDoc,
  query,
  orderBy,
  onSnapshot,
  doc,
  getDoc,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import { db, auth } from "../firebaseConfig"; // Configuración de Firestore
import "../styles/ChatIndividualStyles.css"; // Estilos personalizados para el chat

interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  timestamp: any; // Timestamp de Firestore
}

interface User {
  id: string;
  nombreCompleto: string;
  photoUrl: string;
}

interface ChatViewProps {
  match: {
    params: {
      userId: string; // ID del usuario con quien se está chateando
    };
  };
}

const ChatView: React.FC<ChatViewProps> = ({ match }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState<string>("");
  const [receiverData, setReceiverData] = useState<User | null>(null); // Datos del usuario receptor
  const [isTyping, setIsTyping] = useState(false); // Estado "escribiendo" del otro usuario
  const receiverId = match.params.userId; // ID del usuario con quien se chatea
  const currentUserId = auth.currentUser?.uid; // ID del usuario autenticado

  const chatDocId = [currentUserId, receiverId].sort().join("_"); // Generar un ID único para el chat

  useEffect(() => {
    if (!receiverId) return;

    // Obtén los datos del receptor desde Firestore
    const fetchReceiverData = async () => {
      try {
        const userDoc = await getDoc(doc(db, "Estudiantes", receiverId));
        if (userDoc.exists()) {
          const userData = userDoc.data() as User;
          setReceiverData(userData);
        } else {
          console.error("Usuario no encontrado");
        }
      } catch (error) {
        console.error("Error al obtener datos del receptor:", error);
      }
    };

    fetchReceiverData();
  }, [receiverId]);

  useEffect(() => {
    if (!currentUserId || !receiverId) return;

    // Escucha en tiempo real los mensajes entre los dos usuarios
    const messagesRef = collection(db, "Messages");
    const messagesQuery = query(messagesRef, orderBy("timestamp", "asc"));

    const unsubscribeMessages = onSnapshot(messagesQuery, (snapshot) => {
      const loadedMessages = snapshot.docs
        .map((doc) => ({ id: doc.id, ...doc.data() }))
        .filter(
          (message: any) =>
            (message.senderId === currentUserId && message.receiverId === receiverId) ||
            (message.senderId === receiverId && message.receiverId === currentUserId)
        ) as Message[];
      setMessages(loadedMessages);
    });

    // Escucha en tiempo real el estado de "escribiendo" del receptor
    const typingDocRef = doc(db, "TypingStatus", chatDocId);
    const unsubscribeTyping = onSnapshot(typingDocRef, (docSnapshot) => {
      if (docSnapshot.exists()) {
        const typingData = docSnapshot.data();
        setIsTyping(typingData?.[receiverId] || false);
      }
    });

    return () => {
      unsubscribeMessages();
      unsubscribeTyping();
    };
  }, [currentUserId, receiverId]);

  const handleInputChange = async (value: string) => {
    setNewMessage(value);
  
    if (!currentUserId) return; // Asegúrate de que currentUserId no es undefined
  
    // Actualiza el estado "escribiendo" en Firestore
    const typingDocRef = doc(db, "TypingStatus", chatDocId);
    await setDoc(
      typingDocRef,
      { [currentUserId.toString()]: value.length > 0 }, // Convierte currentUserId a string explícitamente
      { merge: true }
    );
  };
  
  const sendMessage = async () => {
    if (!newMessage.trim() || !currentUserId || !receiverId) return;
  
    try {
      await addDoc(collection(db, "Messages"), {
        senderId: currentUserId,
        receiverId: receiverId,
        content: newMessage.trim(),
        timestamp: new Date(),
      });
  
      // Limpia el estado "escribiendo"
      const typingDocRef = doc(db, "TypingStatus", chatDocId);
      await setDoc(
        typingDocRef,
        { [currentUserId.toString()]: false }, // Convierte currentUserId a string explícitamente
        { merge: true }
      );
  
      setNewMessage(""); // Limpia el campo de entrada
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
                <img src={receiverData.photoUrl || "https://via.placeholder.com/150"} alt="Avatar del Usuario" />
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
          {isTyping && (
            <div className="typing-indicator">El usuario está escribiendo...</div>
          )}
        </div>
      </IonContent>

      <IonFooter>
        <div className="message-input-container">
          <IonInput
            value={newMessage}
            placeholder="Escribe un mensaje..."
            onIonChange={(e) => handleInputChange(e.detail.value!)}
            className="message-input"
          />
          <IonButton onClick={sendMessage} className="send-button">
            Enviar
          </IonButton>
        </div>
      </IonFooter>
    </IonPage>
  );
};

export default ChatView;
