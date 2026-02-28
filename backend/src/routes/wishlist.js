import express from "express";
import { supabase } from "../config/database.js";
import { authenticateToken } from "../middleware/auth.js";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Wishlist
 *   description: Production-level wishlist management
 */

/**
 * @swagger
 * /wishlist:
 *   post:
 *     summary: Add product to wishlist
 *     tags: [Wishlist]
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
 *             properties:
 *               product_id:
 *                 type: string
 *                 format: uuid
 *     responses:
 *       201:
 *         description: Product added to wishlist
 */
router.post("/", authenticateToken, async (req, res) => {
  try {
    const user_id = req.user.user_id;
    const { product_id } = req.body;

    if (!product_id) {
      return res.status(400).json({ error: "Product ID is required" });
    }

    // Validate product exists
    const { data: product } = await supabase
      .from("jewellery_products")
      .select("id")
      .eq("id", product_id)
      .single();

    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    const { error } = await supabase
      .from("wishlists")
      .insert([{ user_id, product_id }]);

    if (error) {
      if (error.code === "23505") {
        return res.status(400).json({ error: "Product already in wishlist" });
      }
      return res.status(400).json({ error: error.message });
    }

    return res.status(201).json({
      message: "Product added to wishlist"
    });

  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

/**
 * @swagger
 * /wishlist:
 *   get:
 *     summary: Get current user's wishlist
 *     tags: [Wishlist]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Wishlist items
 */
router.get("/", authenticateToken, async (req, res) => {
  try {
    const user_id = req.user.user_id;

    const { data, error } = await supabase
      .from("wishlists")
      .select(`
        id,
        created_at,
        jewellery_products (
          id,
          product_name,
          final_price,
          stock_quantity
        )
      `)
      .eq("user_id", user_id);

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    return res.status(200).json(data);

  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

/**
 * @swagger
 * /wishlist/{product_id}:
 *   delete:
 *     summary: Remove product from wishlist
 *     tags: [Wishlist]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: product_id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Product removed
 */
router.delete("/:product_id", authenticateToken, async (req, res) => {
  try {
    const user_id = req.user.user_id;
    const { product_id } = req.params;

    const { error } = await supabase
      .from("wishlists")
      .delete()
      .eq("user_id", user_id)
      .eq("product_id", product_id);

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    return res.status(200).json({
      message: "Product removed from wishlist"
    });

  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

/**
 * @swagger
 * /wishlist/{product_id}/move-to-cart:
 *   post:
 *     summary: Move wishlist item to cart
 *     tags: [Wishlist]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: product_id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Product moved to cart
 */
router.post("/:product_id/move-to-cart", authenticateToken, async (req, res) => {
  try {
    const user_id = req.user.user_id;
    const { product_id } = req.params;

    // Fetch product
    const { data: product, error: productError } = await supabase
      .from("jewellery_products")
      .select("id, final_price, stock_quantity")
      .eq("id", product_id)
      .single();

    if (productError || !product) {
      return res.status(404).json({ error: "Product not found" });
    }

    if (product.stock_quantity <= 0) {
      return res.status(400).json({ error: "Product out of stock" });
    }

    // Check if already in cart
    const { data: existingCartItem } = await supabase
      .from("cart_items")
      .select("*")
      .eq("user_id", user_id)
      .eq("product_id", product_id)
      .single();

    if (existingCartItem) {
      const newQty = existingCartItem.quantity + 1;

      if (newQty > product.stock_quantity) {
        return res.status(400).json({ error: "Stock exceeded" });
      }

      const { error: updateError } = await supabase
        .from("cart_items")
        .update({ quantity: newQty })
        .eq("user_id", user_id)
        .eq("product_id", product_id);

      if (updateError) {
        return res.status(400).json({ error: updateError.message });
      }
    } else {
      const { error: insertError } = await supabase
        .from("cart_items")
        .insert([{
          user_id,
          product_id,
          quantity: 1,
          price_snapshot: product.final_price
        }]);

      if (insertError) {
        return res.status(400).json({ error: insertError.message });
      }
    }

    // Remove from wishlist
    await supabase
      .from("wishlists")
      .delete()
      .eq("user_id", user_id)
      .eq("product_id", product_id);

    return res.status(200).json({
      message: "Product moved to cart successfully"
    });

  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

export default router;