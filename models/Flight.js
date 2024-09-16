const mongoose = require('mongoose');

const segmentSchema = new mongoose.Schema({
  departure: {
    iataCode: String,
    terminal: String,
    at: Date,
  },
  arrival: {
    iataCode: String,
    terminal: String,
    at: Date,
  },
  carrierCode: String,
  number: String,
  aircraft: {
    code: String,
  },
  operating: {
    carrierCode: String,
  },
  duration: String,
  id: String,
  numberOfStops: Number,
  blacklistedInEU: Boolean,
});

const itinerarySchema = new mongoose.Schema({
  duration: String,
  segments: [segmentSchema],
});

const priceSchema = new mongoose.Schema({
  currency: String,
  total: String,
  base: String,
  fees: [{
    amount: String,
    type: String,
  }],
  grandTotal: String,
});

const flightSchema = new mongoose.Schema({
  type: String,
  flightId: { type: String, unique: true },
  source: String,
  instantTicketingRequired: Boolean,
  nonHomogeneous: Boolean,
  oneWay: Boolean,
  isUpsellOffer: Boolean,
  lastTicketingDate: Date,
  lastTicketingDateTime: Date,
  numberOfBookableSeats: Number,
  itineraries: [itinerarySchema],
  price: priceSchema,
  pricingOptions: {
    fareType: [String],
    includedCheckedBagsOnly: Boolean,
  },
  validatingAirlineCodes: [String],
  travelerPricings: [{
    travelerId: String,
    fareOption: String,
    travelerType: String,
    price: {
      currency: String,
      total: String,
      base: String,
    },
    fareDetailsBySegment: [{
      segmentId: String,
      cabin: String,
      fareBasis: String,
      brandedFare: String,
      brandedFareLabel: String,
      class: String,
      includedCheckedBags: {
        quantity: Number,
      },
      amenities: [{
        description: String,
        isChargeable: Boolean,
        amenityType: String,
        amenityProvider: {
          name: String,
        },
      }],
    }],
  }],
});

const Flight = mongoose.model('Flight', flightSchema);
module.exports = Flight;
