import express from "express";
import { supabase } from "../config/database.js";
import { authenticateToken } from "../middleware/auth.js";
import { authorizeRoles } from "../middleware/roleMiddleware.js";
import { validate as isUuid } from "uuid";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: ProductImages
 *   description: Product image management
 */


/* ==========================================================
   1️⃣ ADD IMAGE (Admin Only)
========================================================== */

/**
 * @swagger
 * /product-images:
 *   post:
 *     summary: Add image to product (Admin only)
 *     tags: [ProductImages]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           example:
 *             product_id: "uuid-of-product"
 *             image_url: "https://cdn.site.com/ring1.jpg"
 *             alt_text: "Front view gold ring"
 *             is_primary: true
 *     responses:
 *       201:
 *         description: Image added successfully
 *       400:
 *         description: Validation error
 *       404:
 *         description: Product not found
 */
router.post(
  "/",
  authenticateToken,
  authorizeRoles("admin"),
  async (req, res) => {
    try {
      const { product_id, image_url, alt_text = "", is_primary = false } = req.body;

      if (!product_id || !image_url) {
        return res.status(400).json({
          error: "product_id and image_url are required"
        });
      }

      if (!isUuid(product_id)) {
        return res.status(400).json({
          error: "Invalid product_id format"
        });
      }

      // Check product exists
      const { data: product } = await supabase
        .from("jewellery_products")
        .select("id")
        .eq("id", product_id)
        .maybeSingle();

      if (!product) {
        return res.status(404).json({
          error: "Product not found"
        });
      }

      // If setting primary → unset previous primary
      if (is_primary) {
        await supabase
          .from("product_images")
          .update({ is_primary: false })
          .eq("product_id", product_id);
      }

      const { data, error } = await supabase
        .from("product_images")
        .insert([{
          product_id,
          image_url,
          alt_text,
          is_primary,
          is_active: true
        }])
        .select()
        .single();

      if (error) {
        return res.status(500).json({
          error: "Database error",
          detail: error.message
        });
      }

      return res.status(201).json({
        message: "Image added successfully",
        image: data
      });

    } catch (err) {
      return res.status(500).json({
        error: "Internal server error",
        detail: err.message
      });
    }
  }
);


/* ==========================================================
   2️⃣ GET IMAGES BY PRODUCT
========================================================== */

/**
 * @swagger
 * /product-images/{product_id}:
 *   get:
 *     summary: Get active images of a product
 *     tags: [ProductImages]
 *     parameters:
 *       - in: path
 *         name: product_id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: List of product images
 */
router.get("/:product_id", async (req, res) => {
  try {
    const { product_id } = req.params;

    if (!isUuid(product_id)) {
      return res.status(400).json({
        error: "Invalid product_id format"
      });
    }

    const { data, error } = await supabase
      .from("product_images")
      .select("*")
      .eq("product_id", product_id)
      .eq("is_active", true)
      .order("is_primary", { ascending: false });

    if (error) {
      return res.status(500).json({
        error: "Database error",
        detail: error.message
      });
    }

    return res.status(200).json({
      count: data.length,
      images: data
    });

  } catch (err) {
    return res.status(500).json({
      error: "Internal server error",
      detail: err.message
    });
  }
});


/* ==========================================================
   3️⃣ DELETE IMAGE (Soft Delete - Admin)
========================================================== */

/**
 * @swagger
 * /product-images/{id}:
 *   delete:
 *     summary: Disable product image (Admin only)
 *     tags: [ProductImages]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 */
router.delete(
  "/:id",
  authenticateToken,
  authorizeRoles("admin"),
  async (req, res) => {
    try {
      const { id } = req.params;

      if (!isUuid(id)) {
        return res.status(400).json({
          error: "Invalid image ID format"
        });
      }

      const { data } = await supabase
        .from("product_images")
        .update({ is_active: false })
        .eq("id", id)
        .select()
        .maybeSingle();

      if (!data) {
        return res.status(404).json({
          error: "Image not found"
        });
      }

      return res.status(200).json({
        message: "Image disabled successfully"
      });

    } catch (err) {
      return res.status(500).json({
        error: "Internal server error",
        detail: err.message
      });
    }
  }
);

export default router;