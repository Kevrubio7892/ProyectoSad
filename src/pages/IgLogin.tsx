import React, { useEffect } from "react";

const InstagramLogin = () => {
  const clientId = "1084662546664405"; // Reemplaza con tu client ID de Facebook Developer
  const redirectUri = "https://localhost:8100/opciones"; // Debes usar tu URL de redirección registrada en Facebook

  const instagramAuthUrl = `https://api.instagram.com/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&scope=user_profile,user_media&response_type=code`;

  useEffect(() => {
    // Si el usuario ya ha autenticado Instagram, podrías gestionar el token aquí
    const token = localStorage.getItem("instagramAccessToken");
    if (token) {
      // Si ya tiene el token, haz algo con él
      console.log("Token de acceso de Instagram:", token);
    }
  }, []);

  const handleLoginClick = () => {
    window.location.href = instagramAuthUrl; // Redirige al usuario a la página de autorización de Instagram
  };

  return (
    <div>
      <button onClick={handleLoginClick}>Vincular Instagram</button>
    </div>
  );
};

export default InstagramLogin;
