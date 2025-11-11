const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, default: 'cashier', enum: ['cashier', 'admin', 'manager'] },
  name: { type: String },
  created_at: { type: Date, default: Date.now },
  synced: { type: Boolean, default: true }
}, {
  timestamps: { createdAt: 'created_at', updatedAt: false }
});

module.exports = mongoose.model('User', userSchema);

