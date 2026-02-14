import express from "express";
import { authenticateToken } from "../middleware/auth.js";
import { authorizeRoles } from "../middleware/roleMiddleware.js";
import { supabase } from "../config/database.js";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Orders
 *   description: Order management and checkout
 */


/**
 * ======================================================
 * CHECKOUT CART
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
    const user_id = req.user.user_id; // ✅ FIXED

    console.log("Checkout user:", user_id);

    const { data, error } = await supabase.rpc(
      "checkout_user_cart",
      { p_user_id: user_id }
    );

    if (error) {
      console.error("RPC Error:", error.message);
      return res.status(400).json({
        error: "Checkout failed",
        detail: error.message
      });
    }

    if (!data) {
      return res.status(400).json({
        error: "Cart empty or checkout failed"
      });
    }

    return res.status(200).json({
      message: "Order created successfully",
      order: data
    });

  } catch (error) {
    console.error("Checkout Error:", error.message);
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
    const user_id = req.user.user_id; // ✅ FIXED

    const { data, error } = await supabase
      .from("orders")
      .select(`
        id,
        status,
        total_amount,
        created_at,
        order_items(
          id,
          product_id,
          quantity,
          price_snapshot,
          jewellery_products(
            product_name,
            image_url
          )
        )
      `)
      .eq("user_id", user_id)
      .order("created_at", { ascending: false });

    if (error) throw error;

    return res.status(200).json(data);

  } catch (error) {
    console.error("Get Orders Error:", error.message);
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
 *       404:
 *         description: Order not found
 */
router.post("/:order_id/cancel", authenticateToken, async (req, res) => {
  try {
    const user_id = req.user.user_id; // ✅ FIXED
    const { order_id } = req.params;

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

    const { data: items, error: itemsError } = await supabase
      .from("order_items")
      .select("product_id, quantity")
      .eq("order_id", order_id);

    if (itemsError) throw itemsError;

    // Restore stock
    for (const item of items) {
      const { error: stockError } = await supabase.rpc(
        "increment_product_stock",
        {
          p_product_id: item.product_id,
          p_quantity: item.quantity
        }
      );

      if (stockError) throw stockError;
    }

    await supabase
      .from("orders")
      .update({ status: "cancelled" })
      .eq("id", order_id);

    return res.status(200).json({
      message: "Order cancelled successfully"
    });

  } catch (error) {
    console.error("Cancel Order Error:", error.message);
    return res.status(500).json({
      error: "Internal server error",
      detail: error.message
    });
  }
});


/**
 * ======================================================
 * ADMIN — GET ALL ORDERS
 * ======================================================
 */

router.get(
  "/admin/all",
  authenticateToken,
  authorizeRoles("ADMIN"),
  async (req, res) => {
    try {
      const { data, error } = await supabase
        .from("orders")
        .select(`
          *,
          users(name,email)
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;

      return res.status(200).json(data);

    } catch (error) {
      return res.status(500).json({
        error: "Internal server error",
        detail: error.message
      });
    }
  }
);


/**
 * ======================================================
 * ADMIN — UPDATE ORDER STATUS
 * ======================================================
 */

router.put(
  "/admin/:order_id/status",
  authenticateToken,
  authorizeRoles("ADMIN"),
  async (req, res) => {
    try {
      const { order_id } = req.params;
      const { status } = req.body;

      const allowedStatuses = [
        "pending",
        "paid",
        "shipped",
        "delivered",
        "cancelled"
      ];

      if (!allowedStatuses.includes(status)) {
        return res.status(400).json({
          error: "Invalid status"
        });
      }

      const { error } = await supabase
        .from("orders")
        .update({ status })
        .eq("id", order_id);

      if (error) throw error;

      return res.status(200).json({
        message: "Order status updated"
      });

    } catch (error) {
      return res.status(500).json({
        error: "Internal server error",
        detail: error.message
      });
    }
  }
);

export default router;
