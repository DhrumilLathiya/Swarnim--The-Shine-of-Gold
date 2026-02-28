import express from "express";
import { supabase } from "../config/database.js";
import { authenticateToken } from "../middleware/auth.js";
import { authorizeRoles } from "../middleware/roleMiddleware.js";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: ProductImages
 *   description: Product image management
 */

/**
 * @swagger
 * /product-images:
 *   post:
 *     summary: Add image to product (Admin)
 *     tags: [ProductImages]
 */
router.post("/", authenticateToken, authorizeRoles("admin"), async (req, res) => {
  const { product_id, image_url, alt_text, is_primary } = req.body;

  const { data, error } = await supabase
    .from("product_images")
    .insert([{ product_id, image_url, alt_text, is_primary }])
    .select()
    .single();

  if (error) return res.status(400).json({ error: error.message });
  res.json(data);
});

router.get("/:product_id", async (req, res) => {
  const { data, error } = await supabase
    .from("product_images")
    .select("*")
    .eq("product_id", req.params.product_id);

  if (error) return res.status(400).json({ error: error.message });
  res.json(data);
});

export default router;