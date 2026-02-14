import express from "express";
import { authenticateToken } from "../middleware/auth.js";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Orders
 *   description: Order management
 */

/**
 * @swagger
 * /orders/checkout:
 *   post:
 *     summary: Checkout cart
 *     tags: [Orders]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Order created
 */
router.post("/checkout", authenticateToken, async (req, res) => {
  res.json({ message: "Checkout working" });
});

/**
 * @swagger
 * /orders:
 *   get:
 *     summary: Get order history
 *     tags: [Orders]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Order list
 */
router.get("/", authenticateToken, async (req, res) => {
  res.json({ message: "Order list working" });
});

/**
 * @swagger
 * /orders/{order_id}/cancel:
 *   post:
 *     summary: Cancel order
 *     tags: [Orders]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: order_id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Order cancelled
 */
router.post("/:order_id/cancel", authenticateToken, async (req, res) => {
  res.json({ message: "Cancel working" });
});

export default router;
