const express = require("express");
const bodyParser = require("body-parser");
const paypal = require("@paypal/paypal-server-sdk");
require("dotenv").config();

const app = express();
app.use(bodyParser.json());

// Configurar el entorno de PayPal
const environment = new paypal.core.SandboxEnvironment(
  process.env.PAYPAL_CLIENT_ID,
  process.env.PAYPAL_CLIENT_SECRET
);
const client = new paypal.core.PayPalHttpClient(environment);

// Ruta para crear una orden de PayPal
app.post("/create-order", async (req, res) => {
  const request = new paypal.orders.OrdersCreateRequest();
  request.requestBody({
    intent: "CAPTURE",
    purchase_units: [
      {
        amount: {
          currency_code: "USD",
          value: "10.00", // Establece el precio de la membresía premium
        },
      },
    ],
  });

  try {
    const order = await client.execute(request);
    res.status(200).json({ orderID: order.result.id });
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// Ruta para capturar el pago después de la aprobación de la orden
app.post("/capture-order", async (req, res) => {
  const { orderID } = req.body;
  const request = new paypal.orders.OrdersCaptureRequest(orderID);
  request.requestBody({});

  try {
    const capture = await client.execute(request);
    res.status(200).json({ status: "COMPLETED", captureID: capture.result.id });
  } catch (err) {
    res.status(500).send(err.message);
  }
});

app.listen(3001, () => {
  console.log("Servidor funcionando en http://localhost:3001");
});
