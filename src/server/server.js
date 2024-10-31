const express = require('express');
const connectDB = require('./config/db');
const app = express();

// Connect Database
connectDB();

// Middleware to parse JSON
app.use(express.json());

// Enable CORS using headers
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', 'http://localhost:5173'); // Replace with your frontend URL
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    if (req.method === 'OPTIONS') {
        return res.status(200).json({});
    }
    next();
});

// Import Routes
const authRoutes = require('./routes/auth');

// Define Routes
app.use('/api/auth', authRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));