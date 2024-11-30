const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcrypt'); // For hashing passwords
const jwt = require('jsonwebtoken'); // For token generation
const dotenv = require('dotenv'); // For environment variables

dotenv.config(); // Load environment variables from .env file

const app = express();
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;
const JWT_SECRET = process.env.JWT_SECRET || 'your_secret_key'; // Replace with a secure key

// Middleware
app.use(cors()); // Enable CORS for all routes
app.use(express.json()); // Parse JSON bodies

// MongoDB Connection
const connectDB = async () => {
  try {
    await mongoose.connect(MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('Error connecting to MongoDB:', error.message);
    process.exit(1); // Exit the process if the connection fails
  }
};
connectDB();

// User Model
const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  userType: { type: String, required: true },
});

const User = mongoose.model('User', UserSchema);

// Routes

// Test Route
app.get('/api/jobs', (req, res) => {
  res.json({ message: 'Jobs API works!' });
});

// Signup Route
app.post('/signup', async (req, res) => {
  const { name, email, password, userType } = req.body;

  try {
    // Validate incoming data
    if (!name || !email || !password || !userType) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Check if email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already exists' });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new user
    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      userType,
    });

    // Save the user to the database
    await newUser.save();

    // Send success response
    res.status(201).json({ message: 'Account created successfully' });
  } catch (error) {
    console.error('Error in signup:', error.message);
    res.status(500).json({ message: 'Something went wrong' });
  }
});

// Login Route
app.post('/login', async (req, res) => {
  const { email, password, userType } = req.body;

  try {
    // Validate incoming data
    if (!email || !password || !userType) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Find the user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check userType
    if (user.userType !== userType) {
      return res.status(403).json({ message: 'Invalid user type' });
    }

    // Compare password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid password' });
    }

    // Generate JWT token
    const token = jwt.sign({ userId: user._id, userType: user.userType }, JWT_SECRET, {
      expiresIn: '1h', // Token expires in 1 hour
    });

    console.log("Login successful, token generated: ", token);  // Add logging
    // Send success response with token
    res.status(200).json({ message: 'Login successful', token });
  } catch (error) {
    console.error('Error in login:', error.message);
    res.status(500).json({ message: 'Something went wrong' });
  }
});

// Protected Route Example
app.get('/dashboard', (req, res) => {
  const token = req.headers.authorization?.split(' ')[1]; // Extract token from Bearer header

  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET);
    res.status(200).json({ message: 'Welcome to the dashboard!', user: decoded });
  } catch (error) {
    res.status(401).json({ message: 'Invalid or expired token' });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
