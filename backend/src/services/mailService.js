import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

/**
 * Configure Nodemailer Transporter
 * Using environment variables for security.
 */
const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE || "gmail", // e.g., 'gmail'
  auth: {
    user: process.env.EMAIL_USER, // Your email address
    pass: process.env.EMAIL_PASS, // Your app password (not login password)
  },
});

/**
 * Send Verification Email
 * @param {string} email - Recipient email
 * @param {string} token - Verification token
 */
export const sendVerificationEmail = async (email, token) => {
  // Construct the verification link
  // Assuming the frontend is running on http://localhost:5173
  // The link should point to the frontend, which then calls the backend API?
  // Or point directly to the backend?
  // Based on the user's request "User Need to Click On Link and Verify Its Email", let's point to a frontend page that handles the verification.
  const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
  const verificationLink = `${frontendUrl}/verify-email?token=${token}`;

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Verify Your Email - Swarnim Jewellery",
    html: `
      <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
        <h2 style="color: #d4af37;">Welcome to Swarnim Jewellery!</h2>
        <p>Thank you for registering. Please verify your email address to continue.</p>
        <div style="margin: 20px 0;">
          <a href="${verificationLink}" style="background-color: #d4af37; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Verify Email</a>
        </div>
        <p>Or copy and paste this link in your browser:</p>
        <p><a href="${verificationLink}">${verificationLink}</a></p>
        <p>This link will expire in 24 hours.</p>
      </div>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`📧 Email sent: ${info.response}`);
    return info;
  } catch (error) {
    console.error("❌ Error sending email:", error);
    if (error.response) {
      console.error("SMTP Response:", error.response);
    }
    console.error("Email Config:", {
      service: process.env.EMAIL_SERVICE,
      user: process.env.EMAIL_USER ? "Set ✅" : "Missing ❌",
      pass: process.env.EMAIL_PASS ? "Set ✅" : "Missing ❌",
    });
    throw new Error(`Failed to send verification email: ${error.message}`);
  }
};
