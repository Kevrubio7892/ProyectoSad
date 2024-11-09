import React from "react";
import { PayPalButtons, usePayPalScriptReducer } from "@paypal/react-paypal-js";
import axios from "axios";

interface PayPalButtonProps {
  onSuccess: () => void;
}

const PayPalButton: React.FC<PayPalButtonProps> = ({ onSuccess }) => {
  const [{ isPending }] = usePayPalScriptReducer();

  // Especifica el tipo de retorno como `Promise<string>` para indicar que devuelve el ID de la orden
  const createOrder = async (): Promise<string> => {
    const response = await axios.post("http://localhost:3001/create-order");
    return response.data.orderID;
  };

  // Declara el tipo de `data` como `Record<string, any>` o especifica tipos más específicos si los conoces
  const onApprove = async (data: Record<string, any>) => {
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
