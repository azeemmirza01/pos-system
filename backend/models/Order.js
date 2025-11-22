const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  product_id: { type: String, required: true, ref: 'Product' },
  product_name: { type: String, required: true },
  quantity: { type: Number, required: true },
  price: { type: Number, required: true },
  total: { type: Number, required: true },
  notes: { type: String },
  status: {
    type: String,
    enum: ['pending', 'preparing', 'ready', 'served', 'cancelled'],
    default: 'pending'
  },
  station: {
    type: String,
    enum: ['kitchen', 'bar', 'none'],
    default: 'none'
  }
}, { _id: false });

const orderSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  order_number: { type: String, required: true, unique: true },
  order_type: {
    type: String,
    enum: ['dine-in', 'takeaway', 'delivery'],
    required: true
  },
  table_id: { type: String, ref: 'Table' },
  table_number: { type: String },
  customer_id: { type: String, ref: 'Customer' },
  customer_name: { type: String },
  items: [orderItemSchema],
  subtotal: { type: Number, required: true },
  tax: { type: Number, default: 0 },
  discount: { type: Number, default: 0 },
  total_amount: { type: Number, required: true },
  payment_method: { type: String, default: 'cash' },
  status: {
    type: String,
    enum: ['draft', 'pending', 'confirmed', 'preparing', 'ready', 'served', 'completed', 'cancelled'],
    default: 'draft'
  },
  waiter_id: { type: String, ref: 'User' },
  waiter_name: { type: String },
  delivery_address: { type: String },
  delivery_phone: { type: String },
  notes: { type: String },
  outlet_id: { type: String, required: true, ref: 'Outlet' },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
  synced: { type: Boolean, default: true }
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

module.exports = mongoose.model('Order', orderSchema);

