const express = require('express');
const router = express.Router();
const Role = require('../models/Role');
const Permission = require('../models/Permission');

// Get all roles
router.get('/', async (req, res) => {
  try {
    const roles = await Role.find().populate('permissions').sort({ name: 1 });
    res.json(roles);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get single role
router.get('/:id', async (req, res) => {
  try {
    const role = await Role.findOne({ id: req.params.id }).populate('permissions');
    if (!role) {
      return res.status(404).json({ error: 'Role not found' });
    }
    res.json(role);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create role
router.post('/', async (req, res) => {
  try {
    const { id, local_id, ...roleData } = req.body;
    const roleId = id || local_id || `role_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const role = new Role({
      id: roleId,
      ...roleData
    });
    await role.save();
    res.status(201).json(role);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update role
router.put('/:id', async (req, res) => {
  try {
    const role = await Role.findOne({ id: req.params.id });
    if (role && role.is_system) {
      return res.status(403).json({ error: 'Cannot modify system role' });
    }
    
    const updatedRole = await Role.findOneAndUpdate(
      { id: req.params.id },
      { ...req.body, updated_at: new Date() },
      { new: true, runValidators: true }
    );
    if (!updatedRole) {
      return res.status(404).json({ error: 'Role not found' });
    }
    res.json(updatedRole);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete role
router.delete('/:id', async (req, res) => {
  try {
    const role = await Role.findOne({ id: req.params.id });
    if (role && role.is_system) {
      return res.status(403).json({ error: 'Cannot delete system role' });
    }
    
    const deletedRole = await Role.findOneAndDelete({ id: req.params.id });
    if (!deletedRole) {
      return res.status(404).json({ error: 'Role not found' });
    }
    res.json({ message: 'Role deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all permissions
router.get('/permissions/all', async (req, res) => {
  try {
    const permissions = await Permission.find().sort({ module: 1, name: 1 });
    res.json(permissions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

