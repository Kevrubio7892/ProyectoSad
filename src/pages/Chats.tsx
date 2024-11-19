import React, { useState, useEffect } from "react";
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonButtons,
  IonBackButton,
  IonTitle,
  IonContent,
  IonList,
  IonItem,
  IonLabel,
  IonAvatar,
} from "@ionic/react";
import { collection, query, where, onSnapshot, doc, getDoc } from "firebase/firestore";
import { useHistory } from "react-router-dom";
import { db, auth } from "../firebaseConfig";
import "../styles/ChatsStyles.css";

interface User {
  id: string;
  nombreCompleto: string;
  photoUrl: string;
}

const Chats: React.FC = () => {
  const [chats, setChats] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const currentUserId = auth.currentUser?.uid;
  const history = useHistory();

  useEffect(() => {
    if (!currentUserId) return;

    // Sincroniza los chats existentes
    const chatsRef = collection(db, "Chats");
    const chatsQuery = query(chatsRef, where("participants", "array-contains", currentUserId));

    const unsubscribe = onSnapshot(chatsQuery, async (snapshot) => {
      const chatUsers: User[] = [];
      for (const chat of snapshot.docs) {
        const participants = chat.data().participants as string[];
        const otherUserId = participants.find((id) => id !== currentUserId);

        if (otherUserId) {
          const userDoc = await getDoc(doc(db, "Estudiantes", otherUserId));
          if (userDoc.exists()) {
            chatUsers.push({
              id: userDoc.id,
              ...userDoc.data(),
            } as User);
          }
        }
      }
      setChats(chatUsers);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [currentUserId]);

  const goToChat = (userId: string) => {
    history.push(`/chat/${userId}`); // Se pasa correctamente el ID del receptor
  };
  

  return (
    <IonPage className="page-content">
      <IonHeader>
        <IonToolbar className="header-toolbar">
          <IonButtons slot="start">
            <IonBackButton defaultHref="/" className="back-button" />
          </IonButtons>
          <IonTitle>Chats</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent>
        {loading ? (
          <p className="loading-message">Cargando...</p>
        ) : chats.length === 0 ? (
          <p className="empty-message">No tienes chats activos.</p>
        ) : (
          <IonList className="ion-list">
            {chats.map((user) => (
              <IonItem key={user.id} className="ion-item" onClick={() => goToChat(user.id)}>
                <IonAvatar slot="start">
                  <img
                    src={user.photoUrl || "https://via.placeholder.com/150"}
                    alt={user.nombreCompleto}
                  />
                </IonAvatar>
                <IonLabel>
                  <h2 className="user-name">{user.nombreCompleto}</h2>
                </IonLabel>
              </IonItem>
            ))}
          </IonList>
        )}
      </IonContent>
    </IonPage>
  );
};

export default Chats;
