require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const fileRoutes = require('./routes/fileRoutes');

const app = express();

// Environment configuration
const PORT = process.env.PORT || 5001;
const MONGODB_URI =
  process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/msd_practical_9';

// Built-in middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files statically from /uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Root health-check route
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Practical 9: File Upload Module API is running.',
    endpoints: {
      uploadFile: 'POST /api/files/upload',
      listFiles: 'GET /api/files',
    },
  });
});

// Mount file upload routes
app.use('/api/files', fileRoutes);

// 404 Route handler for undefined routes
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found.`,
  });
});

// Global error-handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled Server Error:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
  });
});

// Connect to MongoDB and start Express server
mongoose
  .connect(MONGODB_URI)
  .then(() => {
    console.log('Connected to MongoDB successfully.');
    app.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    console.error('MongoDB connection error:', error.message);
    process.exit(1);
  });
