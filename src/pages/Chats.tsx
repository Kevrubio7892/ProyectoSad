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
import { collection, getDocs, query, where, getDoc, doc } from "firebase/firestore";
import { useHistory } from "react-router-dom"; // Importar useHistory
import { db, auth } from "../firebaseConfig"; // Firestore configuración
import "../styles/ChatsStyles.css"; // Importar estilos

interface User {
  id: string;
  nombreCompleto: string;
  photoUrl: string;
}

const Chats: React.FC = () => {
  const [likedUsers, setLikedUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const history = useHistory(); // Inicializar useHistory

  useEffect(() => {
    const fetchLikedUsers = async () => {
      try {
        setLoading(true);

        // Obtén el ID del usuario autenticado
        const currentUserId = auth.currentUser?.uid;
        console.log("ID del usuario actual:", currentUserId);

        if (!currentUserId) {
          console.error("Usuario no autenticado");
          setLoading(false);
          return;
        }

        // Consulta todos los documentos de la colección Estudiantes
        const estudiantesRef = collection(db, "Estudiantes");
        const estudiantesSnapshot = await getDocs(estudiantesRef);

        // Itera sobre los documentos y busca subcolecciones LIKES donde `fromUserId` coincida con el usuario actual
        const likedUserIds: string[] = [];
        for (const estudianteDoc of estudiantesSnapshot.docs) {
          const likesRef = collection(db, `Estudiantes/${estudianteDoc.id}/LIKES`);
          const likesQuery = query(likesRef, where("fromUserId", "==", currentUserId));
          const likesSnapshot = await getDocs(likesQuery);

          likesSnapshot.forEach((likeDoc) => {
            const data = likeDoc.data();
            if (data.toUserId) {
              likedUserIds.push(data.toUserId);
            }
          });
        }

        console.log("IDs de usuarios a los que se les dio like:", likedUserIds);

        // Carga la información de los usuarios a quienes se les dio "like"
        const userPromises = likedUserIds.map(async (userId) => {
          const userDoc = await getDoc(doc(db, "Estudiantes", userId));
          if (userDoc.exists()) {
            return {
              id: userDoc.id,
              ...userDoc.data(),
            } as User;
          }
          return null;
        });

        const likedUsersData = (await Promise.all(userPromises)).filter(Boolean) as User[];
        console.log("Datos de usuarios a los que se les dio like:", likedUsersData);

        setLikedUsers(likedUsersData);
      } catch (error) {
        console.error("Error al obtener los usuarios con like:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchLikedUsers();
  }, []);

  const goToChat = (userId: string) => {
    history.push(`/chat/${userId}`); // Navega al chat individual
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
        ) : likedUsers.length === 0 ? (
          <p className="empty-message">No se encontraron usuarios con like.</p>
        ) : (
          <IonList className="ion-list">
            {likedUsers.map((user) => (
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
