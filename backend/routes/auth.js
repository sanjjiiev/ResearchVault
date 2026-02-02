const express = require('express');
const router = express.Router();

// FIX: Added 'register' to the import list
const { loginInit, loginVerify, register } = require('../controllers/authController');

// Route: Register new user (Step 0)
router.post('/register', register);

// Route: Login Step 1 (Password)
router.post('/login', loginInit);

// Route: Login Step 2 (MFA OTP)
router.post('/verify-otp', loginVerify);

module.exports = router;