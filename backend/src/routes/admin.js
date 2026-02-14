import express from "express";
import { authenticateToken } from "../middleware/auth.js";
import { authorizeRoles } from "../middleware/roleMiddleware.js";
import { supabase } from "../config/database.js";

import { fetchGoldRate } from "../services/goldRateService.js";
import { getDiamondRate } from "../services/diamondRateService.js";
import { calculateFinalPrice } from "../services/pricingService.js";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Admin
 *   description: Admin-only endpoints
 */

/* =========================================================
   CREATE PRODUCT
========================================================= */
/**
 * @swagger
 * /admin/jewellery:
 *   post:
 *     summary: Create jewellery product (Admin only)
 *     tags: [Admin]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               product_name:
 *                 type: string
 *               category:
 *                 type: string
 *               sku:
 *                 type: string
 *               metal_type:
 *                 type: string
 *               purity:
 *                 type: string
 *               metal_weight:
 *                 type: number
 *               diamond_weight:
 *                 type: number
 *               diamond_quality:
 *                 type: string
 *               making_charges:
 *                 type: number
 *               discount:
 *                 type: number
 *               stock_quantity:
 *                 type: integer
 *               availability:
 *                 type: string
 *               description:
 *                 type: string
 *               image_url:
 *                 type: string
 *     responses:
 *       201:
 *         description: Product created successfully
 */
router.post(
  "/jewellery",
  authenticateToken,
  authorizeRoles("ADMIN"),
  async (req, res) => {
    try {
      const {
        product_name,
        category,
        sku,
        metal_type,
        purity,
        metal_weight,
        diamond_weight = 0,
        diamond_quality = "VVS1",
        making_charges,
        discount = 0,
        stock_quantity,
        availability,
        description,
        image_url
      } = req.body;

      const allowedMetals = ["gold", "silver", "platinum"];
      if (!allowedMetals.includes(metal_type?.toLowerCase())) {
        return res.status(400).json({
          error: "metal_type must be gold, silver, or platinum"
        });
      }

      const metalPricePerGram = await fetchGoldRate(purity);

      let diamondPricePerCarat = 0;
      if (diamond_weight > 0) {
        diamondPricePerCarat = await getDiamondRate(diamond_quality);
      }

      const pricing = calculateFinalPrice({
        metalPricePerGram,
        metalWeight: Number(metal_weight),
        diamondPricePerCarat,
        diamondWeight: Number(diamond_weight),
        makingCharges: Number(making_charges),
        discount: Number(discount)
      });

      const { data, error } = await supabase
        .from("jewellery_products")
        .insert({
          product_name,
          category,
          sku,
          metal_type: metal_type.toLowerCase(),
          purity,
          metal_weight,
          diamond_weight,
          making_charges,
          discount,
          metal_price_per_gram: metalPricePerGram,
          diamond_price_per_carat: diamondPricePerCarat,
          final_price: pricing.finalPrice,
          stock_quantity,
          availability,
          description,
          image_url,
          created_by: req.user.user_id
        })
        .select()
        .single();

      if (error) throw error;

      res.status(201).json(data);

    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);

/* =========================================================
   UPDATE PRODUCT
========================================================= */
/**
 * @swagger
 * /admin/jewellery/{id}:
 *   put:
 *     summary: Update jewellery product (Admin only)
 *     tags: [Admin]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Product ID
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Product updated successfully
 */
router.put(
  "/jewellery/:id",
  authenticateToken,
  authorizeRoles("ADMIN"),
  async (req, res) => {
    try {
      const { id } = req.params;

      const updates = req.body;

      delete updates.id;
      delete updates.created_at;
      delete updates.updated_at;
      delete updates.final_price;

      const { data, error } = await supabase
        .from("jewellery_products")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;

      res.json(data);

    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);

/* =========================================================
   DELETE PRODUCT
========================================================= */
/**
 * @swagger
 * /admin/jewellery/{id}:
 *   delete:
 *     summary: Delete jewellery product (Admin only)
 *     tags: [Admin]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Product ID
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Product deleted successfully
 */
router.delete(
  "/jewellery/:id",
  authenticateToken,
  authorizeRoles("ADMIN"),
  async (req, res) => {
    try {
      const { id } = req.params;

      const { error } = await supabase
        .from("jewellery_products")
        .delete()
        .eq("id", id);

      if (error) throw error;

      res.json({ message: "Product deleted successfully" });

    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);

/* =========================================================
   ADMIN ORDERS
========================================================= */
/**
 * @swagger
 * /admin/orders:
 *   get:
 *     summary: Get all orders (Admin only)
 *     tags: [Admin]
 *     security:
 *       - BearerAuth: []
 */
router.get(
  "/orders",
  authenticateToken,
  authorizeRoles("ADMIN"),
  async (req, res) => {
    const { data } = await supabase
      .from("orders")
      .select(`*, users(name,email)`)
      .order("created_at", { ascending: false });

    res.json(data);
  }
);

/* =========================================================
   SALES ANALYTICS
========================================================= */
/**
 * @swagger
 * /admin/analytics:
 *   get:
 *     summary: Get sales analytics (Admin only)
 *     tags: [Admin]
 *     security:
 *       - BearerAuth: []
 */
router.get(
  "/analytics",
  authenticateToken,
  authorizeRoles("ADMIN"),
  async (req, res) => {
    const { data } = await supabase
      .from("sales_summary")
      .select("*");

    res.json(data);
  }
);

export default router;
