import React from 'react';
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
  IonText,
  IonIcon,
} from '@ionic/react';
import { checkmarkDoneOutline } from 'ionicons/icons';
import '../styles/ChatsStyles.css';

interface Message {
  id: number;
  senderName: string;
  message: string;
  status: 'read' | 'unread';
}

const messages: Message[] = [
  { id: 1, senderName: 'Alicia V.', message: 'Jajaja bien y tú?', status: 'read' },
  { id: 2, senderName: 'Renato G.', message: 'Hola', status: 'read' },
  { id: 3, senderName: 'Kevin R.', message: 'En qué semestre vas?', status: 'read' },
  { id: 4, senderName: 'Maria L.', message: 'Eres muy linda', status: 'read' },
];

const MessageList: React.FC = () => {
  return (
    <IonPage>
      <IonHeader>
        <IonToolbar color="danger">
          <IonButtons slot="start">
            <IonBackButton defaultHref="/" />
          </IonButtons>
          <IonTitle>Mensajes</IonTitle>
        </IonToolbar>
      </IonHeader>
      
      <IonContent>
        <IonList>
          {messages.map((msg) => (
            <IonItem key={msg.id} lines="full">
              <IonAvatar slot="start">
                <img src="https://via.placeholder.com/150" alt="Avatar" />
              </IonAvatar>
              <IonLabel>
                <h2>{msg.senderName}</h2>
                <p>{msg.message}</p>
              </IonLabel>
              <IonText slot="end">
                <IonIcon icon={checkmarkDoneOutline} />
              </IonText>
            </IonItem>
          ))}
        </IonList>
      </IonContent>
    </IonPage>
  );
};

export default MessageList;
