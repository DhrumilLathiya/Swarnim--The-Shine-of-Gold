import express from "express";
import { authenticateToken } from "../middleware/auth.js";
import { supabase } from "../config/database.js";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Cart
 *   description: User cart management
 */

/**
 * @swagger
 * /cart:
 *   post:
 *     summary: Add or update product in cart
 *     tags: [Cart]
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
 *               - quantity
 *             properties:
 *               product_id:
 *                 type: string
 *               quantity:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Product added or updated
 */
router.post("/", authenticateToken, async (req, res) => {
  try {
    const { product_id, quantity } = req.body;
    const user_id = req.user.user_id; // must match your JWT payload

    if (!product_id || !quantity || quantity <= 0) {
      return res.status(400).json({
        error: "Invalid product or quantity"
      });
    }

    // Get product details
    const { data: product, error: productError } = await supabase
      .from("jewellery_products")
      .select("final_price, stock_quantity")
      .eq("id", product_id)
      .single();

    if (productError || !product) {
      return res.status(404).json({
        error: "Product not found"
      });
    }

    if (quantity > product.stock_quantity) {
      return res.status(400).json({
        error: "Not enough stock available"
      });
    }

    // Upsert cart item
    const { error } = await supabase
      .from("cart_items")
      .upsert({
        user_id,
        product_id,
        quantity,
        price_snapshot: product.final_price
      }, { onConflict: "user_id,product_id" });

    if (error) throw error;

    return res.json({
      message: "Product added/updated in cart successfully"
    });

  } catch (error) {
    return res.status(500).json({
      error: "Internal server error",
      detail: error.message
    });
  }
});

/**
 * @swagger
 * /cart:
 *   get:
 *     summary: Get current user cart
 *     tags: [Cart]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Cart items
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
        jewellery_products (
          id,
          product_name,
          image_url,
          final_price
        )
      `)
      .eq("user_id", user_id);

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
 * @swagger
 * /cart/{product_id}:
 *   delete:
 *     summary: Remove item from cart
 *     tags: [Cart]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: product_id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Item removed from cart
 */
router.delete("/:product_id", authenticateToken, async (req, res) => {
  try {
    const { product_id } = req.params;
    const user_id = req.user.user_id;

    console.log("Deleting for user:", user_id);
    console.log("Deleting product:", product_id);

    const { data, error } = await supabase
      .from("cart_items")
      .delete()
      .eq("user_id", user_id)
      .eq("product_id", product_id)
      .select(); // ← VERY IMPORTANT

    if (error) throw error;

    console.log("Deleted rows:", data);

    return res.json({
      message: "Item removed from cart",
      deleted: data
    });

  } catch (error) {
    return res.status(500).json({
      error: "Internal server error",
      detail: error.message
    });
  }
});


export default router;
