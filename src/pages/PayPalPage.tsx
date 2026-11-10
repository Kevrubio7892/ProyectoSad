import React, { useState } from "react";
import {
  IonPage,
  IonContent,
  IonHeader,
  IonToolbar,
  IonTitle,
} from "@ionic/react";
import PayWithPayPal from "../components/PayWithPayPal";

const Test: React.FC = () => {
  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Pago con PayPal</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <div style={{ padding: "16px" }}>
          <PayWithPayPal />
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Test;