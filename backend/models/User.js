const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role_id: { type: String, ref: 'Role' },
  role: { type: String, default: 'cashier' }, // Legacy support
  name: { type: String },
  email: { type: String },
  phone: { type: String },
  outlet_id: { type: String, ref: 'Outlet' },
  outlets: [{ type: String, ref: 'Outlet' }], // For multi-outlet access
  is_active: { type: Boolean, default: true },
  last_login: { type: Date },
  created_at: { type: Date, default: Date.now },
  synced: { type: Boolean, default: true }
}, {
  timestamps: { createdAt: 'created_at', updatedAt: false }
});

module.exports = mongoose.model('User', userSchema);

