const fs = require('fs');
const path = require('path');
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

// Always load server/.env regardless of working directory
dotenv.config({ path: path.join(__dirname, '.env') });

const { connectDB, isMongoConnected } = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const documentRoutes = require('./routes/documentRoutes');

const app = express();

// Configure CORS (allow local Vite dev server ports)
const configuredOrigins = (process.env.CLIENT_URL || 'http://localhost:5173')
  .split(',')
  .map((origin) => origin.trim());

app.use(
  cors({
    origin: (origin, callback) => {
      if (
        !origin ||
        configuredOrigins.includes(origin) ||
        /^http:\/\/(localhost|127\.0\.0\.1):\d+$/.test(origin)
      ) {
        callback(null, true);
      } else {
        callback(new Error(`Origin ${origin} not allowed by CORS`));
      }
    },
    credentials: true,
    exposedHeaders: ['Content-Disposition'],
  })
);

// Parse JSON and URL-encoded bodies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    database: isMongoConnected() ? 'mongodb' : 'local-fallback',
    message: 'Practical 13 MERN Document Management API is running.',
  });
});

// Mount API routes
app.use('/api/auth', authRoutes);
app.use('/api/documents', documentRoutes);

// 404 handler for unknown API routes
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found.`,
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Unhandled Error:', err.message);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
  });
});

const DEFAULT_PORT = Number(process.env.PORT) || 5050;

/**
 * Keep client/.env synced with the actual bound backend port
 */
const syncClientEnvPort = (boundPort) => {
  try {
    const clientEnvPath = path.join(__dirname, '..', 'client', '.env');
    const expectedContent = `# Backend API Base URL\nVITE_API_URL=http://localhost:${boundPort}/api\n`;
    if (fs.existsSync(clientEnvPath)) {
      const current = fs.readFileSync(clientEnvPath, 'utf-8');
      if (!current.includes(`http://localhost:${boundPort}/api`)) {
        fs.writeFileSync(clientEnvPath, expectedContent, 'utf-8');
      }
    }
  } catch (err) {
    // Ignore sync errors
  }
};

const listenWithRetry = (port, maxRetries = 10) => {
  const server = app.listen(port, () => {
    syncClientEnvPort(port);
    console.log(`Server running on http://localhost:${port}`);
  });

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE' && maxRetries > 0) {
      console.warn(`Port ${port} is busy, trying port ${port + 1}...`);
      listenWithRetry(port + 1, maxRetries - 1);
    } else {
      console.error('Server failed to start:', err.message);
      process.exit(1);
    }
  });
};

const startServer = async () => {
  await connectDB();
  listenWithRetry(DEFAULT_PORT);
};

startServer();
