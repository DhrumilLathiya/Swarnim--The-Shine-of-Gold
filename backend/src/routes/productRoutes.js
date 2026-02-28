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


/* ==========================================================
   GET SINGLE PRODUCT (WITH VARIANTS)
========================================================== */

/**
 * @swagger
 * /products/{id}:
 *   get:
 *     summary: Get single product with active variants
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Product details with variants
 *       400:
 *         description: Invalid ID
 *       404:
 *         description: Product not found
 */
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    if (!isUuid(id)) {
      return res.status(400).json({
        error: "Invalid product ID format"
      });
    }

    const { data: product, error } = await supabase
      .from("jewellery_products")
      .select("*")
      .eq("id", id)
      .eq("is_active", true)
      .maybeSingle();

    if (error) {
      return res.status(500).json({
        error: "Database error",
        detail: error.message
      });
    }

    if (!product) {
      return res.status(404).json({
        error: "Product not found"
      });
    }

    const { data: variants } = await supabase
      .from("product_variants")
      .select(`
        id,
        sku,
        metal_type,
        purity,
        size,
        weight,
        additional_price,
        stock_quantity
      `)
      .eq("product_id", id)
      .eq("is_active", true);

    return res.status(200).json({
      ...product,
      variants
    });

  } catch (error) {
    return res.status(500).json({
      error: "Internal server error",
      detail: error.message
    });
  }
});

export default router;