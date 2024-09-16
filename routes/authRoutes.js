const express = require('express');
const { register, login, activate } = require('../controllers/authController');
const router = express.Router();

// Register route
router.post('/register', register);

// Login route
router.post('/login', login);

// Activate route
router.get('/activate/:token', activate);

module.exports = router;
