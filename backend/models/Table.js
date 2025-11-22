const mongoose = require('mongoose');

const tableSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  number: { type: String, required: true },
  capacity: { type: Number, required: true },
  status: { 
    type: String, 
    enum: ['available', 'occupied', 'reserved', 'cleaning'],
    default: 'available'
  },
  current_order_id: { type: String, ref: 'Order' },
  outlet_id: { type: String, required: true, ref: 'Outlet' },
  location: { type: String }, // e.g., 'Main Hall', 'Patio', 'VIP'
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
  synced: { type: Boolean, default: true }
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

module.exports = mongoose.model('Table', tableSchema);

