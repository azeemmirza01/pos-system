const express = require('express');
const router = express.Router();
const Recipe = require('../models/Recipe');
const Ingredient = require('../models/Ingredient');
const Product = require('../models/Product');

// Get all recipes
router.get('/', async (req, res) => {
  try {
    const recipes = await Recipe.find().populate('product_id').sort({ name: 1 });
    res.json(recipes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get single recipe
router.get('/:id', async (req, res) => {
  try {
    const recipe = await Recipe.findOne({ id: req.params.id }).populate('product_id');
    if (!recipe) {
      return res.status(404).json({ error: 'Recipe not found' });
    }
    res.json(recipe);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create recipe
router.post('/', async (req, res) => {
  try {
    const { id, local_id, ...recipeData } = req.body;
    const recipeId = id || local_id || `recipe_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const recipe = new Recipe({
      id: recipeId,
      ...recipeData,
      synced: true
    });
    await recipe.save();
    
    // Update product to link recipe
    if (recipeData.product_id) {
      await Product.findOneAndUpdate(
        { id: recipeData.product_id },
        { has_recipe: true, recipe_id: recipeId }
      );
    }
    
    res.status(201).json(recipe);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update recipe
router.put('/:id', async (req, res) => {
  try {
    const recipe = await Recipe.findOneAndUpdate(
      { id: req.params.id },
      { ...req.body, updated_at: new Date(), synced: true },
      { new: true, runValidators: true }
    );
    if (!recipe) {
      return res.status(404).json({ error: 'Recipe not found' });
    }
    res.json(recipe);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete recipe
router.delete('/:id', async (req, res) => {
  try {
    const recipe = await Recipe.findOneAndDelete({ id: req.params.id });
    if (!recipe) {
      return res.status(404).json({ error: 'Recipe not found' });
    }
    
    // Update product to remove recipe link
    await Product.findOneAndUpdate(
      { recipe_id: req.params.id },
      { has_recipe: false, recipe_id: null }
    );
    
    res.json({ message: 'Recipe deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Deduct ingredients when recipe is used
router.post('/:id/deduct-ingredients', async (req, res) => {
  try {
    const recipe = await Recipe.findOne({ id: req.params.id });
    if (!recipe) {
      return res.status(404).json({ error: 'Recipe not found' });
    }
    
    const { quantity = 1 } = req.body;
    const updates = [];
    
    for (const ingredient of recipe.ingredients) {
      const needed = ingredient.quantity * quantity;
      const ingredientDoc = await Ingredient.findOne({ id: ingredient.ingredient_id });
      
      if (!ingredientDoc) {
        return res.status(404).json({ error: `Ingredient ${ingredient.ingredient_id} not found` });
      }
      
      if (ingredientDoc.current_stock < needed) {
        return res.status(400).json({ 
          error: `Insufficient stock for ${ingredientDoc.name}. Required: ${needed}, Available: ${ingredientDoc.current_stock}` 
        });
      }
      
      ingredientDoc.current_stock -= needed;
      updates.push(ingredientDoc.save());
    }
    
    await Promise.all(updates);
    res.json({ message: 'Ingredients deducted successfully', recipe });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

