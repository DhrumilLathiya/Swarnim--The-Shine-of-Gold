/**
 * AUTHENTICATION ROUTES
 * 
 * PURPOSE: Handles user registration, identity verification via OTP, and secure login.
 * USAGE: Defines the /auth endpoints used by the frontend for all user access control.
 */
import express from "express";
import crypto from "crypto";
<<<<<<< dhrumil
import { supabase } from "../config/database.js"; // Connection for direct user table updates
import { hashPassword, verifyPassword, createAccessToken } from "../utils/auth.js"; // Auth utility helpers
import { getUserByEmail, createUser, deleteUser } from "../model/User.js"; // User data model abstractions
import { sendVerificationEmail } from "../services/mailService.js"; // Service for triggered OTP emails
=======
import { supabase } from "../config/database.js";
import { hashPassword, verifyPassword, createAccessToken } from "../utils/auth.js";
import { getUserByEmail, createUser, deleteUser } from "../model/User.js";
import { sendVerificationEmail } from "../services/mailService.js";
>>>>>>> main

const router = express.Router();

/**
 * @swagger
 * /auth/verify-otp:
 *   post:
 *     summary: Verify email using 6-digit OTP
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - otp
 *             properties:
 *               email:
 *                 type: string
 *               otp:
 *                 type: string
 *     responses:
 *       200:
 *         description: Email verified successfully
 *       400:
 *         description: Invalid or expired OTP
 */
// VERIFY OTP: Validates the 6-digit code sent to the user's email
router.post("/verify-otp", async (req, res) => {
  try {
    const { email, otp } = req.body;

    // VALIDATION: Ensure both email and OTP are provided
    if (!email || !otp) {
      return res.status(400).json({ error: "Email and OTP are required" });
    }

    // DATABASE QUERY: Find non-verified user with matching email and OTP token
    const { data: user, error } = await supabase
      .from("users")
      .select("*")
      .eq("email", email)
      .eq("email_verification_token", otp) // Reusing column for OTP storage
      .maybeSingle();

    if (error || !user) {
      return res.status(400).json({ error: "Invalid OTP or Email" });
    }

    // EXPIRY CHECK: Ensure the OTP is still within its valid timeframe
    if (new Date(user.email_verification_expires) < new Date()) {
      return res.status(400).json({ error: "OTP has expired" });
    }

    // UPDATE STATUS: Mark user as verified and clear the temporary token
    await supabase
      .from("users")
      .update({
        is_verified: true,
        email_verification_token: null,
        email_verification_expires: null
      })
      .eq("id", user.id);

    return res.json({ message: "Email verified successfully. You can now login." });

  } catch (error) {
    console.error("OTP Verification Error:", error);
    return res.status(500).json({ error: "Internal server error", detail: error.message });
  }
});

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Authentication and email verification
 */

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Register a new user and send verification email
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *             properties:
 *               name:
 *                 type: string
 *                 example: Raj Mehta
 *               email:
 *                 type: string
 *                 example: raj@example.com
 *               password:
 *                 type: string
 *                 example: StrongPassword123
 *     responses:
 *       201:
 *         description: User registered successfully
 *       400:
 *         description: Validation error or email already exists
 */
// REGISTER: Creates a new user account and initiates email verification
router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // INPUT VALIDATION: Ensure all required registration fields are present
    if (!name || !email || !password) {
      return res.status(400).json({
        error: "Validation error",
        detail: "name, email, and password are required",
      });
    }

    // DUPLICATE CHECK: Verify the email isn't already in use
    const existingUser = await getUserByEmail(email);
    if (existingUser) {
      return res.status(400).json({
        error: "Email already registered",
      });
    }

    // SECURITY: Hash password before saving to the database
    const passwordHash = await hashPassword(password);
    const user = await createUser(name, email, passwordHash);

    // OTP GENERATION: Create a random 6-digit verification code
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expires = new Date(Date.now() + 10 * 60 * 1000); // Code valid for 10 minutes

    // PERSIST OTP: Save the code and expiry to the user's record
    const { error: updateError } = await supabase
      .from("users")
      .update({
        email_verification_token: otp,
        email_verification_expires: expires,
        is_verified: false 
      })
      .eq("id", user.id);

    if (updateError) {
      console.error("Error updating user with verification token:", updateError);
    }

    // DEV BYPASS: If configured, skip the email step for faster local testing
    if (process.env.SKIP_EMAIL_VERIFICATION === 'true') {
      console.log("⚠️ SKIP_EMAIL_VERIFICATION is enabled. Automatically verifying user.");
      await supabase
        .from("users")
        .update({ is_verified: true, email_verification_token: null, email_verification_expires: null })
        .eq("id", user.id);
        
      const token = createAccessToken({
        user_id: user.id,
        email: user.email,
        role: user.role,
      });

      return res.status(201).json({
        message: "User registered successfully (Auto-verified & Logged In).",
        access_token: token,
        token_type: "bearer",
        user: { 
          id: user.id, 
          name: user.name, 
          email: user.email,
          role: user.role
        },
      });
    }

    // NOTIFICATION: Send the OTP via email using the mail service
    try {
      await sendVerificationEmail(user.email, otp);
    } catch (emailError) {
      console.error("Failed to send verification email:", emailError);
      await deleteUser(user.id); // Rollback user creation if email fails
      return res.status(500).json({
        error: "Failed to send verification email. Please try again.",
        detail: emailError.message
      });
    }

    return res.status(201).json({
      message: "User registered successfully. Please verify your email with the OTP sent.",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    });

  } catch (error) {
    console.error("Registration error:", error);
    return res.status(500).json({
      error: "Internal server error",
      detail: error.message,
    });
  }
});

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Login user and return JWT token (Only verified users)
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 example: raj@example.com
 *               password:
 *                 type: string
 *                 example: StrongPassword123
 *     responses:
 *       200:
 *         description: Login successful
 *       401:
 *         description: Invalid credentials
 *       403:
 *         description: Email not verified
 */
