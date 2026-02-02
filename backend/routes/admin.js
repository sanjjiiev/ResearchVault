// backend/routes/admin.js
const express = require('express');
const router = express.Router();
const supabase = require('../config/supabase');
const cryptoEngine = require('../utils/cryptoEngine'); // Uses your RSA keys
const { verifyToken } = require('../middleware/authenticate');
const { checkPermission } = require('../middleware/authorize');

// Route: Publish Decision (Digitally Signed)
router.post('/decision', verifyToken, checkPermission('publish_decision'), async (req, res) => {
    const { paperId, status } = req.body; // status = 'accepted' or 'rejected'
    const adminId = req.user.id;

    try {
        // 1. Create Decision Letter Content
        // This exact string is what gets signed. Any change invalidates the signature.
        const decisionText = `OFFICIAL DECISION: Paper ${paperId} is hereby ${status.toUpperCase()} by Admin ${adminId} on ${new Date().toISOString()}`;

        // 2. Generate Digital Signature (SHA-256 Hash -> Encrypt with Private Key)
        const signature = cryptoEngine.createSignature(decisionText);

        // 3. Update Paper Status
        await supabase.from('papers').update({ status: status }).eq('id', paperId);

        // 4. Save Decision Record
        // We use the 'reviews' table to store the final admin decision too
        await supabase.from('reviews').insert({
            paper_id: paperId,
            reviewer_id: adminId,
            decision_text: decisionText,
            digital_signature: signature,
            status: status,
            comments: "Final Decision Published"
        });

        res.json({ message: "Decision published and digitally signed.", signature });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;