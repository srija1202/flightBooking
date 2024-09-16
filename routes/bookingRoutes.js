const express = require('express');
const router = express.Router();
const { createBooking, getBookingsByUserId, cancelBooking, createPaymentIntent } = require('../controllers/bookingController');
const { authenticateToken } = require('../middleware/authMiddleware');

// Route to create a booking
router.post('/createBookings', authenticateToken, createBooking);

// Route to get all bookings
router.get('/getBookings/:userId', authenticateToken, getBookingsByUserId);

// Route to cancel a booking
router.post('/cancelBooking', authenticateToken, cancelBooking);

router.post('/create-payment-intent', authenticateToken, createPaymentIntent);

module.exports = router;
