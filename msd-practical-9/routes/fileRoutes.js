const express = require('express');
const multer = require('multer');
const File = require('../models/File');
const { upload } = require('../config/multerConfig');

const router = express.Router();

/**
 * @route   POST /api/files/upload
 * @desc    Upload a single file and save its metadata in MongoDB
 */
router.post('/upload', (req, res) => {
  upload.any()(req, res, async (err) => {
    // 1. Handle Multer-specific errors (e.g., file size limit, unexpected field)
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({
          success: false,
          message: 'File size exceeds the 5 MB limit.',
        });
      }
      return res.status(400).json({
        success: false,
        message: `Multer upload error: ${err.message}`,
      });
    }

    // 2. Handle custom errors such as unsupported file types
    if (err) {
      if (err.code === 'UNSUPPORTED_FILE_TYPE') {
        return res.status(400).json({
          success: false,
          message: err.message,
        });
      }
      return res.status(500).json({
        success: false,
        message: 'An error occurred during file upload.',
        error: err.message,
      });
    }

    // 3. Handle missing file in request
    const uploadedFile = req.file || (req.files && req.files[0]);
    if (!uploadedFile) {
      return res.status(400).json({
        success: false,
        message: 'No file provided. Please attach a file under the field name "file".',
      });
    }

    // 4. Save file metadata to MongoDB
    try {
      const newFile = new File({
        originalFilename: uploadedFile.originalname,
        storedFilename: uploadedFile.filename,
        filePath: uploadedFile.path.replace(/\\/g, '/'),
        mimeType: uploadedFile.mimetype,
        size: uploadedFile.size,
        uploadDate: new Date(),
      });

      const savedFile = await newFile.save();

      return res.status(201).json({
        success: true,
        message: 'File uploaded and metadata saved successfully.',
        data: savedFile,
      });
    } catch (dbError) {
      return res.status(500).json({
        success: false,
        message: 'Failed to save file metadata to database.',
        error: dbError.message,
      });
    }
  });
});

/**
 * @route   GET /api/files
 * @desc    Retrieve a list of all uploaded files' metadata
 */
router.get('/', async (req, res) => {
  try {
    const files = await File.find().sort({ uploadDate: -1 });
    return res.status(200).json({
      success: true,
      count: files.length,
      data: files,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve file metadata from database.',
      error: error.message,
    });
  }
});

module.exports = router;
