const express = require('express');
const {
  uploadDocument,
  getUserDocuments,
  downloadDocument,
  deleteDocument,
} = require('../controllers/documentController');
const { protect } = require('../middleware/authMiddleware');
const { handleSingleUpload } = require('../middleware/uploadMiddleware');

const router = express.Router();

// All document routes require authentication
router.use(protect);

router.get('/', getUserDocuments);
router.post('/upload', handleSingleUpload, uploadDocument);
router.get('/:id/download', downloadDocument);
router.delete('/:id', deleteDocument);

module.exports = router;
