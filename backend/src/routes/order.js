/**
 * ORDER MANAGEMENT ROUTES
 * 
 * PURPOSE: Handles checkout processing, order history retrieval, and order cancellation.
 * USAGE: Central to the e-commerce transaction flow and customer account history.
 */
import express from "express";
import { supabase } from "../config/database.js"; // Connection for order and transaction tables
import { authenticateToken } from "../middleware/auth.js"; // Restricts access to authenticated users

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Orders
 *   description: Order management
 */

/* ==========================================================
   1️⃣ CHECKOUT — Create Order from Cart
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
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - shipping_address_id
 *             properties:
 *               shipping_address_id:
 *                 type: string
 *               coupon_code:
 *                 type: string
 *     responses:
 *       200:
 *         description: Order created successfully
 */
// CHECKOUT: Converts the user's active cart into a confirmed order with pricing snapshots
router.post("/checkout", authenticateToken, async (req, res) => {
  try {
    const user_id = req.user.user_id;
    const { shipping_address_id, coupon_code } = req.body;

    // 1. ADDRESS VALIDATION: Ensure a valid shipping destination is selected
    if (!shipping_address_id) {
      return res.status(400).json({ success: false, message: "Shipping address is required" });
    }

    const { data: address, error: addrErr } = await supabase
      .from("addresses")
      .select("*")
      .eq("id", shipping_address_id)
      .eq("user_id", user_id)
      .single();

    if (addrErr || !address) {
      return res.status(400).json({ success: false, message: "Invalid shipping address" });
    }

    // 2. CART RETRIEVAL: Fetch all items currently in the user's shopping cart
    const { data: cartItems, error: cartErr } = await supabase
      .from("cart_items")
      .select("*")
      .eq("user_id", user_id);

    if (cartErr || !cartItems || cartItems.length === 0) {
      return res.status(400).json({ success: false, message: "Your cart is empty" });
    }

    // 3. PRODUCT ENRICHMENT: Fetch base detail for every product in the cart
    const productIds = cartItems.map(item => item.product_id);
    const { data: products, error: prodErr } = await supabase
      .from("jewellery_products")
      .select("id, title, category, image_url")
      .in("id", productIds);

    if (prodErr || !products) {
      throw new Error(`Failed to fetch product details: ${prodErr?.message}`);
    }

    // Merge product titles/images for receipt generation
    const productMap = products.reduce((acc, p) => ({ ...acc, [p.id]: p }), {});
    
    // 4. SUBTOTAL CALCULATION: Sum up the individual item costs from snapshots
    const subtotal = cartItems.reduce((sum, item) => sum + (item.price_snapshot * item.quantity), 0);

    // 5. COUPON LOGIC: Validate promotional codes and calculate discount amount
    let discount_amount = 0;
    let applied_coupon_code = null;

    if (coupon_code) {
      const { data: coupon, error: couponErr } = await supabase
        .from("coupons")
        .select("*")
        .eq("code", coupon_code.toUpperCase())
        .eq("is_active", true)
        .single();

      if (!couponErr && coupon) {
        const now = new Date();
        const expiry = new Date(coupon.expiry_date);
        // Verify code is not expired and meets minimum order requirements
        if (expiry >= now && subtotal >= (coupon.min_order_amount || 0)) {
          discount_amount = (subtotal * coupon.discount_percent) / 100;
          applied_coupon_code = coupon.code;
        }
      }
    }

    const total_amount = subtotal - discount_amount;

    // 6. ORDER CREATION: Insert the primary order record into the database
    const payload = {
      user_id,
      shipping_address_id,
      total_amount: subtotal,
      discount_amount,
      final_amount: total_amount,
      coupon_code: applied_coupon_code,
      status: "pending"
    };

    const { data: order, error: orderErr } = await supabase
      .from("orders")
      .insert([payload])
      .select()
      .single();

    if (orderErr) throw orderErr;

    // 7. LINE ITEM CREATION: Record each individual product purchased in the order_items table
    const orderItems = cartItems.map(item => ({
      order_id: order.id,
      product_id: item.product_id,
      quantity: item.quantity,
      price_snapshot: item.price_snapshot,
      variant_id: item.variant_id || null
    }));

    const { error: itemsErr } = await supabase
      .from("order_items")
      .insert(orderItems);

    if (itemsErr) throw itemsErr;

    // 8. CART CLEANUP: Clear the shopping cart upon successful order placement
    await supabase
      .from("cart_items")
      .delete()
      .eq("user_id", user_id);

    return res.status(200).json({
      success: true,
      message: "Order placed successfully!",
      order: {
        id: order.id,
        total_amount: subtotal,
        discount_amount,
        final_amount: total_amount,
        coupon_code: applied_coupon_code,
        status: order.status,
        created_at: order.created_at,
        shipping_address: address
      }
    });

  } catch (err) {
    console.error("Checkout failed:", err);
    return res.status(500).json({
      success: false,
      message: "Checkout failed. Please try again.",
      detail: err.message
    });
  }
});

