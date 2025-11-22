const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  email: { type: String },
  phone: { type: String },
  address: { type: String },
  date_of_birth: { type: Date },
  loyalty_points: { type: Number, default: 0 },
  total_spent: { type: Number, default: 0 },
  visit_count: { type: Number, default: 0 },
  last_visit: { type: Date },
  sms_opt_in: { type: Boolean, default: false },
  email_opt_in: { type: Boolean, default: false },
  tags: [{ type: String }],
  notes: { type: String },
  outlet_id: { type: String, ref: 'Outlet' },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
  synced: { type: Boolean, default: true }
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

module.exports = mongoose.model('Customer', customerSchema);

