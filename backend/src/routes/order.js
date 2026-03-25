import express from "express";
import { supabase } from "../config/database.js";
import { authenticateToken } from "../middleware/auth.js";

const router = express.Router();

/* ================= CHECKOUT ================= */

router.post("/checkout", authenticateToken, async (req, res) => {
  try {
    const user_id = req.user.user_id;
    const { shipping_address_id, coupon_code } = req.body;

    if (!shipping_address_id) {
      return res.status(400).json({ success: false, message: "Shipping address is required" });
    }

    const { data: address } = await supabase
      .from("addresses")
      .select("*")
      .eq("id", shipping_address_id)
      .eq("user_id", user_id)
      .single();

    if (!address) {
      return res.status(400).json({ success: false, message: "Invalid address" });
    }

    const { data: cartItems } = await supabase
      .from("cart_items")
      .select("*")
      .eq("user_id", user_id);

    if (!cartItems || cartItems.length === 0) {
      return res.status(400).json({ success: false, message: "Cart empty" });
    }

    const subtotal = cartItems.reduce(
      (sum, item) => sum + item.price_snapshot * item.quantity,
      0
    );

    let discount_amount = 0;

    if (coupon_code) {
      const { data: coupon } = await supabase
        .from("coupons")
        .select("*")
        .eq("code", coupon_code.toUpperCase())
        .eq("is_active", true)
        .maybeSingle();

      if (coupon && subtotal >= (coupon.min_order_amount || 0)) {
        discount_amount = (subtotal * coupon.discount_percent) / 100;
      }
    }

    const total = subtotal - discount_amount;

    const { data: order } = await supabase
      .from("orders")
      .insert([{
        user_id,
        shipping_address_id,
        total_amount: subtotal,
        discount_amount,
        final_amount: total,
        status: "pending"
      }])
      .select()
      .single();

    await supabase.from("cart_items").delete().eq("user_id", user_id);

    res.json({ success: true, order });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ================= GET ORDERS ================= */

router.get("/", authenticateToken, async (req, res) => {
  try {
    const { data } = await supabase
      .from("orders")
      .select("*")
      .eq("user_id", req.user.user_id);

    res.json({ success: true, data });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ================= CANCEL ORDER ================= */

router.post("/:order_id/cancel", authenticateToken, async (req, res) => {
  try {
    const { order_id } = req.params;

    await supabase
      .from("orders")
      .update({ status: "cancelled" })
      .eq("id", order_id);

    res.json({ success: true });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;