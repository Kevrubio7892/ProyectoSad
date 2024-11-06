import React from "react";
import { PayPalButtons, usePayPalScriptReducer } from "@paypal/react-paypal-js";
import axios from "axios";

const PayPalButton = ({ onSuccess }) => {
  const [{ isPending }] = usePayPalScriptReducer();

  const createOrder = async () => {
    const response = await axios.post("http://localhost:3001/create-order");
    return response.data.orderID;
  };

  const onApprove = async (data) => {
    await axios.post("http://localhost:3001/capture-order", {
      orderID: data.orderID,
    });
    onSuccess(); // Callback para manejar el éxito del pago
  };

  return (
    <div>
      {isPending ? <div>Cargando...</div> : null}
      <PayPalButtons
        createOrder={createOrder}
        onApprove={onApprove}
        onError={(err) => console.error(err)}
      />
    </div>
  );
};

export default PayPalButton;
