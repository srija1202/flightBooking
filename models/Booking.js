const mongoose = require('mongoose');

// Define the booking schema
const bookingSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Reference to the User model
    required: true
  },
  flight: {
    type: String,
    required: true
  },
  airlineName: {
    type: String,
    required: true
  },
  departure: {
    type: Date,
    required: true
  },
  arrival: {
    type: Date,
    required: true
  },
  passengers: [
    {
      name: {
        type: String,
        required: true
      },
      age: {
        type: Number,
        required: true
      },
      gender: {
        type: String,
        enum: ['Male', 'Female', 'Other'], // Ensure valid gender values
        required: true
      },
      seatPreference: {
        type: String,
        enum: ['Window', 'Aisle', 'Middle'],
        required: true
      }
    }
  ],
  paymentDetails: {
    method: {
      type: String,
      enum: ['stripe', 'paypal'], // Payment methods
      required: true
    },
    paymentIntentId :{
      type: String,
      required: true
    }
  },
  totalPrice: {
    type: Number,
    required: true
  },
  ticketsCount: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['Confirmed', 'Pending', 'Cancelled'], // Booking statuses
    default: 'Pending' // Default to 'Pending' if not provided
  }
}, {
  timestamps: true // Automatically add createdAt and updatedAt timestamps
});

// Create the Booking model
const Booking = mongoose.model('Booking', bookingSchema);

module.exports = Booking;
