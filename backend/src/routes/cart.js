import express from "express";
import { authenticateToken } from "../middleware/auth.js";
import { supabase } from "../config/database.js";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Cart
 *   description: Production-level user cart management
 */

/**
 * @swagger
 * /cart:
 *   post:
 *     summary: Add product to cart or increase quantity
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
 *                 format: uuid
 *               quantity:
 *                 type: integer
 *                 minimum: 1
 *     responses:
 *       200:
 *         description: Cart updated successfully
 */
router.post("/", authenticateToken, async (req, res) => {
  try {
    const user_id = req.user.user_id;
    const { product_id, quantity } = req.body;

    if (!product_id || !quantity || quantity <= 0) {
      return res.status(400).json({
        error: "Invalid product or quantity"
      });
    }

    // 1️⃣ Fetch product
    const { data: product, error: productError } = await supabase
      .from("jewellery_products")
      .select("id, final_price, stock_quantity")
      .eq("id", product_id)
      .single();

    if (productError || !product) {
      return res.status(404).json({ error: "Product not found" });
    }

    // 2️⃣ Check existing cart item
    const { data: existingItem } = await supabase
      .from("cart_items")
      .select("*")
      .eq("user_id", user_id)
      .eq("product_id", product_id)
      .single();

    if (existingItem) {
      const newQuantity = existingItem.quantity + quantity;

      if (newQuantity > product.stock_quantity) {
        return res.status(400).json({
          error: "Requested quantity exceeds stock"
        });
      }

      const { error: updateError } = await supabase
        .from("cart_items")
        .update({ quantity: newQuantity })
        .eq("user_id", user_id)
        .eq("product_id", product_id);

      if (updateError) throw updateError;

    } else {
      if (quantity > product.stock_quantity) {
        return res.status(400).json({
          error: "Requested quantity exceeds stock"
        });
      }

      const { error: insertError } = await supabase
        .from("cart_items")
        .insert([{
          user_id,
          product_id,
          quantity,
          price_snapshot: product.final_price
        }]);

      if (insertError) throw insertError;
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

/**
 * @swagger
 * /cart:
 *   get:
 *     summary: Get current user cart with totals
 *     tags: [Cart]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Cart items with total
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
          final_price,
          stock_quantity
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
 *           format: uuid
 *     responses:
 *       200:
 *         description: Item removed from cart
 */
router.delete("/:product_id", authenticateToken, async (req, res) => {
  try {
    const user_id = req.user.user_id;
    const { product_id } = req.params;

    const { data, error } = await supabase
      .from("cart_items")
      .delete()
      .eq("user_id", user_id)
      .eq("product_id", product_id)
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