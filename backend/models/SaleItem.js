const mongoose = require('mongoose');

const saleItemSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  sale_id: { type: String, required: true, ref: 'Sale' },
  product_id: { type: String, required: true, ref: 'Product' },
  quantity: { type: Number, required: true },
  price: { type: Number, required: true },
  total: { type: Number, required: true },
  created_at: { type: Date, default: Date.now },
  synced: { type: Boolean, default: true }
}, {
  timestamps: { createdAt: 'created_at', updatedAt: false }
});

module.exports = mongoose.model('SaleItem', saleItemSchema);

