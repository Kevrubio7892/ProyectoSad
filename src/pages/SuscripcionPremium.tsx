/* PremiumUpgradePage.tsx
import React from "react";
import PayPalButton from "../components/PayPalButton";
import { useHistory } from "react-router";

const PremiumUpgradePage = () => {
  const history = useHistory();

  const handleSuccess = () => {
    // Actualizar el estado de la suscripción en la base de datos
    // Redirigir a la vista de gestión de suscripción
    history.push("/gestion-suscripcion");
  };

  return (
    <div>
      <h1>Actualizar a Premium</h1>
      <p>Actualmente, solo aceptamos PayPal como método de pago.</p>
      <PayPalButton onSuccess={handleSuccess} />
    </div>
  );
};

export default PremiumUpgradePage;*/
