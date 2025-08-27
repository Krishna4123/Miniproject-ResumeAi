// server/controllers/testController.js
// Controller for handling the logic for the test routes.

const Test = require('../models/Test');

// @desc    Create a new test entry
// @route   POST /api/test
exports.createTestEntry = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) {
      return res.status(400).json({ message: 'Name is required' });
    }
    const newEntry = new Test({ name });
    await newEntry.save();
    res.status(201).json(newEntry);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Get all test entries
// @route   GET /api/test
exports.getTestEntries = async (req, res) => {
  try {
    const entries = await Test.find().sort({ createdAt: -1 });
    res.status(200).json(entries);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Update a test entry (e.g., toggle completion)
// @route   PUT /api/test/:id
exports.updateTestEntry = async (req, res) => {
  try {
    const entry = await Test.findById(req.params.id);
    if (!entry) {
      return res.status(404).json({ message: 'Entry not found' });
    }
    entry.completed = !entry.completed;
    await entry.save();
    res.status(200).json(entry);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Delete a test entry
// @route   DELETE /api/test/:id
exports.deleteTestEntry = async (req, res) => {
  try {
    const entry = await Test.findById(req.params.id);
    if (!entry) {
      return res.status(404).json({ message: 'Entry not found' });
    }
    await entry.deleteOne();
    res.status(200).json({ message: 'Entry removed' });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};
