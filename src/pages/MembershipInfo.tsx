import React from "react";
import { IonPage, IonHeader, IonToolbar, IonTitle, IonContent } from "@ionic/react";
import MembershipDetails from "../components/Membership"; // Importa tu componente MembershipDetails

const Membresia: React.FC = () => {
  return (
    <IonPage>
      <IonHeader>
        <IonToolbar color="danger">
          <IonTitle>Gestión de Membresía</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <div style={{ padding: "16px", textAlign: "center" }}>
          <h2>Bienvenido a la Membresía Premium</h2>
          <p>Aquí puedes gestionar tu suscripción, cambiar de plan o ver tus beneficios.</p>
        </div>

        {/* Aquí se usa el componente MembershipDetails */}
        <MembershipDetails />
      </IonContent>
    </IonPage>
  );
};

export default Membresia;
