const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors()); // enable CORS for all routes
app.use(express.json()); // parse json bodies

// Connect to MongoDB
// // mongoose.connect('your_mongodb_connection_string', { useNewUrlParser: true, useUnifiedTopology: true });

// Sample route
app.get('/api/jobs', (req, res) => {
    res.json({ message: "Jobs API works!"});
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});