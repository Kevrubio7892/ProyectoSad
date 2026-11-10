import React from "react";
import { PayPalButtons } from "@paypal/react-paypal-js";
import { db, auth } from "../firebaseConfig"; // Ajusta la ruta al archivo donde está tu configuración de Firebase
import { collection, addDoc, Timestamp } from "firebase/firestore";

const PayWithPayPal: React.FC = () => {
  const handleApprove = async (data: any, actions: any) => {
    try {
      const details = await actions.order.capture();

      // Obtener el usuario autenticado
      const currentUser = auth.currentUser;
      if (!currentUser) {
        alert("No se encontró un usuario autenticado. Inicia sesión para continuar.");
        return;
      }

      const transactionData = {
        transactionId: details.id,
        amount: details.purchase_units[0].amount.value,
        currency: details.purchase_units[0].amount.currency_code,
        description: details.purchase_units[0].description,
        payerName: `${details.payer.name.given_name} ${details.payer.name.surname}`,
        payerEmail: details.payer.email_address,
        userId: currentUser.uid, // ID del usuario autenticado
        userEmail: currentUser.email, // Correo del usuario autenticado
        status: details.status,
        createTime: details.create_time,
        timestamp: Timestamp.now(), // Marca de tiempo de Firebase
        isPremium : true,
        estado: "completada"
      };

      // Almacenar en la colección "Transacciones"
      const transRef = collection(db, "Transacciones");
      await addDoc(transRef, transactionData);

      alert(
        `Pago exitoso, ${details.payer.name.given_name}. ¡Ya eres Premium!`
      );
    } catch (error) {
      console.error("Error al capturar el pago:", error);
      alert("Hubo un error al procesar la transacción. Inténtalo nuevamente.");
    }
  };

  const handleError = (error: any) => {
    console.error("Error en el pago:", error);
    alert("Hubo un error con el pago. Por favor, inténtalo nuevamente.");
  };

  return (
    <div>
      <h3>Compra tu suscripción Premium</h3>
      <PayPalButtons
        createOrder={(data, actions) => {
          return actions.order.create({
            intent: "CAPTURE",
            purchase_units: [
              {
                amount: {
                  value: "5.00", // Cambia a 5000 CLP si estás usando pesos chilenos
                  currency_code: "USD",
                },
                description: "Pago por la suscripción premium",
              },
            ],
          });
        }}
        onApprove={handleApprove}
        onError={handleError}
      />
    </div>
  );
};

export default PayWithPayPal;
