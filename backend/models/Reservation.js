const mongoose = require('mongoose');

const reservationSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  customer_id: { type: String, ref: 'Customer' },
  customer_name: { type: String },
  customer_phone: { type: String },
  table_id: { type: String, ref: 'Table' },
  table_number: { type: String },
  reservation_date: { type: Date, required: true },
  reservation_time: { type: String, required: true },
  number_of_guests: { type: Number, required: true },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'seated', 'completed', 'cancelled'],
    default: 'pending'
  },
  special_requests: { type: String },
  outlet_id: { type: String, required: true, ref: 'Outlet' },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
  synced: { type: Boolean, default: true }
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

module.exports = mongoose.model('Reservation', reservationSchema);

