import express from "express";
import { authenticateToken } from "../middleware/auth.js";
import { supabase } from "../config/database.js";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Orders
 *   description: Order management
 */

/**
 * ======================================================
 * CHECKOUT CART (Transactional)
 * ======================================================
 */

/**
 * @swagger
 * /orders/checkout:
 *   post:
 *     summary: Checkout cart and create order
 *     tags: [Orders]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Order created successfully
 *       400:
 *         description: Cart empty or stock issue
 *       401:
 *         description: Unauthorized
 */
router.post("/checkout", authenticateToken, async (req, res) => {
  try {
    const user_id = req.user.id;

    const { data, error } = await supabase.rpc(
      "checkout_user_cart",
      { p_user_id: user_id }
    );

    if (error) {
      return res.status(400).json({
        error: error.message
      });
    }

    return res.json({
      message: "Order created successfully",
      order: data
    });

  } catch (error) {
    return res.status(500).json({
      error: "Internal server error",
      detail: error.message
    });
  }
});


/**
 * ======================================================
 * GET USER ORDER HISTORY
 * ======================================================
 */

/**
 * @swagger
 * /orders:
 *   get:
 *     summary: Get order history for logged-in user
 *     tags: [Orders]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: List of user orders
 */
router.get("/", authenticateToken, async (req, res) => {
  try {
    const user_id = req.user.id;

    const { data, error } = await supabase
      .from("orders")
      .select(`
        *,
        order_items(
          id,
          product_id,
          quantity,
          price_snapshot,
          jewellery_products(product_name, image_url)
        )
      `)
      .eq("user_id", user_id)
      .order("created_at", { ascending: false });

    if (error) throw error;

    return res.json(data);

  } catch (error) {
    return res.status(500).json({
      error: "Internal server error",
      detail: error.message
    });
  }
});


/**
 * ======================================================
 * CANCEL ORDER
 * ======================================================
 */

/**
 * @swagger
 * /orders/{order_id}/cancel:
 *   post:
 *     summary: Cancel an order (only if pending)
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
 *         description: Order cancelled successfully
 *       400:
 *         description: Cannot cancel this order
 */
router.post("/:order_id/cancel", authenticateToken, async (req, res) => {
  try {
    const user_id = req.user.id;
    const { order_id } = req.params;

    // 1️⃣ Get order
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select("*")
      .eq("id", order_id)
      .eq("user_id", user_id)
      .single();

    if (orderError || !order) {
      return res.status(404).json({
        error: "Order not found"
      });
    }

    if (order.status !== "pending") {
      return res.status(400).json({
        error: "Only pending orders can be cancelled"
      });
    }

    // 2️⃣ Get order items
    const { data: items, error: itemsError } = await supabase
      .from("order_items")
      .select("*")
      .eq("order_id", order_id);

    if (itemsError) throw itemsError;

    // 3️⃣ Restore stock
    for (const item of items) {
      await supabase.rpc("increment_product_stock", {
        p_product_id: item.product_id,
        p_quantity: item.quantity
      });
    }

    // 4️⃣ Update order status
    await supabase
      .from("orders")
      .update({ status: "cancelled" })
      .eq("id", order_id);

    return res.json({
      message: "Order cancelled successfully"
    });

  } catch (error) {
    return res.status(500).json({
      error: "Internal server error",
      detail: error.message
    });
  }
});

export default router;
