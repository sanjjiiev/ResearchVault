const express = require('express');
const router = express.Router();
const { publishDecision } = require('../controllers/adminController');
const { verifyToken } = require('../middleware/authenticate');
const { checkPermission } = require('../middleware/authorize');

// Decision: Authenticated + Admin Role
router.post('/decision', 
    verifyToken, 
    checkPermission('publish_decision'), 
    publishDecision
);

module.exports = router;