const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const User = require('../models/User');
const dotenv = require('dotenv');
dotenv.config();

// Create a transporter for sending emails
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Register a new user
const register = async (req, res) => {
  try {
    const { firstName, lastName, phoneNumber, email, password, country } = req.body;

    // Check if the email is already registered
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email is already registered' });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Generate activation token
    const activationToken = jwt.sign({ email }, process.env.JWT_SECRET_KEY, { expiresIn: '1h' });

    // Create a new user
    const user = new User({ firstName, lastName, phoneNumber, email, password: hashedPassword, country, activationToken });

    // Send activation email
    const activationLink = `http://localhost:5173/activate/${activationToken}`;
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Account Activation',
      html: `<p>Click <a href="${activationLink}">here</a> to activate your account.</p>`
    });

    await user.save();

    res.status(201).json({ message: 'User registered. Please check your email to activate your account.' });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ message: 'Email is already registered' });
    }
    res.status(500).json({ message: err.message });
  }
};

// Login a user
const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    if (!user.isActive) {
      return res.status(403).json({ message: 'Account not activated' });
    }

    const token = jwt.sign({ email }, process.env.JWT_SECRET_KEY, { expiresIn: '1h' });
    res.json({ token, userId: user._id });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Activate a user's account
const activate = async (req, res) => {
  try {
    const { token } = req.params;
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    const user = await User.findOne({ email: decoded.email });
    if (!user) return res.status(400).json({ message: 'Invalid token' });

    user.isActive = true;
    user.activationToken = undefined;
    await user.save();

    res.send('Account activated! You can now log in.');
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { register, login, activate };