// LOGIN: Validates credentials and returns a JWT access token
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // VALIDATION: Require both email and password for login
    if (!email || !password) {
      return res.status(400).json({
        error: "Validation error",
        detail: "email and password are required",
      });
    }

    // LOOKUP: Retrieve user data from the database by email
    const user = await getUserByEmail(email);
    if (!user) {
      console.log("❌ Login: No user found for email:", email);
      return res.status(401).json({
        error: "Invalid credentials",
      });
    }

    // VERIFICATION CHECK: Only allow verified users to log in
    if (user.is_verified === false) {
      console.log("❌ Login: User not verified:", email);
      return res.status(403).json({
        error: "Please verify your email before logging in."
      });
    }

    // CRYPTO: Compare provided password with the stored hash
    const isPasswordValid = await verifyPassword(password, user.password);
    if (!isPasswordValid) {
      console.log("❌ Login: Wrong password for:", email);
      return res.status(401).json({
        error: "Invalid credentials",
      });
    }

    // ACCESS TOKEN: Generate JWT containing user ID, email, and role
    const token = createAccessToken({
      user_id: user.id,
      email: user.email,
      role: user.role,
    });

    return res.json({
      access_token: token,
      token_type: "bearer",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });

  } catch (error) {
    console.error("Login error:", error.message);
    return res.status(500).json({
      error: "Internal server error",
      detail: error.message,
    });
  }
});

/**
 * @swagger
 * /auth/resend-verification:
 *   post:
 *     summary: Resend verification email
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *     responses:
 *       200:
 *         description: Verification email sent
 *       400:
 *         description: User already verified or invalid email
 *       404:
 *         description: User not found
 */
router.post("/resend-verification", async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }

    const user = await getUserByEmail(email);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    if (user.is_verified) {
      return res.status(400).json({ error: "Account already verified" });
    }

    // Generate new 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    const { error: updateError } = await supabase
      .from("users")
      .update({
        email_verification_token: otp,
        email_verification_expires: expires,
      })
      .eq("id", user.id);

    if (updateError) {
      throw new Error(`Failed to update verification token: ${updateError.message}`);
    }

    // 📧 Send verification email with OTP (Bypass if requested for Dev)
    if (process.env.SKIP_EMAIL_VERIFICATION === 'true') {
      console.log("⚠️ SKIP_EMAIL_VERIFICATION is enabled. Automatically verifying user via resend.");
      await supabase
        .from("users")
        .update({ is_verified: true, email_verification_token: null, email_verification_expires: null })
        .eq("id", user.id);
        
      return res.json({ message: "Account automatically verified (Development Bypass)." });
    }

    await sendVerificationEmail(user.email, otp);

    return res.json({ message: "Verification OTP sent successfully." });

  } catch (error) {
    console.error("Resend verification error:", error);
    return res.status(500).json({
      error: "Internal server error",
      detail: error.message,
    });
  }
});

/**
 * @swagger
 * /auth/verify-email:
 *   get:
 *     summary: Verify email using token
 *     tags: [Auth]
 *     parameters:
 *       - in: query
 *         name: token
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Email verified successfully
 *       400:
 *         description: Invalid or expired token
 */
router.get("/verify-email", async (req, res) => {
  try {
    const { token } = req.query;

    if (!token) {
      return res.status(400).json({ error: "Invalid token" });
    }

    const { data: user, error } = await supabase
      .from("users")
      .select("*")
      .eq("email_verification_token", token)
      .single();

    if (error || !user) {
      return res.status(400).json({ error: "Invalid or expired token" });
    }

    if (new Date(user.email_verification_expires) < new Date()) {
      return res.status(400).json({ error: "Token expired" });
    }

    await supabase
      .from("users")
      .update({
        is_verified: true,
        email_verification_token: null,
        email_verification_expires: null
      })
      .eq("id", user.id);

    return res.json({ message: "Email verified successfully. You can now login." });

  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /auth/verify-otp:
 *   post:
 *     summary: Verify email using 6-digit OTP
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - otp
 *             properties:
 *               email:
 *                 type: string
 *               otp:
 *                 type: string
 *     responses:
 *       200:
 *         description: Email verified successfully
 *       400:
 *         description: Invalid or expired OTP
 */
router.post("/verify-otp", async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ error: "Email and OTP are required" });
    }

    const { data: user, error } = await supabase
      .from("users")
      .select("*")
      .eq("email", email)
      .eq("email_verification_token", otp)
      .single();

    if (error || !user) {
      return res.status(400).json({ error: "Invalid OTP or email" });
    }

    if (new Date(user.email_verification_expires) < new Date()) {
      return res.status(400).json({ error: "OTP has expired" });
    }

    await supabase
      .from("users")
      .update({
        is_verified: true,
        email_verification_token: null,
        email_verification_expires: null
      })
      .eq("id", user.id);

    return res.json({ message: "Email verified successfully. You can now login." });

  } catch (error) {
    console.error("Verify OTP error:", error);
    return res.status(500).json({ error: "Internal server error", detail: error.message });
  }
});

export default router;
