const nodemailer = require('nodemailer');
require('dotenv').config();

// Create Transporter (Using Gmail as example)
// For production/labs without a domain, use an 'App Password' from Google Account settings
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER, // Your Gmail address
        pass: process.env.EMAIL_PASS  // Your Gmail App Password
    }
});

exports.sendOTP = async (toEmail, otp) => {
    const mailOptions = {
        from: `"ResearchVault Security" <${process.env.EMAIL_USER}>`,
        to: toEmail,
        subject: 'Your Login Verification Code',
        text: `Your One-Time Password (OTP) is: ${otp}\n\nThis code expires in 5 minutes. Do not share it.`,
        html: `
            <div style="font-family: Arial, sans-serif; padding: 20px;">
                <h2>ResearchVault Access</h2>
                <p>Your Single-Use Login Code is:</p>
                <h1 style="color: #2563eb; letter-spacing: 5px;">${otp}</h1>
                <p>If you did not request this, please contact admin immediately.</p>
            </div>
        `
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`✅ OTP sent to ${toEmail}`);
        return true;
    } catch (error) {
        console.error("❌ Email sending failed:", error);
        return false;
    }
};

exports.validateEmailFormat = (email) => {
    // Regex for standard email format
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(String(email).toLowerCase());
};