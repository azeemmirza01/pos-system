const express = require('express');
const router = express.Router();
const Waste = require('../models/Waste');
const Ingredient = require('../models/Ingredient');

// Get all waste records
router.get('/', async (req, res) => {
  try {
    const { outlet_id, start_date, end_date } = req.query;
    let query = {};
    if (outlet_id) query.outlet_id = outlet_id;
    if (start_date || end_date) {
      query.created_at = {};
      if (start_date) query.created_at.$gte = new Date(start_date);
      if (end_date) query.created_at.$lte = new Date(end_date);
    }
    
    const wasteRecords = await Waste.find(query)
      .populate('ingredient_id')
      .sort({ created_at: -1 });
    res.json(wasteRecords);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create waste record
router.post('/', async (req, res) => {
  try {
    const { id, local_id, ...wasteData } = req.body;
    const wasteId = id || local_id || `waste_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Deduct from ingredient stock
    const ingredient = await Ingredient.findOne({ id: wasteData.ingredient_id });
    if (!ingredient) {
      return res.status(404).json({ error: 'Ingredient not found' });
    }
    
    if (ingredient.current_stock < wasteData.quantity) {
      return res.status(400).json({ error: 'Insufficient stock' });
    }
    
    ingredient.current_stock -= wasteData.quantity;
    await ingredient.save();
    
    const waste = new Waste({
      id: wasteId,
      ...wasteData,
      synced: true
    });
    await waste.save();
    res.status(201).json(waste);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete waste record
router.delete('/:id', async (req, res) => {
  try {
    const waste = await Waste.findOneAndDelete({ id: req.params.id });
    if (!waste) {
      return res.status(404).json({ error: 'Waste record not found' });
    }
    res.json({ message: 'Waste record deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

