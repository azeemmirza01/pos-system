const express = require('express');
const router = express.Router();
const SaleItem = require('../models/SaleItem');

// Get all sale items
router.get('/', async (req, res) => {
  try {
    const saleItems = await SaleItem.find().sort({ created_at: -1 });
    res.json(saleItems);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get sale items by sale ID
router.get('/sale/:saleId', async (req, res) => {
  try {
    const saleItems = await SaleItem.find({ sale_id: req.params.saleId });
    res.json(saleItems);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get single sale item
router.get('/:id', async (req, res) => {
  try {
    const saleItem = await SaleItem.findOne({ id: req.params.id });
    if (!saleItem) {
      return res.status(404).json({ error: 'Sale item not found' });
    }
    res.json(saleItem);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create sale item
router.post('/', async (req, res) => {
  try {
    const { id, local_id, ...saleItemData } = req.body;
    const saleItemId = id || local_id || `item_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const saleItem = new SaleItem({
      id: saleItemId,
      ...saleItemData,
      synced: true
    });
    await saleItem.save();
    res.status(201).json(saleItem);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update sale item
router.put('/:id', async (req, res) => {
  try {
    const { id, ...updateData } = req.body;
    const saleItem = await SaleItem.findOneAndUpdate(
      { id: req.params.id },
      { ...updateData, synced: true },
      { new: true, runValidators: true }
    );
    if (!saleItem) {
      return res.status(404).json({ error: 'Sale item not found' });
    }
    res.json(saleItem);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete sale item
router.delete('/:id', async (req, res) => {
  try {
    const saleItem = await SaleItem.findOneAndDelete({ id: req.params.id });
    if (!saleItem) {
      return res.status(404).json({ error: 'Sale item not found' });
    }
    res.json({ message: 'Sale item deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

