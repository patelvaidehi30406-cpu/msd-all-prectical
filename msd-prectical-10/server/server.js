const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const connectDB = require('./config/db');
const studentRoutes = require('./routes/studentRoutes');

// Load environment variables from .env file
dotenv.config();

// Connect to MongoDB Atlas
connectDB();

const app = express();

// Configure CORS to allow requests from the React Vite frontend
app.use(
  cors({
    origin: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    credentials: true,
  })
);

// Built-in middleware to parse JSON request bodies
app.use(express.json());

// Root welcome route
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Welcome to Practical 10 MERN Student Management API!',
    mongoStatus: mongoose.connection.readyState === 1 ? 'Connected' : 'Connecting / Disconnected',
    endpoints: {
      health: '/api/health',
      students: '/api/students',
    },
    frontendUrl: process.env.CLIENT_URL || 'http://localhost:5173',
  });
});

// Health check route
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    mongoConnected: mongoose.connection.readyState === 1,
    message: 'Student Management API is running smoothly',
  });
});

// Mount student API routes
app.use('/api/students', studentRoutes);

// 404 Route handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
  });
});

const PORT = process.env.PORT || 5002;

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
