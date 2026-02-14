import express from "express";
import { authenticateToken } from "../middleware/auth.js";
import { supabase } from "../config/database.js";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Cart
 *   description: User cart management
 */

/**
 * @swagger
 * /cart:
 *   post:
 *     summary: Add or update product in cart
 *     tags: [Cart]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - product_id
 *               - quantity
 *             properties:
 *               product_id:
 *                 type: string
 *               quantity:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Product added/updated
 */
router.post("/", authenticateToken, async (req, res) => {
  res.json({ message: "Cart POST working" });
});

/**
 * @swagger
 * /cart:
 *   get:
 *     summary: Get current user cart
 *     tags: [Cart]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Cart items
 */
router.get("/", authenticateToken, async (req, res) => {
  res.json({ message: "Cart GET working" });
});

/**
 * @swagger
 * /cart/{product_id}:
 *   delete:
 *     summary: Remove item from cart
 *     tags: [Cart]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: product_id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Item removed
 */
router.delete("/:product_id", authenticateToken, async (req, res) => {
  res.json({ message: "Cart DELETE working" });
});

export default router;
