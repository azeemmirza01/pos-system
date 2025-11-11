const express = require('express');
const router = express.Router();
const Sale = require('../models/Sale');
const SaleItem = require('../models/SaleItem');

// Get all sales
router.get('/', async (req, res) => {
  try {
    const sales = await Sale.find().sort({ created_at: -1 }).limit(1000);
    const salesWithItems = await Promise.all(sales.map(async (sale) => {
      const items = await SaleItem.find({ sale_id: sale.id });
      return {
        ...sale.toObject(),
        items
      };
    }));
    res.json(salesWithItems);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get single sale
router.get('/:id', async (req, res) => {
  try {
    const sale = await Sale.findOne({ id: req.params.id });
    if (!sale) {
      return res.status(404).json({ error: 'Sale not found' });
    }
    const items = await SaleItem.find({ sale_id: sale.id });
    res.json({
      ...sale.toObject(),
      items
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create sale
router.post('/', async (req, res) => {
  try {
    const { id, local_id, items, ...saleData } = req.body;
    const saleId = id || local_id || `sale_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const invoiceNumber = saleData.invoice_number || `INV-${Date.now()}`;
    
    // Check if sale already exists
    const existing = await Sale.findOne({ id: saleId });
    if (existing) {
      return res.status(409).json({ error: 'Sale already exists', sale: existing });
    }

    // Create sale
    const sale = new Sale({
      id: saleId,
      invoice_number: invoiceNumber,
      ...saleData,
      synced: true
    });
    await sale.save();

    // Create sale items
    if (items && items.length > 0) {
      const saleItems = items.map(item => ({
        id: item.id || `item_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        sale_id: saleId,
        product_id: item.product_id,
        quantity: item.quantity,
        price: item.price,
        total: item.total,
        synced: true
      }));
      await SaleItem.insertMany(saleItems);
    }

    res.status(201).json({ id: saleId, invoice_number: invoiceNumber });
  } catch (error) {
    if (error.code === 11000) {
      res.status(409).json({ error: 'Sale with this ID or invoice number already exists' });
    } else {
      res.status(500).json({ error: error.message });
    }
  }
});

// Update sale
router.put('/:id', async (req, res) => {
  try {
    const { id, items, ...updateData } = req.body;
    const sale = await Sale.findOneAndUpdate(
      { id: req.params.id },
      { ...updateData, updated_at: new Date(), synced: true },
      { new: true, runValidators: true }
    );
    if (!sale) {
      return res.status(404).json({ error: 'Sale not found' });
    }

    // Update sale items if provided
    if (items) {
      await SaleItem.deleteMany({ sale_id: req.params.id });
      const saleItems = items.map(item => ({
        id: item.id || `item_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        sale_id: req.params.id,
        product_id: item.product_id,
        quantity: item.quantity,
        price: item.price,
        total: item.total,
        synced: true
      }));
      await SaleItem.insertMany(saleItems);
    }

    res.json(sale);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete sale
router.delete('/:id', async (req, res) => {
  try {
    const sale = await Sale.findOneAndDelete({ id: req.params.id });
    if (!sale) {
      return res.status(404).json({ error: 'Sale not found' });
    }
    await SaleItem.deleteMany({ sale_id: req.params.id });
    res.json({ message: 'Sale deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

