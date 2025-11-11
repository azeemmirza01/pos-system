const express = require('express');
const router = express.Router();
const Product = require('../models/Product');

// Get all products
router.get('/', async (req, res) => {
  try {
    const products = await Product.find().sort({ name: 1 });
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get single product
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findOne({ id: req.params.id });
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json(product);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create product
router.post('/', async (req, res) => {
  try {
    const { id, local_id, ...productData } = req.body;
    const productId = id || local_id || `prod_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Check if product already exists
    const existing = await Product.findOne({ id: productId });
    if (existing) {
      return res.status(409).json({ error: 'Product already exists', product: existing });
    }

    const product = new Product({
      id: productId,
      ...productData,
      synced: true
    });
    await product.save();
    res.status(201).json(product);
  } catch (error) {
    if (error.code === 11000) {
      res.status(409).json({ error: 'Product with this ID already exists' });
    } else {
      res.status(500).json({ error: error.message });
    }
  }
});

// Update product
router.put('/:id', async (req, res) => {
  try {
    const { id, ...updateData } = req.body;
    const product = await Product.findOneAndUpdate(
      { id: req.params.id },
      { ...updateData, updated_at: new Date(), synced: true },
      { new: true, runValidators: true }
    );
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json(product);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete product
router.delete('/:id', async (req, res) => {
  try {
    const product = await Product.findOneAndDelete({ id: req.params.id });
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

