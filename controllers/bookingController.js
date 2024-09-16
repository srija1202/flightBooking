const Flight = require('../models/Flight');
const Booking = require('../models/Booking');
const mongoose = require('mongoose');
const User = require('../models/User');
const stripe = require('../config/stripeConfig');
const Amadeus = require('amadeus');
const nodemailer = require('nodemailer');
const generatePDF = require('../utils/pdfGenerator');


const amadeus = new Amadeus({
  clientId: process.env.AMADEUS_CLIENT_ID,
  clientSecret: process.env.AMADEUS_CLIENT_SECRET,
});

// Create a transporter for sending emails
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});
// Booking controller
exports.createBooking = async (req, res) => {
  const {
    userId,
    flightId,
    passengers,
    seatPreferences = [],
    paymentIntentId,
    amount,
    originLocationCode,
    destinationLocationCode,
    departureDate,
  } = req.body;

  try {
    if (!userId || !flightId || !passengers || !paymentIntentId || !amount || !originLocationCode || !destinationLocationCode || !departureDate) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: 'Invalid userId format' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const flightData = await amadeus.shopping.flightOffersSearch.get({
      originLocationCode,
      destinationLocationCode,
      departureDate,
      adults: passengers.length,
      max: 30
    });

    const selectedFlight = flightData.data.find(flight => flight.id === flightId);
    if (!selectedFlight) return res.status(404).json({ message: 'Flight not found in Amadeus data' });

    if (selectedFlight.numberOfBookableSeats < passengers.length) {
      return res.status(400).json({ message: 'Not enough seats available' });
    }

    const seatPrefs = Array.isArray(seatPreferences) ? seatPreferences : [];
    const unavailableSeats = seatPrefs.filter(seat => !selectedFlight.itineraries.some(itinerary =>
      itinerary.segments.some(segment => segment.availableSeats && segment.availableSeats.includes(seat))
    ));
    if (unavailableSeats.length > 0) {
      return res.status(400).json({ message: `Seats not available: ${unavailableSeats.join(', ')}` });
    }

    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    if (paymentIntent.status !== 'succeeded') {
      return res.status(400).json({ message: 'Payment not completed' });
    }

    const booking = {
      user: new mongoose.Types.ObjectId(userId),
      flight: flightId,
      airlineName: selectedFlight.validatingAirlineCodes[0],
      departure: selectedFlight.itineraries[0].segments[0].departure.at,
      arrival: selectedFlight.itineraries[0].segments[selectedFlight.itineraries[0].segments.length - 1].arrival.at,
      passengers: passengers.map(p => ({
        ...p,
        gender: p.gender || 'Other',
        seatPreference: p.seatPreference || ''
      })),
      paymentDetails: {
        method: 'stripe',
        paymentIntentId: paymentIntentId,
      },
      totalPrice: amount,
      ticketsCount: passengers.length,
      status: 'Confirmed',
    };

    const newBooking = await Booking.create(booking);

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: 'Booking Confirmation',
      text: `Your booking has been confirmed!`,
    };

    await transporter.sendMail(mailOptions);

    await newBooking.save();


    res.status(201).json({ message: 'Booking created successfully', booking: newBooking });
  } catch (error) {
    console.error('Error creating booking:', error);
    res.status(500).json({ message: 'Booking creation failed', error });
  }
};

// Get all bookings with optional status filtering
exports.getAllBookings = async (req, res) => {
  const { status } = req.query; // Optional filter

  try {
    const filter = status ? { status } : {};
    const bookings = await Booking.find(filter).populate('flight').populate('user');

    res.status(200).json(bookings);
  } catch (error) {
    console.error('Error fetching bookings:', error);
    res.status(500).json({ message: 'Error fetching bookings', error });
  }
};

// Cancel a booking
// Cancel booking controller
exports.cancelBooking = async (req, res) => {
  const { bookingId } = req.body;

  try {
    // Find the booking
    const booking = await Booking.findById(bookingId).populate('user');
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Trigger refund through Stripe
    let refundResponse;
    if (booking.paymentDetails.paymentIntentId) {
      refundResponse = await stripe.refunds.create({
        payment_intent: booking.paymentDetails.paymentIntentId,
        amount: Math.round(booking.totalPrice * 100), // Amount in cents
      });
    } else if (booking.paymentDetails.chargeId) {
      refundResponse = await stripe.refunds.create({
        charge: booking.paymentDetails.chargeId,
        amount: Math.round(booking.totalPrice * 100), // Amount in cents
      });
    } else {
      return res.status(400).json({ message: 'No payment information available for refund' });
    }


    // Send an email to the user
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: booking.user.email,
      subject: 'Booking Cancellation Confirmation',
      text: `Your booking with flight number ${booking.flight} has been cancelled. A refund of $${booking.totalPrice.toFixed(2)} will be processed within 7 business days. If you have any questions, please contact our support.`,
    };

     // Update the booking status to 'Cancelled'
     booking.status = 'Cancelled'; 

    await transporter.sendMail(mailOptions);
    await booking.save();

    // Respond with success message
    res.status(200).json({
      message: 'Booking cancelled successfully. Refund will be processed within 7 business days.',
    });
  } catch (error) {
    console.error('Error cancelling booking:', error);
    res.status(500).json({ message: 'Error cancelling booking', error });
  }
};

// Create a Payment Intent
exports.createPaymentIntent = async (req, res) => {
  const { amount, userId } = req.body;

  try {
    // Ensure amount is a valid integer in cents
    const amountInCents = Math.round(amount * 100);
    // Fetch user details from the database
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    const name = user.firstName + ' ' + user.lastName;
    const phoneNumber = user.phoneNumber;
    // Create a Payment Intent with the specified amount and billing details
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInCents, // Amount in cents
      currency: 'usd',
      payment_method_types: ['card'],
      receipt_email: user.email, // Email for sending the receipt
      metadata: {
        name,
        phoneNumber
      },
    });

    // Respond with the client secret from the Payment Intent
    res.json({ clientSecret: paymentIntent.client_secret });
  } catch (error) {
    console.error('Error creating payment intent:', error);
    res.status(500).json({ error: 'Failed to create payment intent' });
  }
};

