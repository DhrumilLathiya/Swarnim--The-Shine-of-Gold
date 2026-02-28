import express from "express";
import { supabase } from "../config/database.js";
import { authenticateToken } from "../middleware/auth.js";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Reviews
 *   description: Product review management
 */

/**
 * @swagger
 * /reviews:
 *   post:
 *     summary: Create a product review
 *     tags: [Reviews]
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
 *               - rating
 *             properties:
 *               product_id:
 *                 type: string
 *                 format: uuid
 *               rating:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 5
 *               comment:
 *                 type: string
 *     responses:
 *       201:
 *         description: Review created successfully
 */
router.post("/", authenticateToken, async (req, res) => {
  try {
    const user_id = req.user.user_id;
    const { product_id, rating, comment } = req.body;

    if (!product_id || !rating) {
      return res.status(400).json({
        error: "Product ID and rating are required"
      });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({
        error: "Rating must be between 1 and 5"
      });
    }

    const { data: product } = await supabase
      .from("jewellery_products")
      .select("id")
      .eq("id", product_id)
      .single();

    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    const { data, error } = await supabase
      .from("reviews")
      .insert([{ user_id, product_id, rating, comment }])
      .select()
      .single();

    if (error) {
      if (error.code === "23505") {
        return res.status(400).json({
          error: "You have already reviewed this product"
        });
      }
      return res.status(400).json({ error: error.message });
    }

    return res.status(201).json({
      message: "Review submitted successfully",
      review: data
    });

  } catch (err) {
    return res.status(500).json({
      error: "Internal server error",
      detail: err.message
    });
  }
});

/**
 * @swagger
 * /reviews/{product_id}:
 *   get:
 *     summary: Get reviews for a product
 *     tags: [Reviews]
 *     parameters:
 *       - in: path
 *         name: product_id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: List of reviews
 */
router.get("/:product_id", async (req, res) => {
  try {
    const { product_id } = req.params;
    const limit = Math.min(parseInt(req.query.limit) || 20, 100);
    const offset = parseInt(req.query.offset) || 0;

    const { data, error } = await supabase
      .from("reviews")
      .select(`
        id,
        rating,
        comment,
        created_at,
        users(name)
      `)
      .eq("product_id", product_id)
      .range(offset, offset + limit - 1);

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    const { data: avgData } = await supabase
      .from("reviews")
      .select("rating")
      .eq("product_id", product_id);

    const avgRating =
      avgData.length > 0
        ? avgData.reduce((sum, r) => sum + r.rating, 0) / avgData.length
        : 0;

    return res.status(200).json({
      count: data.length,
      average_rating: Number(avgRating.toFixed(2)),
      reviews: data
    });

  } catch (err) {
    return res.status(500).json({
      error: "Internal server error",
      detail: err.message
    });
  }
});

/**
 * @swagger
 * /reviews/{product_id}:
 *   put:
 *     summary: Update your review
 *     tags: [Reviews]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: product_id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               rating:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 5
 *               comment:
 *                 type: string
 *     responses:
 *       200:
 *         description: Review updated successfully
 */
router.put("/:product_id", authenticateToken, async (req, res) => {
  try {
    const user_id = req.user.user_id;
    const { product_id } = req.params;
    const { rating, comment } = req.body;

    if (!rating && !comment) {
      return res.status(400).json({
        error: "At least one field (rating or comment) is required"
      });
    }

    if (rating && (rating < 1 || rating > 5)) {
      return res.status(400).json({
        error: "Rating must be between 1 and 5"
      });
    }

    const { data, error } = await supabase
      .from("reviews")
      .update({ rating, comment })
      .eq("user_id", user_id)
      .eq("product_id", product_id)
      .select()
      .single();

    if (error || !data) {
      return res.status(404).json({
        error: "Review not found"
      });
    }

    return res.status(200).json({
      message: "Review updated successfully",
      review: data
    });

  } catch (err) {
    return res.status(500).json({
      error: "Internal server error",
      detail: err.message
    });
  }
});

/**
 * @swagger
 * /reviews/{product_id}:
 *   delete:
 *     summary: Delete your review
 *     tags: [Reviews]
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
 *         description: Review deleted successfully
 */
router.delete("/:product_id", authenticateToken, async (req, res) => {
  try {
    const user_id = req.user.user_id;
    const { product_id } = req.params;

    const { data, error } = await supabase
      .from("reviews")
      .delete()
      .eq("user_id", user_id)
      .eq("product_id", product_id)
      .select();

    if (error || data.length === 0) {
      return res.status(404).json({
        error: "Review not found"
      });
    }

    return res.status(200).json({
      message: "Review deleted successfully"
    });

  } catch (err) {
    return res.status(500).json({
      error: "Internal server error",
      detail: err.message
    });
  }
});

export default router;