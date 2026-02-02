const express = require('express');
const router = express.Router();
const multer = require('multer');
const { uploadPaper, downloadPaper } = require('../controllers/paperController');
const { verifyToken } = require('../middleware/authenticate');
const { checkPermission } = require('../middleware/authorize');

// Configure Multer for memory storage (buffer)
const upload = multer({ 
    storage: multer.memoryStorage(),
    limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// Upload: Authenticated + Student Role
router.post('/upload', 
    verifyToken, 
    checkPermission('upload_paper'), 
    upload.single('file'), 
    uploadPaper
);

// Download: Authenticated
router.get('/:id/download', 
    verifyToken, 
    downloadPaper 
);

module.exports = router;