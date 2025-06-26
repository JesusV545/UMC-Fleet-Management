const express = require('express');
const router = express.Router();
const AmbulanceUnit = require('../models/AmbulanceUnit');

// @route   GET /api/units
// @desc    Get all ambulance units
router.get('/', async (req, res) => {
  try {
    const units = await AmbulanceUnit.find();
    res.json(units);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// @route   POST /api/units
// @desc    Create a new ambulance unit
router.post('/', async (req, res) => {
  try {
    const newUnit = new AmbulanceUnit(req.body);
    const savedUnit = await newUnit.save();
    res.status(201).json(savedUnit);
  } catch (err) {
    res.status(400).json({ message: 'Error creating unit', error: err.message });
  }
});

// @route   PUT /api/units/:id
// @desc    Update an ambulance unit by ID
router.put('/:id', async (req, res) => {
  try {
    const updatedUnit = await AmbulanceUnit.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true } // return the updated document
    );

    if (!updatedUnit) {
      return res.status(404).json({ message: 'Unit not found' });
    }

    res.json(updatedUnit);
  } catch (err) {
    res.status(400).json({ message: 'Error updating unit', error: err.message });
  }
});

// @route   DELETE /api/units/:id
// @desc    Delete an ambulance unit by ID
router.delete('/:id', async (req, res) => {
  try {
    const deletedUnit = await AmbulanceUnit.findByIdAndDelete(req.params.id);

    if (!deletedUnit) {
      return res.status(404).json({ message: 'Unit not found' });
    }

    res.json({ message: 'Unit deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting unit', error: err.message });
  }
});



module.exports = router;
