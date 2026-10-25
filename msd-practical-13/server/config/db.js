const mongoose = require('mongoose');

let mongoConnected = false;

/**
 * Connect to MongoDB Atlas using Mongoose.
 * If MONGO_URI still contains template placeholders or MongoDB is unreachable,
 * falls back cleanly so the server can still run for local testing.
 */
const connectDB = async () => {
  const rawURI = process.env.MONGO_URI || '';
  const hasPlaceholder =
    !rawURI || rawURI.includes('<username>') || rawURI.includes('<cluster-url>');

  const targetURI = hasPlaceholder
    ? 'mongodb://127.0.0.1:27017/practical13_dms'
    : rawURI;

  try {
    const conn = await mongoose.connect(targetURI, {
      serverSelectionTimeoutMS: hasPlaceholder ? 2000 : 5000,
    });
    mongoConnected = true;
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    mongoConnected = false;
    if (hasPlaceholder) {
      console.log(
        '[Database] MONGO_URI in server/.env is still set to the example placeholder.'
      );
      console.log(
        '[Database] Running with built-in local storage fallback so you can test the app immediately.'
      );
      console.log(
        '[Database] To use MongoDB Atlas, replace MONGO_URI in server/.env with your Atlas connection string.'
      );
    } else {
      console.warn(`[Database] Could not connect to MongoDB (${error.message}).`);
      console.warn('[Database] Falling back to built-in local storage mode.');
    }
  }
};

const isMongoConnected = () => mongoConnected && mongoose.connection.readyState === 1;

module.exports = { connectDB, isMongoConnected };
