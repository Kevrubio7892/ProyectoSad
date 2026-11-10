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
  IonToast,
} from "@ionic/react";
import {
  collection,
  query,
  where,
  onSnapshot,
  doc,
  getDoc,
  getDocs,
  Timestamp,
  QueryDocumentSnapshot,
} from "firebase/firestore";
import { useHistory } from "react-router-dom";
import { db, auth } from "../firebaseConfig";
import { resolveStudentDocumentId } from "../services/MatchingService";
import "../styles/ChatsStyles.css";

interface User {
  id: string;
  chatId: string;
  nombreCompleto: string;
  photoUrl: string;
  lastMessage: string;
  lastMessageAt: Timestamp | null;
  lastMessageSenderId?: string;
}

const Chats: React.FC = () => {
  const [chats, setChats] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [loadError, setLoadError] = useState("");
  const [notification, setNotification] = useState("");
  const currentUserId = auth.currentUser?.uid;
  const history = useHistory();

  useEffect(() => {
    if (!currentUserId) {
      setLoading(false);
      setLoadError("Inicia sesión para ver tus coincidencias.");
      return;
    }

    let active = true;
    const unsubscribeChats: Array<() => void> = [];
    const snapshotsByIdentity = new Map<
      string,
      Map<string, QueryDocumentSnapshot>
    >();

    const subscribeToChats = async () => {
      try {
        const profileDocumentId = await resolveStudentDocumentId(
          currentUserId,
          auth.currentUser?.email
        );
        const identityIds = [...new Set([currentUserId, profileDocumentId])];
        const blockedSnapshots = await Promise.all(
          identityIds.map((identityId) =>
            getDocs(collection(db, "Estudiantes", identityId, "BLOCKED"))
          )
        );
        if (!active) return;
        const blockedIds = new Set(
          blockedSnapshots.flatMap((snapshot) =>
            snapshot.docs.map((blocked) => blocked.id)
          )
        );
        const chatsRef = collection(db, "Chats");

        const updateChatList = async () => {
          try {
            const uniqueChats = new Map<string, QueryDocumentSnapshot>();
            for (const identityChats of snapshotsByIdentity.values()) {
              identityChats.forEach((chat, id) => uniqueChats.set(id, chat));
            }

            const chatUsers: Array<User | null> = await Promise.all(
              [...uniqueChats.values()].map(async (chat) => {
                const data = chat.data();
                const participants = Array.isArray(data.participants)
                  ? data.participants.filter((id): id is string => typeof id === "string")
                  : [];
                const otherUserId = participants.find(
                  (id) => !identityIds.includes(id)
                );
                if (!otherUserId || blockedIds.has(otherUserId)) return null;

                let userDoc = await getDoc(doc(db, "Estudiantes", otherUserId));
                if (!userDoc.exists()) {
                  const profileQuery = query(
                    collection(db, "Estudiantes"),
                    where("uid", "==", otherUserId)
                  );
                  const profiles = await getDocs(profileQuery);
                  userDoc = profiles.docs[0];
                }
                if (!userDoc?.exists()) return null;
                const profile = userDoc.data();
                return {
                  id: otherUserId,
                  chatId: chat.id,
                  nombreCompleto: profile.nombreCompleto || "Estudiante",
                  photoUrl: profile.photoUrl || "",
                  lastMessage: typeof data.lastMessage === "string" ? data.lastMessage : "",
                  lastMessageAt: data.lastMessageAt instanceof Timestamp ? data.lastMessageAt : null,
                  lastMessageSenderId: typeof data.lastMessageSenderId === "string"
                    ? data.lastMessageSenderId
                    : undefined,
                } satisfies User;
              })
            );

            if (active) {
              setChats(
                chatUsers
                  .filter((user): user is User => user !== null)
                  .sort((a, b) => (b.lastMessageAt?.toMillis() || 0) - (a.lastMessageAt?.toMillis() || 0))
              );
              setLoadError("");
              setLoading(false);
            }
          } catch (error) {
            console.error("Error al cargar las coincidencias:", error);
            if (active) {
              setLoadError("No se pudieron cargar tus coincidencias.");
              setLoading(false);
            }
          }
        };

        identityIds.forEach((identityId) => {
          let initialSnapshot = true;
          const chatsQuery = query(
            chatsRef,
            where("participants", "array-contains", identityId)
          );
          const unsubscribe = onSnapshot(
            chatsQuery,
            (snapshot) => {
              if (initialSnapshot) {
                initialSnapshot = false;
              } else {
                for (const change of snapshot.docChanges()) {
                  const data = change.doc.data();
                  if (localStorage.getItem("allowNotifications") === "false") continue;
                  if (
                    change.type === "added" &&
                    localStorage.getItem("onlyMatches") !== "false"
                  ) {
                    setNotification("¡Tienes una nueva coincidencia!");
                  } else if (
                    change.type === "modified" &&
                    localStorage.getItem("onlyMessages") !== "false" &&
                    data.lastMessageSenderId !== currentUserId &&
                    data.lastMessage
                  ) {
                    setNotification("Tienes un mensaje nuevo.");
                  }
                }
              }

              snapshotsByIdentity.set(
                identityId,
                new Map(snapshot.docs.map((chat) => [chat.id, chat]))
              );
              void updateChatList();
            },
            (error) => {
              console.error("Error al escuchar las coincidencias:", error);
              if (active) {
                setLoadError("No se pudieron cargar tus coincidencias.");
                setLoading(false);
              }
            }
          );
          unsubscribeChats.push(unsubscribe);
        });
      } catch (error) {
        console.error("Error al consultar perfiles bloqueados:", error);
        if (active) {
          setLoadError("No se pudieron cargar tus coincidencias.");
          setLoading(false);
        }
      }
    };

    void subscribeToChats();
    return () => {
      active = false;
      unsubscribeChats.forEach((unsubscribe) => unsubscribe());
    };
  }, [currentUserId]);

  const goToChat = (chatId: string, userId: string) => {
    history.push(`/chat/${chatId}/${userId}`);
  };
  

  return (
    <IonPage className="page-content">
      <IonHeader>
        <IonToolbar className="header-toolbar">
          <IonButtons slot="start">
            <IonBackButton defaultHref="/" className="back-button" />
          </IonButtons>
          <IonTitle>Matches y chats</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent>
        {loading ? (
          <p className="loading-message">Cargando...</p>
        ) : loadError ? (
          <p role="alert" className="empty-message">{loadError}</p>
        ) : chats.length === 0 ? (
          <p className="empty-message">Aún no tienes matches. Sigue descubriendo estudiantes de tu sede.</p>
        ) : (
          <IonList className="ion-list">
            {chats.map((user) => (
              <IonItem
                key={user.chatId}
                className="ion-item"
                button
                onClick={() => goToChat(user.chatId, user.id)}
              >
                <IonAvatar slot="start">
                  <img
                    src={user.photoUrl || "https://via.placeholder.com/150"}
                    alt={user.nombreCompleto}
                  />
                </IonAvatar>
                <IonLabel>
                  <h2 className="user-name">{user.nombreCompleto}</h2>
                  <p className="chat-preview">
                    {user.lastMessage || "¡Es un match! Inicia la conversación."}
                  </p>
                </IonLabel>
              </IonItem>
            ))}
          </IonList>
        )}
        <IonToast
          isOpen={Boolean(notification)}
          message={notification}
          duration={2500}
          position="top"
          onDidDismiss={() => setNotification("")}
        />
      </IonContent>
    </IonPage>
  );
};

export default Chats;