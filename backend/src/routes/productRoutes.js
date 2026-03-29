/**
 * PUBLIC PRODUCT CATALOGUE ROUTES
 * 
 * PURPOSE: Provides high-performance, public endpoints for browsing the jewelry inventory.
 * USAGE: Used by the main website shop page and product detail pages.
 */
import express from "express";
<<<<<<< dhrumil
import { supabase } from "../config/database.js"; // Standard DB connection
import { validate as isUuid } from "uuid"; // ID validation helper
=======
import { supabase } from "../config/database.js";
import { validate as isUuid } from "uuid";
>>>>>>> main

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
<<<<<<< dhrumil
// LIST PRODUCTS: Paginated retrieval of jewelry items with optional category filtering
router.get("/products", async (req, res) => {
=======
router.get("/", async (req, res) => {
>>>>>>> main
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
        is_active,
        created_at,
        product_variants (
          additional_price,
          stock_quantity
        )
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

<<<<<<< dhrumil
    // Map data for backward compatibility
    const mappedData = data.map(item => {
      // Get price from the first variant if available
      const price = item.product_variants?.[0]?.additional_price || 0;
      return {
        ...item,
        product_name: item.title,
        final_price: price,
        stock_quantity: item.product_variants?.[0]?.stock_quantity || 0
      };
    });

=======
>>>>>>> main
    return res.status(200).json({
      page,
      limit,
      total: count,
      total_pages: Math.ceil(count / limit),
      data: mappedData
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
// PRODUCT DETAILS: Fetches an individual product by ID, including its variants and image gallery
router.get("/products/:id", async (req, res) => {
  try {
    const { id } = req.params;

    // Fetch product with variants
    const { data: product, error: productError } = await supabase
      .from("jewellery_products")
      .select(`
        *,
        product_variants (*)
      `)
      .eq("id", id)
      .single();

    if (productError || !product) {
      console.error("Supabase Product Fetch Error:", productError?.message);
      return res.status(404).json({ error: "Product not found" });
    }

    // Try to fetch images separately (since relationship might be missing in schema cache)
    let images = [];
    try {
      const { data: imageData, error: imageError } = await supabase
        .from("product_images")
        .select("*")
        .eq("product_id", id);

      if (!imageError) {
        images = imageData || [];
      }
    } catch (e) {
      console.warn("Could not fetch product images separately:", e.message);
    }

    // Map for backward compatibility
    const mappedProduct = {
      ...product,
      product_name: product.title,
      final_price: product.product_variants?.[0]?.additional_price || 0,
      stock_quantity: product.product_variants?.[0]?.stock_quantity || 0,
      image_url: product.image_url || images[0]?.image_url,
      product_images: images
    };

    return res.json(mappedProduct);
  } catch (error) {
    console.error("Get Product By ID Error:", error.message);
    return res.status(500).json({ error: "Internal server error" });
  }
});

export default router;