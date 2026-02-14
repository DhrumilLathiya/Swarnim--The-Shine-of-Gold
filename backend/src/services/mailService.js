import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST,
  port: process.env.MAIL_PORT,
  secure: false,
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS
  }
});

export async function sendVerificationEmail(email, token) {
  const verificationLink = `http://localhost:3000/auth/verify-email?token=${token}`;

  await transporter.sendMail({
    from: `"Swarnim Jewellery" <${process.env.MAIL_USER}>`,
    to: email,
    subject: "Verify your email",
    html: `
      <h2>Welcome to Swarnim Jewellery</h2>
      <p>Please verify your email by clicking below:</p>
      <a href="${verificationLink}">${verificationLink}</a>
      <p>This link expires in 24 hours.</p>
    `
  });
}

