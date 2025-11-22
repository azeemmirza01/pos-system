const mongoose = require('mongoose');

const ingredientSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  unit: { type: String, required: true, default: 'piece' }, // kg, g, liter, ml, piece
  current_stock: { type: Number, default: 0 },
  min_stock: { type: Number, default: 0 },
  max_stock: { type: Number, default: 1000 },
  cost_per_unit: { type: Number, default: 0 },
  supplier: { type: String },
  category: { type: String },
  outlet_id: { type: String, ref: 'Outlet' },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
  synced: { type: Boolean, default: true }
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

module.exports = mongoose.model('Ingredient', ingredientSchema);

