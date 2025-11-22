const express = require('express');
const router = express.Router();
const Ingredient = require('../models/Ingredient');

// Get all ingredients
router.get('/', async (req, res) => {
  try {
    const { outlet_id, low_stock } = req.query;
    let query = {};
    if (outlet_id) query.outlet_id = outlet_id;
    
    const ingredients = await Ingredient.find(query).sort({ name: 1 });
    
    if (low_stock === 'true') {
      const lowStockIngredients = ingredients.filter(
        ing => ing.current_stock <= ing.min_stock
      );
      return res.json(lowStockIngredients);
    }
    
    res.json(ingredients);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get single ingredient
router.get('/:id', async (req, res) => {
  try {
    const ingredient = await Ingredient.findOne({ id: req.params.id });
    if (!ingredient) {
      return res.status(404).json({ error: 'Ingredient not found' });
    }
    res.json(ingredient);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create ingredient
router.post('/', async (req, res) => {
  try {
    const { id, local_id, ...ingredientData } = req.body;
    const ingredientId = id || local_id || `ing_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const ingredient = new Ingredient({
      id: ingredientId,
      ...ingredientData,
      synced: true
    });
    await ingredient.save();
    res.status(201).json(ingredient);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update ingredient
router.put('/:id', async (req, res) => {
  try {
    const ingredient = await Ingredient.findOneAndUpdate(
      { id: req.params.id },
      { ...req.body, updated_at: new Date(), synced: true },
      { new: true, runValidators: true }
    );
    if (!ingredient) {
      return res.status(404).json({ error: 'Ingredient not found' });
    }
    res.json(ingredient);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete ingredient
router.delete('/:id', async (req, res) => {
  try {
    const ingredient = await Ingredient.findOneAndDelete({ id: req.params.id });
    if (!ingredient) {
      return res.status(404).json({ error: 'Ingredient not found' });
    }
    res.json({ message: 'Ingredient deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

