const cryptoEngine = require('../utils/cryptoEngine');
const supabase = require('../config/supabase');

exports.publishDecision = async (req, res) => {
    const { paperId, status, comments } = req.body; // status: 'Accepted' or 'Rejected'
    
    // 1. Create Decision Letter Content
    const decisionText = `Decision for Paper ${paperId}: ${status}. Comments: ${comments}. Date: ${new Date().toISOString()}`;

    // 2. Generate Digital Signature (SHA256 Hash + RSA Sign)
    const signature = cryptoEngine.createSignature(decisionText);

    // 3. Save to DB
    await supabase.from('reviews').insert({
        paper_id: paperId,
        reviewer_id: req.user.id,
        decision_text: decisionText,
        digital_signature: signature,
        status: status
    });

    res.json({ message: 'Decision published with digital signature.', signature });
};