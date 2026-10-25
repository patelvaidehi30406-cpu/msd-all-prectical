const express = require('express');
const app = express();
const PORT = 3000;

// Middleware to read JSON data
app.use(express.json());

// Custom middleware to log requests
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

// Home route
app.get('/', (req, res) => {
  res.send('Practical 8: Express Server is Running!');
});

// About route
app.get('/about', (req, res) => {
  res.json({
    page: 'About',
    message: 'This is the Express.js routing and middleware practical.'
  });
});

// Contact route
app.get('/contact', (req, res) => {
  res.json({
    page: 'Contact',
    email: 'student@example.com',
    message: 'Contact page response'
  });
});

// POST route to handle request data
app.post('/message', (req, res) => {
  const { name, message } = req.body;

  if (!name || !message) {
    return res.status(400).json({
      success: false,
      message: 'Name and message are required'
    });
  }

  res.status(200).json({
    success: true,
    message: 'Request received successfully',
    data: { name, message }
  });
});

// Handle unknown routes
app.use((req, res) => {
  res.status(404).json({
    error: 'Route not found'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