/* ==========================================================
   2️⃣ GET ORDER HISTORY
========================================================== */

/**
 * @swagger
 * /orders:
 *   get:
 *     summary: Get user's order history
 *     tags: [Orders]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Order list with items
 */
router.get("/", authenticateToken, async (req, res) => {
  try {
    const user_id = req.user.user_id;

    // Fetch all orders for the user
    const { data: orders, error: ordersErr } = await supabase
      .from("orders")
      .select("*")
      .eq("user_id", user_id)
      .order("created_at", { ascending: false });

    if (ordersErr) throw ordersErr;

    if (!orders || orders.length === 0) {
      return res.status(200).json({ success: true, data: [] });
    }

    // 2. Fetch all order items and products for these orders in a more robust way
    const orderIds = orders.map(o => o.id);
    const { data: allItems, error: itemsErr } = await supabase
      .from("order_items")
      .select("*")
      .in("order_id", orderIds);

    if (itemsErr) throw itemsErr;

    // Fetch product details for all unique products in these orders
    const productIds = [...new Set((allItems || []).map(item => item.product_id))];
    const { data: allProducts, error: prodErr } = await supabase
      .from("jewellery_products")
      .select("id, title, category, image_url")
      .in("id", productIds);

    if (prodErr) throw prodErr;

    // Build lookup map for products
    const productMap = (allProducts || []).reduce((acc, p) => ({ ...acc, [p.id]: p }), {});

    // Fetch addresses for these orders
    const addressIds = [...new Set(orders.map(o => o.shipping_address_id).filter(id => id))];
    const { data: allAddresses } = await supabase
      .from("addresses")
      .select("*")
      .in("id", addressIds);
    
    const addressMap = (allAddresses || []).reduce((acc, a) => ({ ...acc, [a.id]: a }), {});

    // Merge everything
    const enrichedOrders = orders.map(order => {
      const orderItems = (allItems || [])
        .filter(item => item.order_id === order.id)
        .map(item => ({
          ...item,
          jewellery_products: productMap[item.product_id]
        }));

      return {
        ...order,
        items: orderItems,
        shipping_address: addressMap[order.shipping_address_id] || null
      };
    });

    return res.status(200).json({
      success: true,
      data: enrichedOrders
    });

  } catch (err) {
    console.error("Fetch orders failed:", err);
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
 *     summary: Cancel a confirmed order
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
  try {
    const user_id = req.user.user_id;
    const { order_id } = req.params;

    // Verify order belongs to user and is cancellable
    const { data: order, error: findErr } = await supabase
      .from("orders")
      .select("*")
      .eq("id", order_id)
      .eq("user_id", user_id)
      .single();

    if (findErr || !order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    if (order.status !== "confirmed" && order.status !== "pending") {
      return res.status(400).json({
        success: false,
        message: `Cannot cancel an order with status: ${order.status}`
      });
    }

    // Update status to cancelled
    const { error: updateErr } = await supabase
      .from("orders")
      .update({ status: "cancelled" })
      .eq("id", order_id);

    if (updateErr) throw updateErr;

    return res.status(200).json({
      success: true,
      message: "Order cancelled successfully"
    });

  } catch (err) {
    console.error("Cancel order failed:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to cancel order",
      detail: err.message
    });
  }
});

export default router;