const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  firstName: String,
  lastName: String,
  phoneNumber: String,
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  country: String,
  isActive: { type: Boolean, default: false },
  activationToken: String,
  stripeCustomerId: String
});

module.exports = mongoose.model('User', userSchema);
