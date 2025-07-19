const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  order_id: { type: String, required: true, unique: true },
  name: String,
  email: String,
  phone: String,
  amount: Number,
  payment_status: {
    type: String,
    enum: ['PENDING', 'PAID', 'FAILED'],
    default: 'PENDING'
  },
  created_at: { type: Date, default: Date.now },
  updated_at: Date
});

module.exports = mongoose.model('Order', orderSchema);
