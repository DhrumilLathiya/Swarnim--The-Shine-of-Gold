/**
 * WISHLIST MANAGEMENT ROUTES
 * 
 * PURPOSE: Allows users to save favorite products for future viewing and purchase.
 * USAGE: Targeted by product cards and the member's private wishlist page.
 */
import express from "express";
import { supabase } from "../config/database.js"; // Connection for wishlist table operations
import { authenticateToken } from "../middleware/auth.js"; // Ensures user is authenticated

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
// ADD TO WISHLIST: Records a product-user association in the wishlist table
router.post("/", authenticateToken, async (req, res) => {
  try {
    const user_id = req.user.user_id;
    const { product_id } = req.body;

    // VALIDATION: Ensure a specific jewelry item is targeted
    if (!product_id) {
      return res.status(400).json({ error: "Product ID is required" });
    }

    // INTEGRITY CHECK: Verify the product actually exists in the catalog
    const { data: product } = await supabase
      .from("jewellery_products")
      .select("id")
      .eq("id", product_id)
      .single();

    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    // INSERTION: Add the product to the user's favorites list
    const { error } = await supabase
      .from("wishlists")
      .insert([{ user_id, product_id }]);

    if (error) {
      // HANDLE DUPLICATES: Check for unique constraint violation (product already wishlisted)
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

    // 1. Fetch user's wishlist items
    const { data: wishlistItems, error: wishlistError } = await supabase
      .from("wishlists")
      .select("id, product_id, created_at")
      .eq("user_id", user_id);

    if (wishlistError) {
      console.error("DEBUG: Wishlist Fetch Error:", wishlistError);
      return res.status(400).json({ error: wishlistError.message });
    }

    if (!wishlistItems || wishlistItems.length === 0) {
      return res.status(200).json([]);
    }

    // 2. Extract product IDs
    const productIds = wishlistItems.map(item => item.product_id);

    // 3. Fetch all corresponding products and their variants
    const { data: products, error: productError } = await supabase
      .from("jewellery_products")
      .select(`
        id,
        title,
        category,
        image_url,
        product_variants (
          additional_price,
          stock_quantity
        )
      `)
      .in("id", productIds);

    if (productError) {
      console.error("DEBUG: Product Fetch Error:", productError);
      return res.status(400).json({ error: productError.message });
    }

    // 4. Create a map of products for quick lookup
    const productMap = products.reduce((acc, p) => {
      acc[p.id] = p;
      return acc;
    }, {});

    // 5. Stitch the data together for the frontend
    const formattedData = wishlistItems.map(item => {
      const product = productMap[item.product_id];
      if (!product) return null; // Defensive check

      const primaryVariant = product.product_variants?.[0] || {};

      return {
        id: item.id,
        created_at: item.created_at,
        jewellery_products: {
          id: product.id,
          product_name: product.title,
          category: product.category,
          image_url: product.image_url,
          final_price: primaryVariant.additional_price || 0,
          stock_quantity: primaryVariant.stock_quantity || 0,
          availability: (primaryVariant.stock_quantity > 0) ? "in_stock" : "out_of_stock"
        }
      };
    }).filter(Boolean);

    return res.status(200).json(formattedData);

  } catch (err) {
    console.error("DEBUG: Wishlist GET Exception:", err);
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

    // Fetch product and its first variant
    const { data: product, error: productError } = await supabase
      .from("jewellery_products")
      .select(`
        id,
        product_variants (
          additional_price,
          stock_quantity
        )
      `)
      .eq("id", product_id)
      .single();

    if (productError || !product) {
      return res.status(404).json({ error: "Product not found" });
    }

    const primaryVariant = product.product_variants?.[0];
    if (!primaryVariant) {
      return res.status(400).json({ error: "Product has no variants" });
    }

    if (primaryVariant.stock_quantity <= 0) {
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

      if (newQty > primaryVariant.stock_quantity) {
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
          price_snapshot: primaryVariant.additional_price
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