const express = require('express');
const router = express.Router();
const Outlet = require('../models/Outlet');

// Get all outlets
router.get('/', async (req, res) => {
  try {
    const outlets = await Outlet.find().sort({ name: 1 });
    res.json(outlets);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get single outlet
router.get('/:id', async (req, res) => {
  try {
    const outlet = await Outlet.findOne({ id: req.params.id });
    if (!outlet) {
      return res.status(404).json({ error: 'Outlet not found' });
    }
    res.json(outlet);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create outlet
router.post('/', async (req, res) => {
  try {
    const { id, local_id, ...outletData } = req.body;
    const outletId = id || local_id || `outlet_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const outlet = new Outlet({
      id: outletId,
      ...outletData,
      synced: true
    });
    await outlet.save();
    res.status(201).json(outlet);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update outlet
router.put('/:id', async (req, res) => {
  try {
    const outlet = await Outlet.findOneAndUpdate(
      { id: req.params.id },
      { ...req.body, updated_at: new Date(), synced: true },
      { new: true, runValidators: true }
    );
    if (!outlet) {
      return res.status(404).json({ error: 'Outlet not found' });
    }
    res.json(outlet);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete outlet
router.delete('/:id', async (req, res) => {
  try {
    const outlet = await Outlet.findOneAndDelete({ id: req.params.id });
    if (!outlet) {
      return res.status(404).json({ error: 'Outlet not found' });
    }
    res.json({ message: 'Outlet deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

