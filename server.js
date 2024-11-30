const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcrypt'); // For hashing passwords
const dotenv = require('dotenv'); // For environment variables

dotenv.config(); // Load environment variables from .env file

const app = express();
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;

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

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
