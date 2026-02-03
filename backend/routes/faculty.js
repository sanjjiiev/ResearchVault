const express = require('express');
const router = express.Router();
const supabase = require('../config/supabase');
const { verifyToken } = require('../middleware/authenticate');
const { checkPermission } = require('../middleware/authorize');

// Route: Submit a Review
router.post('/review', verifyToken, checkPermission('submit_review'), async (req, res) => {
    const { paperId, score, comments } = req.body;
    const reviewerId = req.user.id;

    try {
        // 1. Check if review already exists
        const { data: existing } = await supabase
            .from('reviews')
            .select('*')
            .eq('paper_id', paperId)
            .eq('reviewer_id', reviewerId)
            .single();

        if (existing) {
            return res.status(400).json({ error: "You have already reviewed this paper." });
        }

        // 2. Insert Review
        const { error } = await supabase.from('reviews').insert({
            paper_id: paperId,
            reviewer_id: reviewerId,
            score: parseInt(score),
            comments: comments,
            status: 'pending' // Decision hasn't been made by admin yet
        });

        if (error) throw error;

        // 3. Update Paper Status to 'Under Review'
        await supabase.from('papers').update({ status: 'under_review' }).eq('id', paperId);

        res.json({ message: "Review submitted successfully." });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;