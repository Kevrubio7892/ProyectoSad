// src/components/KhipuPayment.tsx

import React, { useState } from 'react';
import { createPayment } from '../services/KhipuServices';

const KhipuPayment: React.FC = () => {
  const [amount, setAmount] = useState<number>(0);
  const [subject, setSubject] = useState<string>('');
  const [paymentUrl, setPaymentUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handlePayment = async () => {
    setLoading(true);
    setError(null);

    try {
      const payment = await createPayment(amount, subject);
      setPaymentUrl(payment.payment_url); // URL de pago de Khipu
    } catch (error) {
      // Manejamos el error como tipo Error
      if (error instanceof Error) {
        setError(`Hubo un error al procesar el pago: ${error.message}`);
      } else {
        setError('Error desconocido al procesar el pago.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2>Realizar un Pago con Khipu</h2>
      <form onSubmit={(e) => e.preventDefault()}>
        <div>
          <label>Monto:</label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(Number(e.target.value))}
            min="1"
            required
          />
        </div>
        <div>
          <label>Asunto:</label>
          <input
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            required
          />
        </div>
        <button onClick={handlePayment} disabled={loading}>
          {loading ? 'Procesando...' : 'Pagar'}
        </button>
      </form>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {paymentUrl && (
        <div>
          <p>Haz clic en el siguiente enlace para completar el pago:</p>
          <a href={paymentUrl} target="_blank" rel="noopener noreferrer">
            Completar Pago
          </a>
        </div>
      )}
    </div>
  );
};

export default KhipuPayment;
