const express = require('express');
const router = express.Router();
const Tax = require('../models/Tax');

// Get all taxes
router.get('/', async (req, res) => {
  try {
    const { outlet_id, is_active } = req.query;
    let query = {};
    if (outlet_id) query.outlet_id = outlet_id;
    if (is_active !== undefined) query.is_active = is_active === 'true';
    
    const taxes = await Tax.find(query).sort({ name: 1 });
    res.json(taxes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get single tax
router.get('/:id', async (req, res) => {
  try {
    const tax = await Tax.findOne({ id: req.params.id });
    if (!tax) {
      return res.status(404).json({ error: 'Tax not found' });
    }
    res.json(tax);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create tax
router.post('/', async (req, res) => {
  try {
    const { id, local_id, ...taxData } = req.body;
    const taxId = id || local_id || `tax_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const tax = new Tax({
      id: taxId,
      ...taxData,
      synced: true
    });
    await tax.save();
    res.status(201).json(tax);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update tax
router.put('/:id', async (req, res) => {
  try {
    const tax = await Tax.findOneAndUpdate(
      { id: req.params.id },
      { ...req.body, updated_at: new Date(), synced: true },
      { new: true, runValidators: true }
    );
    if (!tax) {
      return res.status(404).json({ error: 'Tax not found' });
    }
    res.json(tax);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete tax
router.delete('/:id', async (req, res) => {
  try {
    const tax = await Tax.findOneAndDelete({ id: req.params.id });
    if (!tax) {
      return res.status(404).json({ error: 'Tax not found' });
    }
    res.json({ message: 'Tax deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

