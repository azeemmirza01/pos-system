const mongoose = require('mongoose');

const taxSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true }, // VAT, GST, HST, Custom
  rate: { type: Number, required: true }, // percentage
  type: {
    type: String,
    enum: ['VAT', 'GST', 'HST', 'CUSTOM'],
    required: true
  },
  is_active: { type: Boolean, default: true },
  applies_to: {
    type: [String],
    enum: ['all', 'food', 'beverage', 'alcohol', 'custom'],
    default: ['all']
  },
  outlet_id: { type: String, ref: 'Outlet' },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
  synced: { type: Boolean, default: true }
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

module.exports = mongoose.model('Tax', taxSchema);

