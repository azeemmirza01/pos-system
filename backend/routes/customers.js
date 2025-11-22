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

// Send SMS to customers (SMS Marketing)
router.post('/send-sms', async (req, res) => {
  try {
    const { message, customer_ids, filter } = req.body;
    
    if (!message || message.trim().length === 0) {
      return res.status(400).json({ error: 'Message is required' });
    }
    
    let customers = [];
    
    if (customer_ids && customer_ids.length > 0) {
      // Send to specific customers
      customers = await Customer.find({ 
        id: { $in: customer_ids },
        sms_opt_in: true,
        phone: { $exists: true, $ne: null, $ne: '' }
      });
    } else if (filter) {
      // Filter customers based on criteria
      const query = { sms_opt_in: true, phone: { $exists: true, $ne: null, $ne: '' } };
      
      if (filter.loyalty_points_min) {
        query.loyalty_points = { $gte: filter.loyalty_points_min };
      }
      if (filter.tags && filter.tags.length > 0) {
        query.tags = { $in: filter.tags };
      }
      if (filter.outlet_id) {
        query.outlet_id = filter.outlet_id;
      }
      
      customers = await Customer.find(query);
    } else {
      // Send to all opted-in customers
      customers = await Customer.find({ 
        sms_opt_in: true,
        phone: { $exists: true, $ne: null, $ne: '' }
      });
    }
    
    if (customers.length === 0) {
      return res.status(400).json({ error: 'No customers found matching criteria' });
    }
    
    // In a real implementation, you would integrate with SMS service like Twilio
    // For now, we'll just return the list of customers who would receive the SMS
    const results = customers.map(customer => ({
      customer_id: customer.id,
      name: customer.name,
      phone: customer.phone,
      status: 'queued' // In real implementation, this would be 'sent' or 'failed'
    }));
    
    // TODO: Integrate with SMS service (Twilio, AWS SNS, etc.)
    // Example: await twilioClient.messages.create({ to: customer.phone, body: message });
    
    res.json({
      message: 'SMS queued for sending',
      total_recipients: customers.length,
      recipients: results,
      note: 'SMS service integration required. Configure Twilio or similar service in backend.'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get customers eligible for SMS marketing
router.get('/sms-eligible', async (req, res) => {
  try {
    const customers = await Customer.find({ 
      sms_opt_in: true,
      phone: { $exists: true, $ne: null, $ne: '' }
    }).select('id name phone loyalty_points tags');
    
    res.json({
      total: customers.length,
      customers: customers
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

