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
 *         description: Cart updated
 */
router.post("/", authenticateToken, async (req, res) => {
  try {
    const user_id = req.user.user_id;
    const { product_id, variant_id, quantity } = req.body;

    if (!product_id || !variant_id || !quantity || quantity <= 0) {
      return res.status(400).json({
        error: "product_id, variant_id and valid quantity required"
      });
    }

    // Fetch variant (source of truth for stock)
    const { data: variant, error: variantError } = await supabase
      .from("product_variants")
      .select("id, stock_quantity, additional_price")
      .eq("id", variant_id)
      .eq("is_active", true)
      .single();

    if (variantError || !variant) {
      return res.status(404).json({ error: "Variant not found" });
    }

    if (quantity > variant.stock_quantity) {
      return res.status(400).json({
        error: "Requested quantity exceeds available stock"
      });
    }

    // Check if already exists in cart
    const { data: existingItem } = await supabase
      .from("cart_items")
      .select("*")
      .eq("user_id", user_id)
      .eq("variant_id", variant_id)
      .maybeSingle();

    if (existingItem) {
      const newQuantity = existingItem.quantity + quantity;

      if (newQuantity > variant.stock_quantity) {
        return res.status(400).json({
          error: "Requested quantity exceeds available stock"
        });
      }

      await supabase
        .from("cart_items")
        .update({ quantity: newQuantity })
        .eq("id", existingItem.id);

    } else {
      await supabase
        .from("cart_items")
        .insert([{
          user_id,
          product_id,
          variant_id,
          quantity,
          price_snapshot: variant.additional_price || 0
        }]);
    }

    return res.status(200).json({
      message: "Cart updated successfully"
    });

  } catch (error) {
    return res.status(500).json({
      error: "Internal server error",
      detail: error.message
    });
  }
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
  try {
    const user_id = req.user.user_id;

    const { data, error } = await supabase
      .from("cart_items")
      .select(`
        id,
        quantity,
        price_snapshot,
        product_id,
        variant_id,
        jewellery_products (
          id,
          title,
          image_url
        ),
        product_variants (
          sku,
          metal_type,
          purity,
          size
        )
      `)
      .eq("user_id", user_id);

    if (error) throw error;

    const total_amount = data.reduce(
      (sum, item) => sum + item.quantity * item.price_snapshot,
      0
    );

    return res.status(200).json({
      items: data,
      total_items: data.length,
      total_amount
    });

  } catch (error) {
    return res.status(500).json({
      error: "Internal server error",
      detail: error.message
    });
  }
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
 */
router.delete("/:variant_id", authenticateToken, async (req, res) => {
  try {
    const user_id = req.user.user_id;
    const { variant_id } = req.params;

    const { data, error } = await supabase
      .from("cart_items")
      .delete()
      .eq("user_id", user_id)
      .eq("variant_id", variant_id)
      .select();

    if (error) throw error;

    return res.status(200).json({
      message: "Item removed from cart",
      deleted_item: data
    });

  } catch (error) {
    return res.status(500).json({
      error: "Internal server error",
      detail: error.message
    });
  }
});

export default router;