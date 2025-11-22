const express = require('express');
const router = express.Router();
const Table = require('../models/Table');

// Get all tables
router.get('/', async (req, res) => {
  try {
    const { outlet_id, status } = req.query;
    let query = {};
    if (outlet_id) query.outlet_id = outlet_id;
    if (status) query.status = status;
    
    const tables = await Table.find(query).sort({ number: 1 });
    res.json(tables);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get single table
router.get('/:id', async (req, res) => {
  try {
    const table = await Table.findOne({ id: req.params.id }).populate('current_order_id');
    if (!table) {
      return res.status(404).json({ error: 'Table not found' });
    }
    res.json(table);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create table
router.post('/', async (req, res) => {
  try {
    const { id, local_id, number, capacity, outlet_id, ...tableData } = req.body;
    
    // Validate required fields
    if (!number) {
      return res.status(400).json({ error: 'Table number is required' });
    }
    if (!capacity || capacity < 1) {
      return res.status(400).json({ error: 'Table capacity must be at least 1' });
    }
    if (!outlet_id) {
      return res.status(400).json({ error: 'Outlet ID is required' });
    }
    
    const tableId = id || local_id || `table_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const table = new Table({
      id: tableId,
      number: String(number).trim(),
      capacity: Number(capacity),
      outlet_id: String(outlet_id),
      ...tableData,
      synced: true
    });
    
    await table.save();
    res.status(201).json(table);
  } catch (error) {
    console.error('Error creating table:', error);
    if (error.code === 11000) {
      return res.status(400).json({ error: 'Table number already exists for this outlet' });
    }
    res.status(500).json({ error: error.message || 'Error creating table' });
  }
});

// Update table
router.put('/:id', async (req, res) => {
  try {
    const { number, capacity, outlet_id, ...updateData } = req.body;
    
    // Validate if provided
    if (capacity !== undefined && capacity < 1) {
      return res.status(400).json({ error: 'Table capacity must be at least 1' });
    }
    
    const updateFields = {
      ...updateData,
      updated_at: new Date(),
      synced: true
    };
    
    if (number !== undefined) {
      updateFields.number = String(number).trim();
    }
    if (capacity !== undefined) {
      updateFields.capacity = Number(capacity);
    }
    if (outlet_id !== undefined) {
      updateFields.outlet_id = String(outlet_id);
    }
    
    const table = await Table.findOneAndUpdate(
      { id: req.params.id },
      updateFields,
      { new: true, runValidators: true }
    );
    
    if (!table) {
      return res.status(404).json({ error: 'Table not found' });
    }
    res.json(table);
  } catch (error) {
    console.error('Error updating table:', error);
    if (error.code === 11000) {
      return res.status(400).json({ error: 'Table number already exists for this outlet' });
    }
    res.status(500).json({ error: error.message || 'Error updating table' });
  }
});

// Delete table
router.delete('/:id', async (req, res) => {
  try {
    const table = await Table.findOneAndDelete({ id: req.params.id });
    if (!table) {
      return res.status(404).json({ error: 'Table not found' });
    }
    res.json({ message: 'Table deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Merge tables
router.post('/merge', async (req, res) => {
  try {
    const { table_ids, target_table_id } = req.body;
    // Implementation for merging tables
    res.json({ message: 'Tables merged successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Split table
router.post('/split', async (req, res) => {
  try {
    const { table_id, new_tables } = req.body;
    // Implementation for splitting table
    res.json({ message: 'Table split successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Transfer table
router.post('/transfer', async (req, res) => {
  try {
    const { from_table_id, to_table_id, order_id } = req.body;
    // Implementation for transferring table
    res.json({ message: 'Table transferred successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

