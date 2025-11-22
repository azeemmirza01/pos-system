const mongoose = require('mongoose');

const saleSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  invoice_number: { type: String, required: true, unique: true },
  customer_id: { type: String, ref: 'Customer' },
  order_id: { type: String, ref: 'Order' },
  outlet_id: { type: String, ref: 'Outlet' },
  total_amount: { type: Number, required: true },
  subtotal: { type: Number, required: true },
  discount: { type: Number, default: 0 },
  tax: { type: Number, default: 0 },
  tax_details: [{
    tax_id: { type: String, ref: 'Tax' },
    tax_name: { type: String },
    tax_rate: { type: Number },
    tax_amount: { type: Number }
  }],
  payment_method: { type: String, default: 'cash' },
  status: { type: String, default: 'completed' },
  sale_type: {
    type: String,
    enum: ['dine-in', 'takeaway', 'delivery'],
    default: 'takeaway'
  },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
  synced: { type: Boolean, default: true }
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

module.exports = mongoose.model('Sale', saleSchema);

