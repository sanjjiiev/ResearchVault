const bcrypt = require('bcrypt'); // Hashing with salt
const supabase = require('../config/supabase'); 
// Mock email sender (replace with nodemailer in real app)
const sendEmail = (email, otp) => console.log(`📧 [EMAIL SENT] To: ${email} | OTP: ${otp}`);

exports.loginInit = async (req, res) => {
    const { email, password } = req.body;

    // 1. First Factor: Verify Password via Supabase
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return res.status(401).json({ error: 'Invalid credentials' });

    // 2. Generate Second Factor (OTP)
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    // 3. Hash the OTP (Security Best Practice: Never store plain OTPs)
    const saltRounds = 10;
    const hashedOtp = await bcrypt.hash(otp, saltRounds);

    // 4. Store Hash in DB (in a real app, use Redis with TTL)
    // Here we update a custom table 'user_secrets'
    await supabase.from('user_secrets').upsert({ user_id: data.user.id, otp_hash: hashedOtp });

    // 5. Send OTP
    sendEmail(email, otp);

    res.json({ message: 'First factor verified. Check email for OTP.', userId: data.user.id });
};

exports.loginVerify = async (req, res) => {
    const { userId, otp } = req.body;

    // 1. Fetch Hashed OTP
    const { data } = await supabase.from('user_secrets').select('otp_hash').eq('user_id', userId).single();
    if (!data) return res.status(400).json({ error: 'Session expired' });

    // 2. Verify Hash
    const valid = await bcrypt.compare(otp, data.otp_hash);
    if (!valid) return res.status(401).json({ error: 'Invalid OTP' });

    // 3. Create Session Token (Mint manual JWT or retrieve session)
    // For this lab, we just return the session from the initial login if we cached it, 
    // or tell frontend to proceed.
    res.json({ message: 'Login Successful', token: 'mock-jwt-token-for-demo' });
};