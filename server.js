// Importing all required external modules
const express = require('express');
const mongoose = require('mongoose');
require('dotenv').config();
const User = require('./models/User');
const bcrypt = require('bcryptjs');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware to parse JSON
app.use(express.json());

// Connecting to MongoDB Atlas
mongoose
  .connect(process.env.MONGO_URL, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('DB connected successfully...'))
  .catch((err) => {
    console.error('Error connecting to the database:', err.message);
    process.exit(1); // Exit the process if the database connection fails
  });

// API landing page http://localhost:3000/
app.get('/', async (req, res) => {
  try {
    res.send("<h2 style='color:red;text-align:center'>Welcome to the MERN stack |week2|backend</h2>");
  } catch (err) {
    console.error(err);
    res.status(500).send('Internal Server Error');
  }
});

// API registration page http://localhost:3000/register
app.post('/register', async (req, res) => {
  const { username, email, password } = req.body;
  try {
    // Check if the user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists. Please login.' });
    }

    // Hash the password and save the new user
    const hashPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ username, email, password: hashPassword });
    await newUser.save();

    console.log('New user is created....');
    res.status(201).json({ message: 'User Registered Successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// API login page http://localhost:3000/login
app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    // Check if the user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found. Please register first.' });
    }

    // Compare the provided password with the hashed password in the database
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid password. Please try again.' });
    }

    // If credentials are valid, return success response
    res.json({ message: 'User login successful', username: user.username });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// Server connection and testing
app.listen(PORT, (err) => {
  if (err) {
    console.error('Error starting the server:', err);
  } else {
    console.log(`Server is running on port: ${PORT}`);
  }
});