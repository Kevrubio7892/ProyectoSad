// proxyServer.ts

import express from 'express';
import axios, { AxiosError } from 'axios';

const app = express();
const PORT = 8100; // Puedes cambiar el puerto si lo necesitas

const BASE_URL = 'https://khipu.com/api/2.0/';
const API_KEY = 'bb337360-4291-47f2-a6a9-2e0f28d5b7b1'; // Tu clave de API de Khipu

app.use(express.json());

// Endpoint para crear el pago en Khipu
app.post('/api/create-payment', async (req, res) => {
  const { amount, subject } = req.body;

  try {
    const response = await axios.post(
      `${BASE_URL}payments`,
      {
        amount,
        subject,
        currency: 'CLP', // Cambia a la moneda que uses
        transaction_id: 'tu_transaction_id', // Agrega un ID único por transacción
        return_url: 'https://tusitio.com/exito', // URL de éxito
        cancel_url: 'https://tusitio.com/cancelar', // URL de cancelación
      },
      {
        headers: {
          'x-api-key': API_KEY,
        },
      }
    );

    res.json(response.data); // Devuelve la respuesta de Khipu al cliente
  } catch (error) {
    if (error instanceof AxiosError) {
      console.error('Error al crear el pago en Khipu:', error.response?.data || error.message);
      res.status(500).json({ error: error.response?.data || 'Error al procesar el pago en Khipu' });
    } else if (error instanceof Error) {
      console.error('Error inesperado al crear el pago en Khipu:', error.message);
      res.status(500).json({ error: error.message });
    } else {
      console.error('Error desconocido al crear el pago en Khipu');
      res.status(500).json({ error: 'Error desconocido al procesar el pago en Khipu' });
    }
  }
});

app.listen(PORT, () => {
  console.log(`Servidor proxy corriendo en http://localhost:${PORT}`);
});
