/**
 * SHOPPING CART ROUTES
 * 
 * PURPOSE: Manages the user's active shopping cart, including adding items, updating quantities, and removals.
 * USAGE: Targeted by the frontend cart drawer and checkout preparation logic.
 */
import express from "express";
import { authenticateToken } from "../middleware/auth.js"; // Ensures user is logged in
import { supabase } from "../config/database.js"; // Connection for cart table operations

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Cart
<<<<<<< dhrumil
 *   description: User-level cart management
=======
 *   description: Variant-based cart system
>>>>>>> main
 */

/* ==========================================================
   1️⃣ ADD / UPDATE CART ITEM
========================================================== */

/**
 * @swagger
 * /cart:
 *   post:
<<<<<<< dhrumil
 *     summary: Add product to cart or increase quantity
=======
 *     summary: Add variant to cart or increase quantity
>>>>>>> main
 *     tags: [Cart]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
<<<<<<< dhrumil
 *           schema:
 *             type: object
 *             required:
 *               - product_id
 *             properties:
 *               product_id:
 *                 type: string
 *               quantity:
 *                 type: integer
=======
 *           example:
 *             product_id: "PRODUCT_UUID"
 *             variant_id: "VARIANT_UUID"
 *             quantity: 1
 *     responses:
 *       200:
 *         description: Product added/updated
>>>>>>> main
 */
// ADD TO CART: Inserts a new item or increments the quantity of an existing one
router.post("/", authenticateToken, async (req, res) => {
  try {
    const user_id = req.user.user_id;
    const { product_id, quantity = 1 } = req.body;

    // VALIDATION: Ensure a specific product is targeted
    if (!product_id) return res.status(400).json({ error: "product_id is required" });

    // PRICE SNAPSHOT: Fetch the current price and stock from the product's primary variant
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

    // MERGE LOGIC: Check if the product is already in the user's cart
    const { data: existingItem } = await supabase
      .from("cart_items")
      .select("*")
      .eq("user_id", user_id)
      .eq("product_id", product_id)
      .single();

    if (existingItem) {
      // INCREMENT: Update quantity if it doesn't exceed available stock
      const newQty = existingItem.quantity + quantity;
      
      if (newQty > (primaryVariant.stock_quantity || 999)) {
        return res.status(400).json({ error: "Requested quantity exceeds available stock" });
      }

      const { error: updateError } = await supabase
        .from("cart_items")
        .update({ quantity: newQty })
        .eq("id", existingItem.id);

      if (updateError) throw updateError;
      return res.json({ message: "Cart updated", item_id: existingItem.id });
    } else {
      // NEW ENTRY: Insert the item with a snapshot of the current price
      if (quantity > (primaryVariant.stock_quantity || 999)) {
        return res.status(400).json({ error: "Requested quantity exceeds available stock" });
      }

      const { data: newItem, error: insertError } = await supabase
        .from("cart_items")
        .insert([{
          user_id,
          product_id,
          quantity,
          price_snapshot: primaryVariant.additional_price || 0
        }])
        .select()
        .single();

      if (insertError) throw insertError;
      return res.status(201).json({ message: "Added to cart", item: newItem });
    }

  } catch (err) {
    console.error("Cart POST Error:", err);
    return res.status(500).json({ error: err.message });
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

    // 1. Fetch user's cart items
    const { data: cartItems, error: cartError } = await supabase
      .from("cart_items")
      .select("id, product_id, quantity, price_snapshot")
      .eq("user_id", user_id);

    if (cartError) throw cartError;

    if (!cartItems || cartItems.length === 0) {
      return res.json([]);
    }

    // 2. Extract product IDs
    const productIds = cartItems.map(item => item.product_id);

    // 3. Fetch base product details (only existing columns)
    const { data: products, error: productError } = await supabase
      .from("jewellery_products")
      .select("id, title, category, image_url")
      .in("id", productIds);

    if (productError) throw productError;

    // 4. Fetch the primary variant for each product (weight, making_charges if present)
    const { data: variants } = await supabase
      .from("product_variants")
      .select("product_id, weight, additional_price")
      .in("product_id", productIds);

    // 5. Build lookup maps
    const productMap = (products || []).reduce((acc, p) => {
      acc[p.id] = p;
      return acc;
    }, {});

    // Use the first variant per product for weight
    const variantMap = (variants || []).reduce((acc, v) => {
      if (!acc[v.product_id]) acc[v.product_id] = v;
      return acc;
    }, {});

    // 6. Merge data
    const formattedCart = cartItems.map(item => {
      const product = productMap[item.product_id] || {
        id: item.product_id,
        title: "Unknown Product",
        category: "N/A",
        image_url: ""
      };
      const variant = variantMap[item.product_id];
      return {
        ...item,
        jewellery_products: {
          ...product,
          metal_weight: variant?.weight ?? null,
          making_charges: null  // not stored separately; GST on gold cost only
        }
      };
    });

    return res.json(formattedCart);

  } catch (err) {
    console.error("Cart GET Error:", err);
    return res.status(500).json({ error: err.message });
  }
});


/* ==========================================================
   3️⃣ REMOVE ITEM FROM CART
========================================================== */

/**
 * @swagger
<<<<<<< dhrumil
 * /cart/{id}:
 *   patch:
 *     summary: Update quantity of a cart item
 *     tags: [Cart]
 */
router.patch("/:id", authenticateToken, async (req, res) => {
    try {
        const { quantity } = req.body;
        const { id } = req.params;

        if (quantity < 1) return res.status(400).json({ error: "Quantity must be at least 1" });

        const { error } = await supabase
            .from("cart_items")
            .update({ quantity })
            .eq("id", id)
            .eq("user_id", req.user.user_id);

        if (error) throw error;
        return res.json({ message: "Quantity updated" });
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
});

/**
 * @swagger
 * /cart/{id}:
=======
 * /cart/{variant_id}:
>>>>>>> main
 *   delete:
 *     summary: Remove variant from cart
 *     tags: [Cart]
<<<<<<< dhrumil
=======
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: variant_id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Item removed
>>>>>>> main
 */
router.delete("/:id", authenticateToken, async (req, res) => {
  try {
    const user_id = req.user.user_id;
    const { id } = req.params;

    const { error } = await supabase
      .from("cart_items")
      .delete()
      .eq("id", id)
      .eq("user_id", user_id);

    if (error) throw error;
    return res.json({ message: "Item removed from cart" });

  } catch (err) {
    console.error("Cart DELETE Error:", err);
    return res.status(500).json({ error: err.message });
  }
});

export default router;
