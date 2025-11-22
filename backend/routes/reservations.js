const express = require('express');
const router = express.Router();
const Reservation = require('../models/Reservation');

// Get all reservations
router.get('/', async (req, res) => {
  try {
    const { outlet_id, status, date } = req.query;
    let query = {};
    if (outlet_id) query.outlet_id = outlet_id;
    if (status) query.status = status;
    if (date) {
      const startDate = new Date(date);
      startDate.setHours(0, 0, 0, 0);
      const endDate = new Date(date);
      endDate.setHours(23, 59, 59, 999);
      query.reservation_date = { $gte: startDate, $lte: endDate };
    }
    
    const reservations = await Reservation.find(query)
      .populate('customer_id')
      .populate('table_id')
      .sort({ reservation_date: 1, reservation_time: 1 });
    res.json(reservations);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get single reservation
router.get('/:id', async (req, res) => {
  try {
    const reservation = await Reservation.findOne({ id: req.params.id })
      .populate('customer_id')
      .populate('table_id');
    if (!reservation) {
      return res.status(404).json({ error: 'Reservation not found' });
    }
    res.json(reservation);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create reservation
router.post('/', async (req, res) => {
  try {
    const { id, local_id, ...reservationData } = req.body;
    const reservationId = id || local_id || `res_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const reservation = new Reservation({
      id: reservationId,
      ...reservationData,
      synced: true
    });
    await reservation.save();
    res.status(201).json(reservation);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update reservation
router.put('/:id', async (req, res) => {
  try {
    const reservation = await Reservation.findOneAndUpdate(
      { id: req.params.id },
      { ...req.body, updated_at: new Date(), synced: true },
      { new: true, runValidators: true }
    );
    if (!reservation) {
      return res.status(404).json({ error: 'Reservation not found' });
    }
    res.json(reservation);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete reservation
router.delete('/:id', async (req, res) => {
  try {
    const reservation = await Reservation.findOneAndDelete({ id: req.params.id });
    if (!reservation) {
      return res.status(404).json({ error: 'Reservation not found' });
    }
    res.json({ message: 'Reservation deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

