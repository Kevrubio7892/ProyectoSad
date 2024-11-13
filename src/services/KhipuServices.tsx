// src/services/khipuService.ts

import axios, { AxiosError } from 'axios';

const PROXY_BASE_URL = 'http://localhost:5000/api'; // Cambia a la URL del proxy

interface PaymentResponse {
  payment_url: string;
  status: string;
  [key: string]: any;
}

export const createPayment = async (amount: number, subject: string): Promise<PaymentResponse> => {
  try {
    const response = await axios.post(
      `${PROXY_BASE_URL}/create-payment`,
      {
        amount,
        subject,
      }
    );

    return response.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      console.error('Error al crear el pago en el proxy:', error.response?.data || error.message);
      throw new Error(error.response?.data?.message || error.message);
    } else if (error instanceof Error) {
      console.error('Error inesperado al crear el pago en el proxy:', error.message);
      throw new Error(error.message);
    } else {
      console.error('Error desconocido al crear el pago en el proxy');
      throw new Error('Error desconocido');
    }
  }
};
