import express from "express";
import { supabase } from "../config/database.js";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Products
 *   description: Public product endpoints
 */

/**
 * @swagger
 * /products:
 *   get:
 *     summary: Get jewellery products (Paginated)
 *     tags: [Products]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Number of items per page
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Filter by category
 *     responses:
 *       200:
 *         description: Paginated product list
 */
router.get("/products", async (req, res) => {
  try {
    let page = Number(req.query.page) || 1;
    let limit = Number(req.query.limit) || 10;
    const category = req.query.category;

    // Prevent invalid values
    if (page < 1) page = 1;
    if (limit < 1) limit = 10;
    if (limit > 50) limit = 50; // max limit protection

    const from = (page - 1) * limit;
    const to = from + limit - 1;

    let query = supabase
      .from("jewellery_products")
      .select(
        `
        id,
        product_name,
        category,
        final_price,
        image_url,
        availability,
        collection_tag,
        created_at
        `,
        { count: "exact" }
      )
      .order("created_at", { ascending: false })
      .range(from, to);

    if (category) {
      query = query.ilike("category", category);
    }

    const { data, error, count } = await query;

    if (error) throw error;

    return res.json({
      page,
      limit,
      total: count,
      total_pages: Math.ceil(count / limit),
      data
    });

  } catch (error) {
    console.error("Get Products Error:", error.message);
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
