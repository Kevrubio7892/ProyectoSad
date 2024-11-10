import express from 'express';
import * as paypal from '@paypal/checkout-server-sdk';
import cors from 'cors';

const app = express();
app.use(cors());

const clientId = 'YOUR_PAYPAL_CLIENT_ID';
const secret = 'YOUR_PAYPAL_SECRET';

const environment = new paypal.core.SandboxEnvironment(clientId, secret);
const client = new paypal.core.PayPalHttpClient(environment);

app.post('/create-order', async (req, res) => {
  const request = new paypal.orders.OrdersCreateRequest();
  request.requestBody({
    intent: 'CAPTURE',
    purchase_units: [{
      amount: {
        currency_code: 'USD',
        value: '10.00',
      },
    }],
  });

  try {
    const order = await client.execute(request);
    res.json(order);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Payment creation failed' });
  }
});

app.listen(5000, () => console.log('Server running on port 5000'));
