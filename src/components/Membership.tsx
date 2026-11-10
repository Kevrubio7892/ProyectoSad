import React, { useEffect, useState } from "react";
import { doc, getDoc, collection, query, where, getDocs } from "firebase/firestore";
import { auth, db } from "../firebaseConfig";
import { IonButton, IonCard, IonCardContent, IonCardHeader, IonCardTitle } from "@ionic/react";

interface MembershipData {
  nombreCompleto: string;
  estadoMembresia: string;
  fechaPago: string;
  metodoPago: string;
  isPremium: boolean;
}

const MembershipDetails: React.FC = () => {
  const [membership, setMembership] = useState<MembershipData | null>(null);

  useEffect(() => {
    const fetchMembershipData = async () => {
      const currentUser = auth.currentUser;
      if (currentUser) {
        // Obtener datos del usuario desde la colección "Estudiantes"
        const studentRef = doc(db, "Estudiantes", currentUser.uid);
        const studentSnap = await getDoc(studentRef);

        if (studentSnap.exists()) {
          const studentData = studentSnap.data();

          // Buscar transacciones del usuario en la colección "Transacciones"
          const transactionsRef = collection(db, "Transacciones");
          const q = query(transactionsRef, where("userEmail", "==", currentUser.email), where("estado", "==", "completada"));
          const querySnapshot = await getDocs(q);

          // Validar si el usuario tiene una transacción completada y Premium
          let isPremium = false;
          let fechaPago = "";
          let metodoPago = "";

          querySnapshot.forEach((doc) => {
            const transaction = doc.data();
            if (transaction.isPremium) {
              isPremium = true;
              fechaPago = transaction.createTime;
              metodoPago = "Tarjeta de crédito"; // Cambia esto si tienes más detalles
            }
          });

          // Actualizar el estado con la información
          setMembership({
            nombreCompleto: studentData.nombreCompleto,
            estadoMembresia: isPremium ? "Activa" : "Normal",
            fechaPago: fechaPago || "N/A",
            metodoPago: metodoPago || "N/A",
            isPremium,
          });
        } else {
          console.log("No se encontró información del usuario.");
        }
      }
    };

    fetchMembershipData();
  }, []);

  const handleCancelMembership = async () => {
    alert("Funcionalidad para cancelar membresía no implementada aún.");
  };

  if (!membership) {
    return <div>Cargando...</div>;
  }

  return (
    <IonCard>
      <IonCardHeader>
        <IonCardTitle>Membresía Premium</IonCardTitle>
      </IonCardHeader>
      <IonCardContent>
        <div style={{ textAlign: "center" }}>
          <img
            src="https://via.placeholder.com/120"
            alt="Foto de perfil"
            style={{ borderRadius: "50%", marginBottom: "10px" }}
          />
          <h3>{membership.nombreCompleto}</h3>
        </div>
        <div style={{ border: "1px solid #ddd", padding: "10px", borderRadius: "5px" }}>
          <p>
            <strong>Estado:</strong> {membership.estadoMembresia}
          </p>
          <p>
            <strong>Fecha de pago:</strong> {membership.fechaPago}
          </p>
          <p>
            <strong>Método de pago:</strong> {membership.metodoPago}
          </p>
        </div>
        {membership.isPremium ? (
          <IonButton color="danger" onClick={handleCancelMembership}>
            Cancelar Membresía
          </IonButton>
        ) : (
          <IonButton color="primary">Actualizar a Premium</IonButton>
        )}
      </IonCardContent>
    </IonCard>
  );
};

export default MembershipDetails;
