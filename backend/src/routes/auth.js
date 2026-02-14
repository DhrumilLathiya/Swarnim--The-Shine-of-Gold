import express from "express";
import crypto from "crypto";
import { supabase } from "../config/database.js";
import { hashPassword, verifyPassword, createAccessToken } from "../utils/auth.js";
import { getUserByEmail, createUser } from "../model/User.js";
import { sendVerificationEmail } from "../services/mailService.js";

const router = express.Router();

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
router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        error: "Validation error",
        detail: "name, email, and password are required",
      });
    }

    const existingUser = await getUserByEmail(email);
    if (existingUser) {
      return res.status(400).json({
        error: "Email already registered",
      });
    }

    const passwordHash = await hashPassword(password);
    const user = await createUser(name, email, passwordHash);

    // 🔐 Generate verification token
    const verificationToken = crypto.randomBytes(32).toString("hex");
    const expires = new Date(Date.now() + 24 * 60 * 60 * 1000);

    await supabase
      .from("users")
      .update({
        email_verification_token: verificationToken,
        email_verification_expires: expires
      })
      .eq("id", user.id);

    // 📧 Send verification email
    await sendVerificationEmail(user.email, verificationToken);

    return res.status(201).json({
      message: "User registered successfully. Please verify your email.",
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
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        error: "Validation error",
        detail: "email and password are required",
      });
    }

    const user = await getUserByEmail(email);
    if (!user) {
      return res.status(401).json({
        error: "Invalid credentials",
      });
    }

    if (!user.is_verified) {
      return res.status(403).json({
        error: "Please verify your email before logging in."
      });
    }

    const isPasswordValid = await verifyPassword(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        error: "Invalid credentials",
      });
    }

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
    console.error("Login error:", error);
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

    return res.json({ message: "Email verified successfully" });

  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

export default router;
