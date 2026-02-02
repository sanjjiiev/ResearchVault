const express = require('express');
const router = express.Router();
const { loginInit, loginVerify } = require('../controllers/authController');

// Route: POST /api/auth/login (Step 1: Password)
router.post('/login', loginInit);

// Route: POST /api/auth/verify-otp (Step 2: MFA)
router.post('/verify-otp', loginVerify);

module.exports = router;