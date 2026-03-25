import nodemailer from "nodemailer";
import "../loadEnv.js";

/**
 * Configure Nodemailer Transporter
 * Using environment variables for security.
 */
const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE || "gmail",
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
});

// Diagnostic log (Masked)
console.log("📨 Mail Service initialized:", {
  service: "gmail",
  user: process.env.MAIL_USER,
  pass: process.env.MAIL_PASS ? `${process.env.MAIL_PASS.substring(0, 3)}...${process.env.MAIL_PASS.substring(process.env.MAIL_PASS.length - 3)}` : "MISSING",
  length: process.env.MAIL_PASS?.length
});

/**
 * Send Verification Email with OTP
 * @param {string} email - Recipient email
 * @param {string} otp - 6-digit verification code
 */
export const sendVerificationEmail = async (email, otp) => {
  const mailOptions = {
    from: process.env.MAIL_USER,
    to: email,
    subject: "Verify Your Email - Swarnim Jewellery",
    text: `Welcome to Swarnim – The Shine of Gold ✨\n\nYour OTP for email verification is: ${otp}\n\nThis code is valid for 10 minutes. Please do not share it with anyone.\n\nThank you for joining Swarnim.`,
    html: `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 40px; color: #1a1a1a; line-height: 1.8; max-width: 600px; margin: auto; border: 1px solid #e5e7eb; border-radius: 24px; background: #ffffff;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #bc9c22; margin: 0; font-size: 28px; font-weight: 800; letter-spacing: -0.02em;">Swarnim</h1>
          <p style="color: #9ca3af; margin: 5px 0 0; font-size: 12px; text-transform: uppercase; font-weight: 700; letter-spacing: 0.1em;">The Shine of Gold ✨</p>
        </div>
        
        <div style="background: #fdfbf7; padding: 30px; border-radius: 20px; text-align: center; border: 1px solid #fef3c7;">
          <p style="margin-top: 0; font-weight: 500;">Thank you for joining Swarnim! To complete your registration, please use the following One-Time Password (OTP):</p>
          
          <div style="margin: 25px 0;">
            <span style="font-size: 42px; font-weight: 800; letter-spacing: 0.2em; color: #bc9c22; font-family: monospace;">${otp}</span>
          </div>

          <p style="margin-bottom: 0; font-size: 14px; color: #6b7280;">This code is <strong>valid for 10 minutes</strong>. Please do not share it with anyone.</p>
        </div>
        
        <p style="margin-top: 30px; font-size: 15px; text-align: center; color: #374151;">Thank you for joining Swarnim.</p>
        
        <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #f3f4f6; text-align: center;">
          <p style="font-size: 12px; color: #9ca3af; margin: 0;">If you didn't request this email, please ignore it.</p>
        </div>
      </div>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    return info;
  } catch (error) {
    console.error("❌ Error sending email:", error);
    if (error.response) {
      console.error("SMTP Response:", error.response);
    }
    console.error("Email Config:", {
      service: process.env.EMAIL_SERVICE,
      user: process.env.MAIL_USER ? "Set ✅" : "Missing ❌",
      pass: process.env.MAIL_PASS ? "Set ✅" : "Missing ❌",
    });
    throw new Error(`Failed to send verification email: ${error.message}`);
  }
};
