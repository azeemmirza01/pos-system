const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Recipe = require('../models/Recipe');
const Ingredient = require('../models/Ingredient');

// Get all orders
router.get('/', async (req, res) => {
  try {
    const { outlet_id, status, order_type, station } = req.query;
    let query = {};
    if (outlet_id) query.outlet_id = outlet_id;
    if (status) {
      query.status = status;
    } else {
      // Only get pending/confirmed/preparing orders by default (not drafts or completed)
      query.status = { $in: ['pending', 'confirmed', 'preparing', 'ready'] };
    }
    if (order_type) query.order_type = order_type;
    
    const orders = await Order.find(query)
      .populate('customer_id')
      .populate('table_id')
      .sort({ created_at: -1 });
    
    console.log('[Orders] Found orders:', orders.length, 'Filter:', query);
    
    // Filter by station if provided
    if (station) {
      const filteredOrders = orders.filter(order => {
        const hasStationItems = order.items.some(item => 
          item.station === station && 
          (item.status === 'pending' || item.status === 'preparing')
        );
        if (hasStationItems) {
          console.log('[Orders] Order has', station, 'items:', order.order_number, order.items.filter(i => i.station === station));
        }
        return hasStationItems;
      });
      console.log('[Orders] Filtered by station', station, ':', filteredOrders.length);
      return res.json(filteredOrders);
    }
    
    res.json(orders);
  } catch (error) {
    console.error('[Orders] Error fetching orders:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get single order
router.get('/:id', async (req, res) => {
  try {
    const order = await Order.findOne({ id: req.params.id })
      .populate('customer_id')
      .populate('table_id');
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    res.json(order);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create order
router.post('/', async (req, res) => {
  try {
    const { id, local_id, outlet_id, items, ...orderData } = req.body;
    
    // Validate required fields
    if (!outlet_id) {
      return res.status(400).json({ error: 'Outlet ID is required' });
    }
    if (!items || items.length === 0) {
      return res.status(400).json({ error: 'Order must have at least one item' });
    }
    
    const orderId = id || local_id || `order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const orderNumber = `ORD-${Date.now()}`;
    
    // Ensure all items have required fields
    const validatedItems = items.map((item) => ({
      ...item,
      status: item.status || 'pending',
      station: item.station || 'none',
    }));
    
    const order = new Order({
      id: orderId,
      order_number: orderNumber,
      outlet_id: String(outlet_id),
      items: validatedItems,
      ...orderData,
      synced: true
    });
    
    // Validate and deduct ingredients if recipes are involved
    if (orderData.items) {
      const insufficientStock = [];
      
      for (const item of orderData.items) {
        const recipe = await Recipe.findOne({ product_id: item.product_id });
        if (recipe) {
          for (const ingredient of recipe.ingredients) {
            const ingredientDoc = await Ingredient.findOne({ id: ingredient.ingredient_id });
            if (ingredientDoc) {
              const needed = ingredient.quantity * item.quantity;
              if (ingredientDoc.current_stock < needed) {
                insufficientStock.push({
                  product: item.product_name,
                  ingredient: ingredientDoc.name,
                  required: needed,
                  available: ingredientDoc.current_stock
                });
              }
            }
          }
        }
      }
      
      // If insufficient stock, return error before creating order
      if (insufficientStock.length > 0) {
        return res.status(400).json({ 
          error: 'Insufficient ingredient stock',
          details: insufficientStock
        });
      }
      
      // Deduct ingredients after validation
      for (const item of orderData.items) {
        const recipe = await Recipe.findOne({ product_id: item.product_id });
        if (recipe) {
          for (const ingredient of recipe.ingredients) {
            const ingredientDoc = await Ingredient.findOne({ id: ingredient.ingredient_id });
            if (ingredientDoc) {
              const needed = ingredient.quantity * item.quantity;
              ingredientDoc.current_stock -= needed;
              await ingredientDoc.save();
            }
          }
        }
      }
    }
    
    await order.save();
    console.log('[Orders] Order created:', order.order_number, 'Items:', order.items.map(i => `${i.product_name} (${i.station})`));
    res.status(201).json(order);
  } catch (error) {
    console.error('[Orders] Error creating order:', error);
    res.status(500).json({ error: error.message || 'Error creating order' });
  }
});

// Update order
router.put('/:id', async (req, res) => {
  try {
    const order = await Order.findOneAndUpdate(
      { id: req.params.id },
      { ...req.body, updated_at: new Date(), synced: true },
      { new: true, runValidators: true }
    );
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    res.json(order);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update order item status
router.put('/:id/items/:itemIndex/status', async (req, res) => {
  try {
    const { status, station } = req.body;
    const order = await Order.findOne({ id: req.params.id });
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    
    const itemIndex = parseInt(req.params.itemIndex);
    if (order.items[itemIndex]) {
      order.items[itemIndex].status = status;
      if (station) order.items[itemIndex].station = station;
      order.updated_at = new Date();
      await order.save();
    }
    
    res.json(order);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete order
router.delete('/:id', async (req, res) => {
  try {
    const order = await Order.findOneAndDelete({ id: req.params.id });
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    res.json({ message: 'Order deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

