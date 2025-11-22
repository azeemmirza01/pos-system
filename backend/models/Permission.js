const mongoose = require('mongoose');

const permissionSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true, unique: true },
  description: { type: String },
  module: { type: String, required: true }, // billing, products, customers, reports, etc.
  created_at: { type: Date, default: Date.now }
}, {
  timestamps: { createdAt: 'created_at', updatedAt: false }
});

module.exports = mongoose.model('Permission', permissionSchema);

