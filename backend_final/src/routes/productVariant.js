import express from "express";
import { supabase } from "../config/database.js";
import { authenticateToken } from "../middleware/auth.js";
import { authorizeRoles } from "../middleware/roleMiddleware.js";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: ProductVariants
 *   description: SKU-level variant & inventory management
 */


/* ==========================================================
   1️⃣ CREATE VARIANT (Admin Only)
========================================================== */

/**
 * @swagger
 * /product-variants:
 *   post:
 *     summary: Create a new product variant (Admin only)
 *     tags: [ProductVariants]
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
 *               - sku
 *               - metal_type
 *               - purity
 *               - weight
 *             properties:
 *               product_id:
 *                 type: string
 *                 format: uuid
 *               sku:
 *                 type: string
 *               metal_type:
 *                 type: string
 *               purity:
 *                 type: string
 *               size:
 *                 type: string
 *               weight:
 *                 type: number
 *               additional_price:
 *                 type: number
 *               stock_quantity:
 *                 type: integer
 *           example:
 *             product_id: "9d6a5e63-3b4a-4e9f-8f7b-2c9c9a7e6d12"
 *             sku: "RING-GLD-22K-7"
 *             metal_type: "gold"
 *             purity: "22K"
 *             size: "7"
 *             weight: 8.5
 *             additional_price: 500
 *             stock_quantity: 10
 *     responses:
 *       201:
 *         description: Variant created successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       500:
 *         description: Server error
 */
router.post(
  "/",
  authenticateToken,
  authorizeRoles("admin"),
  async (req, res) => {
    try {
      const {
        product_id,
        sku,
        metal_type,
        purity,
        size,
        weight,
        additional_price = 0,
        stock_quantity = 0
      } = req.body;

      if (!product_id || !sku || !metal_type || !purity || !weight) {
        return res.status(400).json({
          error: "product_id, sku, metal_type, purity and weight are required"
        });
      }

      const { data, error } = await supabase
        .from("product_variants")
        .insert([{
          product_id,
          sku,
          metal_type,
          purity,
          size,
          weight,
          additional_price,
          stock_quantity,
          is_active: true
        }])
        .select()
        .maybeSingle();

      if (error) {
        return res.status(500).json({
          error: "Database error",
          detail: error.message
        });
      }

      return res.status(201).json({
        message: "Variant created successfully",
        variant: data
      });

    } catch (err) {
      return res.status(500).json({
        error: "Creation failed",
        detail: err.message
      });
    }
  }
);


/* ==========================================================
   2️⃣ GET VARIANTS BY PRODUCT
========================================================== */

/**
 * @swagger
 * /product-variants/product/{product_id}:
 *   get:
 *     summary: Get all active variants of a product
 *     tags: [ProductVariants]
 *     parameters:
 *       - in: path
 *         name: product_id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: List of variants
 *       500:
 *         description: Server error
 */
router.get("/product/:product_id", async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("product_variants")
      .select("*")
      .eq("product_id", req.params.product_id)
      .eq("is_active", true)
      .order("created_at", { ascending: false });

    if (error) {
      return res.status(500).json({
        error: "Database error",
        detail: error.message
      });
    }

    return res.status(200).json({
      count: data.length,
      variants: data
    });

  } catch (err) {
    return res.status(500).json({
      error: "Fetch failed",
      detail: err.message
    });
  }
});


/* ==========================================================
   3️⃣ GET SINGLE VARIANT
========================================================== */

/**
 * @swagger
 * /product-variants/{id}:
 *   get:
 *     summary: Get variant by ID
 *     tags: [ProductVariants]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Variant found
 *       404:
 *         description: Variant not found
 *       500:
 *         description: Server error
 */
router.get("/:id", async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("product_variants")
      .select("*")
      .eq("id", req.params.id)
      .maybeSingle();

    if (error) {
      return res.status(500).json({
        error: "Database error",
        detail: error.message
      });
    }

    if (!data) {
      return res.status(404).json({
        error: "Variant not found"
      });
    }

    return res.status(200).json(data);

  } catch (err) {
    return res.status(500).json({
      error: "Fetch failed",
      detail: err.message
    });
  }
});


/* ==========================================================
   4️⃣ UPDATE VARIANT (Admin Only)
========================================================== */

/**
 * @swagger
 * /product-variants/{id}:
 *   put:
 *     summary: Update a product variant (Admin only)
 *     tags: [ProductVariants]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           example:
 *             stock_quantity: 20
 *             additional_price: 750
 *     responses:
 *       200:
 *         description: Variant updated successfully
 *       404:
 *         description: Variant not found
 *       500:
 *         description: Server error
 */
router.put(
  "/:id",
  authenticateToken,
  authorizeRoles("admin"),
  async (req, res) => {
    try {
      const { data, error } = await supabase
        .from("product_variants")
        .update({
          ...req.body,
          updated_at: new Date()
        })
        .eq("id", req.params.id)
        .select()
        .maybeSingle();

      if (error) {
        return res.status(500).json({
          error: "Database error",
          detail: error.message
        });
      }

      if (!data) {
        return res.status(404).json({
          error: "Variant not found"
        });
      }

      return res.status(200).json({
        message: "Variant updated successfully",
        variant: data
      });

    } catch (err) {
      return res.status(500).json({
        error: "Update failed",
        detail: err.message
      });
    }
  }
);


/* ==========================================================
   5️⃣ DISABLE VARIANT (Admin Only)
========================================================== */

/**
 * @swagger
 * /product-variants/{id}:
 *   delete:
 *     summary: Disable a variant (Admin only)
 *     tags: [ProductVariants]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Variant disabled successfully
 *       404:
 *         description: Variant not found
 *       500:
 *         description: Server error
 */
router.delete(
  "/:id",
  authenticateToken,
  authorizeRoles("admin"),
  async (req, res) => {
    try {
      const { data, error } = await supabase
        .from("product_variants")
        .update({ is_active: false })
        .eq("id", req.params.id)
        .select()
        .maybeSingle();

      if (error) {
        return res.status(500).json({
          error: "Database error",
          detail: error.message
        });
      }

      if (!data) {
        return res.status(404).json({
          error: "Variant not found"
        });
      }

      return res.status(200).json({
        message: "Variant disabled successfully"
      });

    } catch (err) {
      return res.status(500).json({
        error: "Delete failed",
        detail: err.message
      });
    }
  }
);

export default router;