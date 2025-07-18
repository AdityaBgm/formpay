const axios = require('axios');
const crypto = require('crypto');
const User = require('../models/User');

// ✅ Create Payment Function
const createPayment = async (req, res) => {
    const { orderId, orderAmount, customerName, customerEmail, customerPhone } = req.body;

    try {
        const response = await axios.post('https://sandbox.cashfree.com/pg/orders', {
            order_id: orderId,
            order_amount: orderAmount,
            order_currency: "INR",
            customer_details: {
                customer_id: orderId,
                customer_name: customerName,
                customer_email: customerEmail,
                customer_phone: customerPhone
            }
        }, {
            headers: {
                'Content-Type': 'application/json',
                'x-client-id': process.env.CASHFREE_APP_ID,
                'x-client-secret': process.env.CASHFREE_SECRET_KEY,
                'x-api-version': '2022-09-01'
            }
        });

        // 🔥 Save orderId to user
        await User.findOneAndUpdate({ email: customerEmail }, { orderId });

        res.status(200).json(response.data);
    } catch (err) {
        console.error(err.response?.data || err.message);
        res.status(500).json({ message: 'Payment creation failed', error: err.response?.data || err.message });
    }
};

// ✅ Cashfree Webhook Function
const cashfreeWebhook = async (req, res) => {
    const signature = req.headers['x-webhook-signature'];
    const secret = process.env.CASHFREE_SECRET_KEY;
    const payload = req.body;

    const expectedSignature = crypto
        .createHmac('sha256', secret)
        .update(JSON.stringify(payload))
        .digest('base64');

    // if (signature !== expectedSignature) {
    //     console.error('Webhook signature mismatch!');
    //     return res.status(400).json({ message: 'Invalid signature' });
    // }

    const { order_id, order_status } = payload;

    try {
        const user = await User.findOne({ orderId: order_id });
        if (!user) {
            console.error(`User with orderId ${order_id} not found`);
            return res.status(404).json({ message: 'User not found' });
        }

        user.paymentStatus = order_status === 'PAID' ? 'SUCCESS' : 'FAILED';
        await user.save();

        console.log(`Payment status updated for ${order_id}: ${user.paymentStatus}`);
        res.status(200).json({ message: 'Webhook processed' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error' });
    }
};

// ✅ Export both functions
module.exports = { createPayment, cashfreeWebhook };
