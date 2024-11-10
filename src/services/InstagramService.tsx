// src/services/instagramService.ts
import axios from 'axios';

const INSTAGRAM_API_URL = 'https://graph.instagram.com/me';

export const getInstagramProfileName = async (accessToken: string): Promise<string | null> => {
  try {
    const response = await axios.get(INSTAGRAM_API_URL, {
      params: {
        fields: 'username',
        access_token: accessToken,
      },
    });

    return response.data.username; // Devuelve el nombre de usuario
  } catch (error) {
    console.error('Error al obtener el perfil de Instagram:', error);
    return null;
  }
};
