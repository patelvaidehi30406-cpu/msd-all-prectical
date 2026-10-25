const path = require('path');
const fs = require('fs');
const mongoose = require('mongoose');
const Document = require('../models/Document');
const { uploadDir } = require('../middleware/uploadMiddleware');
const { isMongoConnected } = require('../config/db');
const { localDocumentStore } = require('../config/localStore');

/**
 * @desc    Upload a new document and store metadata in MongoDB
 * @route   POST /api/documents/upload
 * @access  Private
 */
const uploadDocument = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please select a file to upload.',
      });
    }

    const docData = {
      filename: req.file.filename,
      originalName: req.file.originalname,
      fileType: req.file.mimetype,
      fileSize: req.file.size,
      uploadDate: new Date(),
      owner: req.user._id,
    };

    const document = isMongoConnected()
      ? await Document.create(docData)
      : await localDocumentStore.create(docData);

    return res.status(201).json({
      success: true,
      message: 'Document uploaded successfully.',
      document,
    });
  } catch (error) {
    // Clean up uploaded file on disk if saving metadata fails
    if (req.file && req.file.path && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    console.error('Upload Document Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to save document metadata.',
    });
  }
};

/**
 * @desc    Get all documents belonging strictly to the authenticated user
 * @route   GET /api/documents
 * @access  Private
 */
const getUserDocuments = async (req, res) => {
  try {
    const documents = isMongoConnected()
      ? await Document.find({ owner: req.user._id }).sort({ uploadDate: -1 })
      : await localDocumentStore.findByOwner(req.user._id);

    return res.status(200).json({
      success: true,
      count: documents.length,
      documents,
    });
  } catch (error) {
    console.error('Get Documents Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve documents.',
    });
  }
};

/**
 * @desc    Download a single document owned by the authenticated user
 * @route   GET /api/documents/:id/download
 * @access  Private
 */
const downloadDocument = async (req, res) => {
  try {
    let document = null;

    if (isMongoConnected()) {
      if (mongoose.Types.ObjectId.isValid(req.params.id)) {
        document = await Document.findOne({
          _id: req.params.id,
          owner: req.user._id,
        });
      }
    } else {
      document = await localDocumentStore.findOneByIdAndOwner(
        req.params.id,
        req.user._id
      );
    }

    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Document not found or you do not have permission to access it.',
      });
    }

    const filePath = path.join(uploadDir, path.basename(document.filename));

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        message: 'File not found on server storage.',
      });
    }

    return res.download(filePath, document.originalName);
  } catch (error) {
    console.error('Download Document Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error downloading document.',
    });
  }
};

/**
 * @desc    Delete a document owned by the authenticated user (both DB record and file)
 * @route   DELETE /api/documents/:id
 * @access  Private
 */
const deleteDocument = async (req, res) => {
  try {
    let document = null;

    if (isMongoConnected()) {
      if (mongoose.Types.ObjectId.isValid(req.params.id)) {
        document = await Document.findOne({
          _id: req.params.id,
          owner: req.user._id,
        });
      }
    } else {
      document = await localDocumentStore.findOneByIdAndOwner(
        req.params.id,
        req.user._id
      );
    }

    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Document not found or you do not have permission to delete it.',
      });
    }

    const filePath = path.join(uploadDir, path.basename(document.filename));

    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    if (isMongoConnected()) {
      await document.deleteOne();
    } else {
      await localDocumentStore.deleteById(req.params.id);
    }

    return res.status(200).json({
      success: true,
      message: 'Document deleted successfully.',
      id: req.params.id,
    });
  } catch (error) {
    console.error('Delete Document Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error deleting document.',
    });
  }
};

module.exports = {
  uploadDocument,
  getUserDocuments,
  downloadDocument,
  deleteDocument,
};
