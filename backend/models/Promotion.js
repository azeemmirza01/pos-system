const mongoose = require('mongoose');

const promotionSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  description: { type: String },
  type: {
    type: String,
    enum: ['discount_percentage', 'discount_fixed', 'buy_x_get_y', 'free_item'],
    required: true
  },
  value: { type: Number, required: true },
  start_date: { type: Date, required: true },
  end_date: { type: Date, required: true },
  applicable_products: [{ type: String, ref: 'Product' }],
  applicable_customers: [{ type: String, ref: 'Customer' }],
  min_purchase: { type: Number, default: 0 },
  max_discount: { type: Number },
  is_active: { type: Boolean, default: true },
  outlet_id: { type: String, ref: 'Outlet' },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
  synced: { type: Boolean, default: true }
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

module.exports = mongoose.model('Promotion', promotionSchema);

