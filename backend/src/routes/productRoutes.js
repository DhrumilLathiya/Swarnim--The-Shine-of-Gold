import express from "express";
import { supabase } from "../config/database.js";
import { validate as isUuid } from "uuid";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Products
 *   description: Public product catalogue endpoints
 */


/* ==========================================================
   GET PRODUCTS (Paginated + Category Filter)
========================================================== */

/**
 * @swagger
 * /products:
 *   get:
 *     summary: Get active jewellery products (Paginated)
 *     tags: [Products]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           example: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           example: 10
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *           example: ring
 *     responses:
 *       200:
 *         description: Paginated product list
 */
router.get("/", async (req, res) => {
  try {
    let page = Number(req.query.page) || 1;
    let limit = Number(req.query.limit) || 10;
    const category = req.query.category;

    if (page < 1) page = 1;
    if (limit < 1) limit = 10;
    if (limit > 50) limit = 50;

    const from = (page - 1) * limit;
    const to = from + limit - 1;

    let query = supabase
      .from("jewellery_products")
      .select(
        `
        id,
        title,
        category,
        description,
        image_url,
        availability,
        collection_tag,
        created_at
        `,
        { count: "exact" }
      )
      .eq("is_active", true)
      .order("created_at", { ascending: false })
      .range(from, to);

    if (category) {
      query = query.ilike("category", `%${category}%`);
    }

    const { data, error, count } = await query;

    if (error) {
      return res.status(500).json({
        error: "Database error",
        detail: error.message
      });
    }

    return res.status(200).json({
      page,
      limit,
      total: count,
      total_pages: Math.ceil(count / limit),
      data
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
 * /products/{id}:
 *   get:
 *     summary: Get a single product by ID
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Product details
 *       404:
 *         description: Product not found
 */
router.get("/products/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from("jewellery_products")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      return res.status(404).json({ error: "Product not found" });
    }

    return res.json(data);
  } catch (error) {
    console.error("Get Product By ID Error:", error.message);
    return res.status(500).json({ error: "Internal server error" });
  }
});

export default router;