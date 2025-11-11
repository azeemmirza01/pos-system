const express = require('express');
const router = express.Router();
const Customer = require('../models/Customer');

// Get all customers
router.get('/', async (req, res) => {
  try {
    const customers = await Customer.find().sort({ name: 1 });
    res.json(customers);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get single customer
router.get('/:id', async (req, res) => {
  try {
    const customer = await Customer.findOne({ id: req.params.id });
    if (!customer) {
      return res.status(404).json({ error: 'Customer not found' });
    }
    res.json(customer);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create customer
router.post('/', async (req, res) => {
  try {
    const { id, local_id, ...customerData } = req.body;
    const customerId = id || local_id || `cust_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Check if customer already exists
    const existing = await Customer.findOne({ id: customerId });
    if (existing) {
      return res.status(409).json({ error: 'Customer already exists', customer: existing });
    }

    const customer = new Customer({
      id: customerId,
      ...customerData,
      synced: true
    });
    await customer.save();
    res.status(201).json(customer);
  } catch (error) {
    if (error.code === 11000) {
      res.status(409).json({ error: 'Customer with this ID already exists' });
    } else {
      res.status(500).json({ error: error.message });
    }
  }
});

// Update customer
router.put('/:id', async (req, res) => {
  try {
    const { id, ...updateData } = req.body;
    const customer = await Customer.findOneAndUpdate(
      { id: req.params.id },
      { ...updateData, updated_at: new Date(), synced: true },
      { new: true, runValidators: true }
    );
    if (!customer) {
      return res.status(404).json({ error: 'Customer not found' });
    }
    res.json(customer);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete customer
router.delete('/:id', async (req, res) => {
  try {
    const customer = await Customer.findOneAndDelete({ id: req.params.id });
    if (!customer) {
      return res.status(404).json({ error: 'Customer not found' });
    }
    res.json({ message: 'Customer deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

