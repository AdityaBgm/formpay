const express = require('express');
const { createOrder, verifyPayment } = require('../controllers/paymentController');
const router = express.Router();

router.post('/create-order', createOrder);
router.get('/verify/:orderId', verifyPayment);

module.exports = router;
