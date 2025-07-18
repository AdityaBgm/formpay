const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String, required: true },
    paymentStatus: {
        type: String,
        enum: ['PENDING', 'SUCCESS', 'FAILED'],
        default: 'PENDING'
    },
    orderId: { type: String }, // Cashfree Order ID
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', userSchema);
