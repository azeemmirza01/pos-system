const mongoose = require('mongoose');

const roleSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true, unique: true },
  description: { type: String },
  permissions: [{ type: String, ref: 'Permission' }],
  is_system: { type: Boolean, default: false }, // System roles cannot be deleted
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now }
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

module.exports = mongoose.model('Role', roleSchema);

