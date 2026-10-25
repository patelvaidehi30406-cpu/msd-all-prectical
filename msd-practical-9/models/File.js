const mongoose = require('mongoose');

/**
 * Mongoose Schema for storing uploaded file metadata
 */
const fileSchema = new mongoose.Schema(
  {
    originalFilename: {
      type: String,
      required: [true, 'Original filename is required'],
      trim: true,
    },
    storedFilename: {
      type: String,
      required: [true, 'Stored filename is required'],
      trim: true,
    },
    filePath: {
      type: String,
      required: [true, 'File path is required'],
    },
    mimeType: {
      type: String,
      required: [true, 'MIME type is required'],
    },
    size: {
      type: Number,
      required: [true, 'File size is required'],
    },
    uploadDate: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('File', fileSchema);
