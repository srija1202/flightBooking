const express = require('express');
const router = express.Router();
const flightController = require('../controllers/flightController');
const { authenticateToken } = require('../middleware/authMiddleware');
require('dotenv').config();

// Get all flights
router.get('/', authenticateToken, flightController.searchFlights);

module.exports = router;
