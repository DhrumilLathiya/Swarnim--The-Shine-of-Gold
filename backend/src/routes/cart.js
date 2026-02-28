import express from "express";
import { authenticateToken } from "../middleware/auth.js";
import { supabase } from "../config/database.js";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Cart
 *   description: Variant-based cart system
 */

/* ==========================================================
   1️⃣ ADD / UPDATE CART ITEM
========================================================== */

/**
 * @swagger
 * /cart:
 *   post:
 *     summary: Add variant to cart or increase quantity
 *     tags: [Cart]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           example:
 *             product_id: "PRODUCT_UUID"
 *             variant_id: "VARIANT_UUID"
 *             quantity: 1
 *     responses:
 *       200:
 *         description: Product added/updated
 */
router.post("/", authenticateToken, async (req, res) => {
  res.json({ message: "Cart POST working" });
});


/* ==========================================================
   2️⃣ GET CART
========================================================== */

/**
 * @swagger
 * /cart:
 *   get:
 *     summary: Get current user's cart
 *     tags: [Cart]
 *     security:
 *       - BearerAuth: []
 */
router.get("/", authenticateToken, async (req, res) => {
  res.json({ message: "Cart GET working" });
});


/* ==========================================================
   3️⃣ REMOVE ITEM FROM CART
========================================================== */

/**
 * @swagger
 * /cart/{variant_id}:
 *   delete:
 *     summary: Remove variant from cart
 *     tags: [Cart]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: variant_id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Item removed
 */
router.delete("/:product_id", authenticateToken, async (req, res) => {
  res.json({ message: "Cart DELETE working" });
});

export default router;
