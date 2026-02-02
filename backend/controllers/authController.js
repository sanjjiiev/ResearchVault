const bcrypt = require('bcrypt');
const supabase = require('../config/supabase'); 
const { sendOTP } = require('../utils/emailService');

// 1. REGISTER NEW USER
exports.register = async (req, res) => {
    const { email, password, full_name, role } = req.body;

    // Create user in Supabase Auth
    const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
            // This metadata helps the Trigger create the profile row automatically
            data: { full_name, role: role || 'student' } 
        }
    });

    if (error) return res.status(400).json({ error: error.message });

    res.json({ message: 'Registration successful! Please log in.' });
};

// 2. LOGIN STEP 1 (Password Verification)
exports.loginInit = async (req, res) => {
    const { email, password } = req.body;

    try {
        // A. Verify Password & Get Session
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) {
            console.error("Login Error:", error.message);
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // B. Fetch User Role from Profiles Table (CRITICAL STEP)
        const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', data.user.id)
            .single();

        // C. Generate & Hash OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const hashedOtp = await bcrypt.hash(otp, 10);

        // D. Store Hash in DB
        await supabase.from('user_secrets').upsert({ user_id: data.user.id, otp_hash: hashedOtp });

        // E. Send Email (with Fail-Safe)
        console.log(`(Debug) OTP for ${email}: ${otp}`); // For lab demo
        try {
            await sendOTP(email, otp);
        } catch (err) {
            console.log("⚠️ Email sending failed, check terminal for OTP.");
        }

        // F. Return Token & Role to Frontend
        res.json({ 
            message: 'First factor verified.', 
            userId: data.user.id,
            tempToken: data.session.access_token, // The real Supabase JWT
            role: profile?.role || 'student'        // The user's role (admin/faculty/student)
        });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// 3. LOGIN STEP 2 (MFA Verification)
exports.loginVerify = async (req, res) => {
    const { userId, otp } = req.body;

    try {
        const { data } = await supabase.from('user_secrets').select('otp_hash').eq('user_id', userId).single();
        
        if (!data) return res.status(400).json({ error: 'Session expired' });

        const valid = await bcrypt.compare(otp, data.otp_hash);
        if (!valid) return res.status(401).json({ error: 'Invalid OTP' });

        // Success! Frontend will now save the token it received in Step 1.
        res.json({ message: 'Login Successful' });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};