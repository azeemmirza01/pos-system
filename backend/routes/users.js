const express = require('express');
const router = express.Router();
const User = require('../models/User');

// Get all users
router.get('/', async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get single user
router.get('/:id', async (req, res) => {
  try {
    const user = await User.findOne({ id: req.params.id }).select('-password');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create user
router.post('/', async (req, res) => {
  try {
    const { id, local_id, ...userData } = req.body;
    const userId = id || local_id || `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const user = new User({
      id: userId,
      ...userData,
      synced: true
    });
    await user.save();
    const userResponse = user.toObject();
    delete userResponse.password;
    res.status(201).json(userResponse);
  } catch (error) {
    if (error.code === 11000) {
      res.status(409).json({ error: 'User with this ID or username already exists' });
    } else {
      res.status(500).json({ error: error.message });
    }
  }
});

// Update user
router.put('/:id', async (req, res) => {
  try {
    const { id, ...updateData } = req.body;
    const user = await User.findOneAndUpdate(
      { id: req.params.id },
      { ...updateData, synced: true },
      { new: true, runValidators: true }
    ).select('-password');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete user
router.delete('/:id', async (req, res) => {
  try {
    const user = await User.findOneAndDelete({ id: req.params.id });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

