const axios = require('axios');
const Order = require('../models/Order');

const createOrder = async (req, res) => {
  const { name, email, phone } = req.body;
  const orderId = `order_${Date.now()}`;

  try {
    // Save order in MongoDB
    await Order.create({
      order_id: orderId,
      name,
      email,
      phone,
      amount: 5,
      payment_status: 'PENDING'
    });

    // Create order in Cashfree
    const response = await axios.post(`${process.env.CASHFREE_API_URL}/orders`, {
      order_id: orderId,
      order_amount: 5,
      order_currency: 'INR',
      customer_details: { customer_id: phone, customer_name: name, customer_email: email, customer_phone: phone },
      order_meta: {
        return_url: `${process.env.FRONTEND_URL}/payment-status?order_id=${orderId}`
      }
    }, {
      headers: {
        'x-client-id': process.env.CASHFREE_APP_ID,
        'x-client-secret': process.env.CASHFREE_SECRET_KEY,
        'x-api-version': '2022-09-01',
        'Content-Type': 'application/json'
      }
    });

    res.json({ payment_session_id: response.data.payment_session_id });
  } catch (err) {
    console.error(err.response?.data || err);
    res.status(500).json({ error: 'Failed to create order' });
  }
};

const verifyPayment = async (req, res) => {
  const { orderId } = req.params;
  try {
    const response = await axios.get(`${process.env.CASHFREE_API_URL}/orders/${orderId}`, {
      headers: {
        'x-client-id': process.env.CASHFREE_APP_ID,
        'x-client-secret': process.env.CASHFREE_SECRET_KEY,
        'x-api-version': '2022-09-01'
      }
    });

    const status = response.data.order_status;

    await Order.findOneAndUpdate(
      { order_id: orderId },
      { payment_status: status, updated_at: new Date() }
    );

    res.json({ status });
  } catch (err) {
    console.error(err.response?.data || err);
    res.status(500).json({ error: 'Failed to verify payment' });
  }
};

module.exports = { createOrder, verifyPayment };
