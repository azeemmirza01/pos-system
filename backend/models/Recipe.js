const mongoose = require('mongoose');

const recipeIngredientSchema = new mongoose.Schema({
  ingredient_id: { type: String, required: true, ref: 'Ingredient' },
  quantity: { type: Number, required: true },
  unit: { type: String, required: true }
}, { _id: false });

const recipeSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  product_id: { type: String, required: true, ref: 'Product' },
  name: { type: String, required: true },
  ingredients: [recipeIngredientSchema],
  instructions: { type: String },
  preparation_time: { type: Number, default: 0 }, // in minutes
  outlet_id: { type: String, ref: 'Outlet' },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
  synced: { type: Boolean, default: true }
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

module.exports = mongoose.model('Recipe', recipeSchema);

