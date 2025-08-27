// server/routes/testRoutes.js
// Defines the routes for the database connection test.

const express = require('express');
const router = express.Router();
const { 
  createTestEntry, 
  getTestEntries,
  updateTestEntry,
  deleteTestEntry
} = require('../controllers/testController');

// Route to get all test entries and create a new one
router.route('/').get(getTestEntries).post(createTestEntry);

// Route to update or delete a specific entry by its ID
router.route('/:id').put(updateTestEntry).delete(deleteTestEntry);

module.exports = router;
