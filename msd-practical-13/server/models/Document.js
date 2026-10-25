const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema(
  {
    filename: {
      type: String,
      required: [true, 'Stored filename is required'],
    },
    originalName: {
      type: String,
      required: [true, 'Original file name is required'],
      trim: true,
    },
    fileType: {
      type: String,
      required: [true, 'File MIME type is required'],
    },
    fileSize: {
      type: Number,
      required: [true, 'File size in bytes is required'],
    },
    uploadDate: {
      type: Date,
      default: Date.now,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Document owner is required'],
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Document', documentSchema);
