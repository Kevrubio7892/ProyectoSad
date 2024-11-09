import React, { useEffect } from "react";
import { useHistory } from "react-router-dom";

const InstagramCallback = () => {
  const history = useHistory();

  useEffect(() => {
    const getInstagramToken = async () => {
      const code = new URLSearchParams(window.location.search).get("code");
      if (code) {
        const clientId = "1084662546664405"; // Reemplaza con tu client ID
        const clientSecret = "60f52f5dd8bb5a81ca031dec1c1971a9"; // Reemplaza con tu client secret
        const redirectUri = "https://localhost:8100/opciones"; // Debes usar tu URL de redirección

        const response = await fetch(
          "https://api.instagram.com/oauth/access_token",
          {
            method: "POST",
            body: new URLSearchParams({
              client_id: clientId,
              client_secret: clientSecret,
              grant_type: "authorization_code",
              redirect_uri: redirectUri,
              code: code,
            }),
          }
        );

        const data = await response.json();
        if (data.access_token) {
          localStorage.setItem("instagramAccessToken", data.access_token); // Guarda el token de acceso
          history.push("/opciones"); // Redirige a otra página después del login
        }
      }
    };

    getInstagramToken();
  }, [history]);

  return (
    <div>
      <h2>Autenticando...</h2>
    </div>
  );
};

export default InstagramCallback;
