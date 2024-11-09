const axios = require("axios");

async function obtenerToken(code) {
  const response = await axios.post(
    "https://api.instagram.com/oauth/access_token",
    {
      client_id: "1084662546664405",
      client_secret: "60f52f5dd8bb5a81ca031dec1c1971a9",
      grant_type: "authorization_code",
      redirect_uri: "https://localhost:8100/opciones",
      code: code,
    }
  );
  return response.data.access_token;
}

async function obtenerFotos(token) {
  const response = await axios.get(
    `https://graph.instagram.com/me/media?fields=id,media_type,media_url,thumbnail_url,permalink&access_token=${token}`
  );
  return response.data.data;
}
