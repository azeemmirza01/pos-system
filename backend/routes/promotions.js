const express = require('express');
const router = express.Router();
const Promotion = require('../models/Promotion');

// Get all promotions
router.get('/', async (req, res) => {
  try {
    const { outlet_id, is_active } = req.query;
    let query = {};
    if (outlet_id) query.outlet_id = outlet_id;
    if (is_active !== undefined) query.is_active = is_active === 'true';
    
    const promotions = await Promotion.find(query)
      .populate('applicable_products')
      .populate('applicable_customers')
      .sort({ start_date: -1 });
    res.json(promotions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get active promotions
router.get('/active', async (req, res) => {
  try {
    const { outlet_id } = req.query;
    const now = new Date();
    let query = {
      is_active: true,
      start_date: { $lte: now },
      end_date: { $gte: now }
    };
    if (outlet_id) query.outlet_id = outlet_id;
    
    const promotions = await Promotion.find(query)
      .populate('applicable_products')
      .populate('applicable_customers');
    res.json(promotions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get single promotion
router.get('/:id', async (req, res) => {
  try {
    const promotion = await Promotion.findOne({ id: req.params.id })
      .populate('applicable_products')
      .populate('applicable_customers');
    if (!promotion) {
      return res.status(404).json({ error: 'Promotion not found' });
    }
    res.json(promotion);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create promotion
router.post('/', async (req, res) => {
  try {
    const { id, local_id, ...promotionData } = req.body;
    const promotionId = id || local_id || `promo_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const promotion = new Promotion({
      id: promotionId,
      ...promotionData,
      synced: true
    });
    await promotion.save();
    res.status(201).json(promotion);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update promotion
router.put('/:id', async (req, res) => {
  try {
    const promotion = await Promotion.findOneAndUpdate(
      { id: req.params.id },
      { ...req.body, updated_at: new Date(), synced: true },
      { new: true, runValidators: true }
    );
    if (!promotion) {
      return res.status(404).json({ error: 'Promotion not found' });
    }
    res.json(promotion);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete promotion
router.delete('/:id', async (req, res) => {
  try {
    const promotion = await Promotion.findOneAndDelete({ id: req.params.id });
    if (!promotion) {
      return res.status(404).json({ error: 'Promotion not found' });
    }
    res.json({ message: 'Promotion deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

