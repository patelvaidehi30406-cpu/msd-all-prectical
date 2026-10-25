const mongoose = require('mongoose');

/**
 * Connect to MongoDB Atlas using the MONGO_URI environment variable.
 */
const connectDB = async () => {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error(
        'MONGO_URI is not defined in environment variables. Please copy .env.example to .env and set your MongoDB Atlas URI.'
      );
    }

    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`MongoDB Connection Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
