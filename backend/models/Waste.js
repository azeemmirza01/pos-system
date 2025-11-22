const mongoose = require('mongoose');

const wasteSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  ingredient_id: { type: String, required: true, ref: 'Ingredient' },
  ingredient_name: { type: String, required: true },
  quantity: { type: Number, required: true },
  unit: { type: String, required: true },
  reason: { type: String },
  cost: { type: Number, default: 0 },
  reported_by: { type: String, ref: 'User' },
  outlet_id: { type: String, required: true, ref: 'Outlet' },
  created_at: { type: Date, default: Date.now },
  synced: { type: Boolean, default: true }
}, {
  timestamps: { createdAt: 'created_at', updatedAt: false }
});

module.exports = mongoose.model('Waste', wasteSchema);

