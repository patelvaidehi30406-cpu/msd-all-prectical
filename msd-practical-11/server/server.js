const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const postRoutes = require('./routes/postRoutes');

// Load environment variables from .env
dotenv.config();

const app = express();

// Configure CORS to allow requests from the React Vite frontend
const allowedOrigins = [
  process.env.CLIENT_URL || 'http://localhost:5173',
  'http://localhost:5173',
  'http://127.0.0.1:5173',
];

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin or any localhost/127.0.0.1 port in development
      if (
        !origin ||
        allowedOrigins.includes(origin) ||
        /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)
      ) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
  })
);

// Parse JSON and URL-encoded bodies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Root welcome & health check routes
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Practical 11: MERN Blog Management API is running!',
    frontendUrl: 'http://localhost:5173',
    endpoints: {
      health: '/api/health',
      auth: '/api/auth',
      posts: '/api/posts',
    },
  });
});

app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'MERN Blog Management API is running.',
  });
});

// Mount API routes
app.use('/api/auth', authRoutes);
app.use('/api/posts', postRoutes);

// 404 Route handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
  });
});

const PORT = process.env.PORT || 5000;

// Start server after connecting to MongoDB (only when executed directly)
if (require.main === module) {
  connectDB().then(() => {
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  });
}

module.exports = app;
