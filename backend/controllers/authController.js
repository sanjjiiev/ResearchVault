const bcrypt = require('bcrypt');
const supabase = require('../config/supabase'); 
const { sendOTP } = require('../utils/emailService');

// 1. REGISTER
exports.register = async (req, res) => {
    const { email, password, full_name, role } = req.body;
    const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name, role: role || 'student' } }
    });
    if (error) return res.status(400).json({ error: error.message });
    res.json({ message: 'Registration successful! Please log in.' });
};

// 2. LOGIN STEP 1 (Password)
exports.loginInit = async (req, res) => {
    const { email, password } = req.body;

    // A. Verify Password & Get Real Token
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return res.status(401).json({ error: 'Invalid credentials' });

    // B. Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const hashedOtp = await bcrypt.hash(otp, 10);

    // C. Store Hash
    await supabase.from('user_secrets').upsert({ user_id: data.user.id, otp_hash: hashedOtp });

    // D. Send Email
    console.log(`(Debug) OTP for ${email}: ${otp}`);
    try {
        await sendOTP(email, otp);
    } catch (err) {
        console.log("⚠️ Email failed (using terminal OTP).");
    }

    // E. RETURN THE REAL TOKEN (Hidden in a 'temp' field)
    res.json({ 
        message: 'First factor verified.', 
        userId: data.user.id,
        tempToken: data.session.access_token // <--- THIS IS THE KEY FIX
    });
};

// 3. LOGIN STEP 2 (MFA)
exports.loginVerify = async (req, res) => {
    const { userId, otp } = req.body;

    const { data } = await supabase.from('user_secrets').select('otp_hash').eq('user_id', userId).single();
    if (!data) return res.status(400).json({ error: 'Session expired' });

    const valid = await bcrypt.compare(otp, data.otp_hash);
    if (!valid) return res.status(401).json({ error: 'Invalid OTP' });

    // OTP matched! We don't need to return a token here because Step 1 gave it.
    res.json({ message: 'Login Successful' });
};