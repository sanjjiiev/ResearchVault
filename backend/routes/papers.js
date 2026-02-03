const express = require('express');
const router = express.Router();
const multer = require('multer');

// FIX: Added 'listPapers' to the import list
const { uploadPaper, downloadPaper, listPapers } = require('../controllers/paperController');
const { verifyToken } = require('../middleware/authenticate');
const { checkPermission } = require('../middleware/authorize');

// Configure Multer for memory storage (buffer)
const upload = multer({ 
    storage: multer.memoryStorage(),
    limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// Route: List All Papers (for Dashboard)
router.get('/', verifyToken, listPapers); 

// Route: Upload Paper (Student only)
router.post('/upload', 
    verifyToken, 
    checkPermission('upload_paper'), 
    upload.single('file'), 
    uploadPaper
);

// Route: Download Paper
router.get('/:id/download', 
    verifyToken, 
    downloadPaper 
);

module.exports = router;