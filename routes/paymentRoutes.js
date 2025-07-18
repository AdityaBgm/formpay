const express = require('express');
const router = express.Router();
const { createPayment, cashfreeWebhook } = require('../controllers/paymentController');

// Create Payment API
router.post('/create', createPayment);

// Webhook Endpoint
router.post('/webhook', express.raw({ type: 'application/json' }), cashfreeWebhook);

module.exports = router;
