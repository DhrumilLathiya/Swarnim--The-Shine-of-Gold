import express from "express";
import { supabase } from "../config/database.js";
import { authenticateToken } from "../middleware/auth.js";
import { validateAndApplyCoupon } from "../services/couponService.js";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Orders
 *   description: Production-grade order management system
 */

/* ==========================================================
   1️⃣ CHECKOUT CART
========================================================== */

/**
 * @swagger
 * /orders/checkout:
 *   post:
 *     summary: Checkout cart and create order
 *     tags: [Orders]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               coupon_code:
 *                 type: string
 *                 example: SAVE10
 *     responses:
 *       200:
 *         description: Order placed successfully
 *       400:
 *         description: Validation error
 *       500:
 *         description: Server error
 */
router.post("/checkout", authenticateToken, async (req, res) => {
  try {
    const user_id = req.user.user_id;
    const { coupon_code } = req.body || {};

    // 1️⃣ Fetch cart items
    const { data: cartItems, error: cartError } = await supabase
      .from("cart_items")
      .select("*")
      .eq("user_id", user_id);

    if (cartError) throw cartError;

    if (!cartItems || cartItems.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Cart is empty"
      });
    }

    let totalAmount = 0;

    // 2️⃣ Validate stock availability
    for (const item of cartItems) {
      const { data: variant, error } = await supabase
        .from("product_variants")
        .select("stock_quantity")
        .eq("id", item.variant_id)
        .single();

      if (error || !variant) {
        return res.status(400).json({
          success: false,
          message: `Variant not found: ${item.variant_id}`
        });
      }

      if (variant.stock_quantity < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for variant ${item.variant_id}`
        });
      }

      totalAmount += item.price_snapshot * item.quantity;
    }

    let discountAmount = 0;
    let finalAmount = totalAmount;
    let appliedCoupon = null;

    // 3️⃣ Apply coupon (if provided)
    if (coupon_code) {
      const result = await validateAndApplyCoupon(
        supabase,
        coupon_code,
        totalAmount
      );

      discountAmount = result.discount;
      appliedCoupon = result.coupon;
      finalAmount = Math.max(totalAmount - discountAmount, 0);
    }

    // 4️⃣ Create order
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert([
        {
          user_id,
          status: "confirmed",
          total_amount: totalAmount,
          discount_amount: discountAmount,
          final_amount: finalAmount,
          coupon_code: coupon_code || null
        }
      ])
      .select()
      .single();

    if (orderError) throw orderError;

    // 5️⃣ Insert order items + decrement stock atomically
    for (const item of cartItems) {
      await supabase.from("order_items").insert([
        {
          order_id: order.id,
          product_id: item.product_id,
          variant_id: item.variant_id,
          quantity: item.quantity,
          price_snapshot: item.price_snapshot
        }
      ]);

      await supabase.rpc("decrement_variant_stock", {
        p_variant_id: item.variant_id,
        p_quantity: item.quantity
      });
    }

    // 6️⃣ Increment coupon usage safely
    if (appliedCoupon) {
      await supabase.rpc("increment_coupon_usage", {
        p_coupon_id: appliedCoupon.id
      });
    }

    // 7️⃣ Clear cart
    await supabase
      .from("cart_items")
      .delete()
      .eq("user_id", user_id);

    return res.status(200).json({
      success: true,
      message: "Order placed successfully",
      data: {
        order_id: order.id,
        total_amount: totalAmount,
        discount_amount: discountAmount,
        final_amount: finalAmount
      }
    });

  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Checkout failed",
      detail: err.message
    });
  }
});

/* ==========================================================
   2️⃣ GET USER ORDERS (Paginated)
========================================================== */

/**
 * @swagger
 * /orders:
 *   get:
 *     summary: Get logged-in user's orders
 *     tags: [Orders]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           example: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           example: 10
 */
router.get("/", authenticateToken, async (req, res) => {
  try {
    const user_id = req.user.user_id;
    const page = parseInt(req.query.page) || 1;
    const limit = Math.min(parseInt(req.query.limit) || 10, 50);

    const from = (page - 1) * limit;
    const to = from + limit - 1;

    const { data, error, count } = await supabase
      .from("orders")
      .select(`
        *,
        order_items (*)
      `, { count: "exact" })
      .eq("user_id", user_id)
      .order("created_at", { ascending: false })
      .range(from, to);

    if (error) throw error;

    return res.status(200).json({
      success: true,
      pagination: {
        page,
        limit,
        total: count,
        totalPages: Math.ceil(count / limit)
      },
      data
    });

  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch orders",
      detail: err.message
    });
  }
});

/* ==========================================================
   3️⃣ CANCEL ORDER
========================================================== */

/**
 * @swagger
 * /orders/{order_id}/cancel:
 *   post:
 *     summary: Cancel order and restore stock
 *     tags: [Orders]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: order_id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 */
router.post("/:order_id/cancel", authenticateToken, async (req, res) => {
  try {
    const { order_id } = req.params;
    const user_id = req.user.user_id;

    const { data: order, error } = await supabase
      .from("orders")
      .select("*")
      .eq("id", order_id)
      .eq("user_id", user_id)
      .single();

    if (error || !order) {
      return res.status(404).json({
        success: false,
        message: "Order not found"
      });
    }

    if (order.status !== "confirmed") {
      return res.status(400).json({
        success: false,
        message: "Only confirmed orders can be cancelled"
      });
    }

    const { data: items } = await supabase
      .from("order_items")
      .select("*")
      .eq("order_id", order_id);

    for (const item of items) {
      await supabase.rpc("restore_variant_stock", {
        p_variant_id: item.variant_id,
        p_quantity: item.quantity
      });
    }

    await supabase
      .from("orders")
      .update({ status: "cancelled" })
      .eq("id", order_id);

    return res.status(200).json({
      success: true,
      message: "Order cancelled successfully"
    });

  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Cancellation failed",
      detail: err.message
    });
  }
});

export default router;