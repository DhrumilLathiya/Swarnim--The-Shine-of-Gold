/**
 * ADMINISTRATIVE PRODUCT ROUTES
 * 
 * PURPOSE: Provides secure endpoints for administrators to manage jewelry products and variants.
 * USAGE: Primarily used by the Admin Dashboard (/admin-dashboard) for CRUD operations.
 */
import express from "express";
import { supabase } from "../config/database.js"; // Connection for high-privilege DB operations
import { authenticateToken } from "../middleware/auth.js"; // Ensures user is logged in
import { authorizeRoles } from "../middleware/roleMiddleware.js"; // Ensures user has 'ADMIN' persona
import { fetchGoldRate } from "../services/goldRateService.js"; // Real-time gold price fetching
import { getDiamondRate } from "../services/diamondRateService.js"; // Dynamic diamond valuation
import { calculateFinalPrice } from "../services/pricingService.js"; // Multi-factor pricing logic

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Admin
 *   description: Admin-only jewellery management endpoints
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     JewelleryCreateRequest:
 *       type: object
 *       required:
 *         - product_name
 *         - category
 *         - sku
 *         - metal_type
 *         - purity
 *         - metal_weight
 *         - making_charges
 *         - stock_quantity
 *         - availability
 *       properties:
 *         product_name:
 *           type: string
 *           example: 22K Gold Ring
 *         category:
 *           type: string
 *           example: Rings
 *         collection_tag:
 *           type: string
 *           example: Wedding Collection
 *         sku:
 *           type: string
 *           example: GR-22K-001
 *         metal_type:
 *           type: string
 *           enum: [gold, silver, platinum]
 *         purity:
 *           type: string
 *           example: 22K
 *         metal_weight:
 *           type: number
 *           example: 10.5
 *         diamond_weight:
 *           type: number
 *           example: 0.5
 *         diamond_quality:
 *           type: string
 *           example: VVS1
 *         making_charges:
 *           type: number
 *           example: 1500
 *         discount:
 *           type: number
 *           example: 5
 *         stock_quantity:
 *           type: integer
 *           example: 10
 *         availability:
 *           type: string
 *           enum: [in_stock, out_of_stock, preorder]
 *         description:
 *           type: string
 *         image_url:
 *           type: string
 *         metal_price:
 *           type: number
 *           example: 5800
 */

/**
 * @swagger
 * /admin/jewellery:
 *   post:
 *     summary: Create jewellery product with live pricing
 *     tags: [Admin]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/JewelleryCreateRequest'
 *     responses:
 *       201:
 *         description: Product created successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Admin access required
 *       500:
 *         description: Server error
 */
// CREATE PRODUCT: Complex multi-layer insertion for a new jewelry design and its primary SKU
router.post(
  "/jewellery",
  authenticateToken,
  authorizeRoles("ADMIN"),
  async (req, res) => {
    try {
      const {
        product_name,
        category,
        collection_tag,
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
        image_url,
        metal_price: manual_metal_price
      } = req.body;

      console.log("DEBUG: POST /jewellery full body:", req.body);

      /* ================= VALIDATION ================= */

      if (
        !product_name ||
        !category ||
        !sku ||
        !metal_type ||
        !purity ||
        metal_weight == null ||
        making_charges == null ||
        stock_quantity == null ||
        !availability
      ) {
        const missing = [];
        if (!product_name) missing.push("product_name");
        if (!category) missing.push("category");
        if (!sku) missing.push("sku");
        if (!metal_type) missing.push("metal_type");
        if (!purity) missing.push("purity");
        if (metal_weight == null) missing.push("metal_weight");
        if (making_charges == null) missing.push("making_charges");
        if (stock_quantity == null) missing.push("stock_quantity");
        if (!availability) missing.push("availability");

        console.warn("DEBUG: Validation Failed. Missing fields:", missing);
        return res.status(400).json({
          success: false,
          error: "Validation error",
          message: "Missing required fields",
          detail: `Missing: ${missing.join(", ")}`
        });
      }

      const allowedMetals = ["gold", "silver", "platinum", "diamond-jewelry"];
      const normalizedMetalType = metal_type.toLowerCase();

      if (!allowedMetals.includes(normalizedMetalType)) {
        return res.status(400).json({
          success: false,
          message: `Invalid metal_type: ${metal_type}. Allowed: ${allowedMetals.join(", ")}`
        });
      }

      const allowedAvailability = ["in_stock", "out_of_stock", "preorder", "made_to_order"];
      if (!allowedAvailability.includes(availability)) {
        return res.status(400).json({
          success: false,
          message: "Invalid availability value"
        });
      }

      /* ================= NUMERIC CASTING ================= */

      const numericMetalWeight = Number(metal_weight);
      const numericDiamondWeight = Number(diamond_weight);
      const numericMakingCharges = Number(making_charges);
      const numericDiscount = Number(discount);
      const numericStockQuantity = Number(stock_quantity);

      if (
        [numericMetalWeight, numericDiamondWeight,
          numericMakingCharges, numericDiscount,
          numericStockQuantity].some(isNaN)
      ) {
        return res.status(400).json({
          success: false,
          message: "Invalid numeric values"
        });
      }

      /* ================= SKU CHECK ================= */

      const { data: existingSku } = await supabase
        .from("product_variants")
        .select("id")
        .eq("sku", sku)
        .maybeSingle();

      if (existingSku) {
        return res.status(400).json({
          success: false,
          message: "SKU already exists"
        });
      }

      /* ================= CATEGORY CHECK (skipped — frontend uses fixed values) ================= */

      /* ================= PRICING LOGIC: FETCH LIVE MARKET RATES AND CALCULATE FINAL COST ================= */

      let metalPricePerGram = 0;
      let diamondPricePerCarat = 0;

      // METAL RATE: Get current gold rate based on purity (e.g., 22K) or use manual override
      try {
        metalPricePerGram = manual_metal_price
          ? Number(manual_metal_price)
          : await fetchGoldRate(purity);
      } catch {
        metalPricePerGram = 0;
      }

      // DIAMOND RATE: If stones are present, fetch dynamic valuation based on quality (e.g., VVS1)
      if (numericDiamondWeight > 0) {
        try {
          diamondPricePerCarat = await getDiamondRate(diamond_quality);
        } catch {
          diamondPricePerCarat = 0;
        }
      }

      // FINAL CALCULATION: Aggregate metal, diamond, making charges, and application of discounts
      const pricing = calculateFinalPrice({
        metalPricePerGram,
        metalWeight: numericMetalWeight,
        diamondPricePerCarat,
        diamondWeight: numericDiamondWeight,
        makingCharges: numericMakingCharges,
        discount: numericDiscount
      });

      if (!pricing?.finalPrice || isNaN(pricing.finalPrice)) {
        return res.status(400).json({
          success: false,
          message: "Final price calculation failed"
        });
      }

      /* ================= INSERT PRODUCT (NEW) ================= */

      // 1. Insert Base Design
      const { data: productData, error: productError } = await supabase
        .from("jewellery_products")
        .insert([
          {
            title: product_name.trim(),
            category,
            collection_tag,
            description,
            image_url,
            is_active: true
          }
        ])
        .select()
        .single();

      if (productError) {
        console.error("DEBUG: Design Insert Error:", productError);
        throw productError;
      }
      console.log("DEBUG: Design Created:", productData?.id);

      // 2. Insert Default Variant (SKU Layer)
      const { data: variantData, error: variantError } = await supabase
        .from("product_variants")
        .insert([
          {
            product_id: productData.id,
            sku: sku.trim(),
            metal_type: metal_type.toLowerCase(),
            purity,
            weight: numericMetalWeight,
            additional_price: pricing.finalPrice,
            stock_quantity: numericStockQuantity,
            is_active: true
          }
        ])
        .select()
        .single();

      if (variantError) {
        console.error("DEBUG: Variant Insert Error:", variantError);
        throw variantError;
      }
      console.log("DEBUG: Variant Created:", variantData?.id);

      return res.status(201).json({
        success: true,
        message: "Product created successfully",
        pricing_breakdown: pricing,
        product: {
          ...productData,
          ...variantData,
          product_name: productData.title,
          final_price: variantData.additional_price
        }
      });

    } catch (err) {
      console.error("DEBUG: Admin Product Create Error:", err.message);
      return res.status(500).json({
        success: false,
        message: "Internal server error",
        detail: err.message
      });
    }
  }
);

/**
 * @swagger
 * /admin/jewellery/{id}:
 *   put:
 *     summary: Update jewellery product and its primary variant
 *     tags: [Admin]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/JewelleryCreateRequest'
 *     responses:
 *       200:
 *         description: Product updated successfully
 *       404:
 *         description: Product not found
 */
// UPDATE PRODUCT: Modifies both the base design and the default variant linked to a product ID
router.put(
  "/jewellery/:id",
  authenticateToken,
  authorizeRoles("ADMIN"),
  async (req, res) => {
    try {
      const { id } = req.params;
      const {
        product_name,
        category,
        collection_tag, // Confirmed: correctly extracted from req.body
        description,
        image_url,
        metal_type,
        purity,
        metal_weight,
        stock_quantity,
        price, // Frontend might send 'price' directly from transformProduct
        final_price
      } = req.body;

      // 1. Update Base Product
      const { error: productError } = await supabase
        .from("jewellery_products")
        .update({
          title: product_name,
          category,
          collection_tag,
          description,
          image_url,
          updated_at: new Date()
        })
        .eq("id", id);

      if (productError) throw productError;

      // 2. Update Primary Variant
      const { error: variantError } = await supabase
        .from("product_variants")
        .update({
          metal_type: metal_type?.toLowerCase(),
          purity,
          weight: metal_weight,
          stock_quantity,
          additional_price: final_price || price,
          updated_at: new Date()
        })
        .eq("product_id", id);

      if (variantError) throw variantError;

      return res.json({
        success: true,
        message: "Product and variant updated successfully"
      });
    } catch (err) {
      console.error("Admin Product Update Error:", err.message);
      return res.status(500).json({
        success: false,
        message: "Internal server error",
        detail: err.message
      });
    }
  }
);

/**
 * @swagger
 * /admin/jewellery/{id}:
 *   delete:
 *     summary: Delete jewellery product and all related data
 *     tags: [Admin]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Product deleted successfully
 */
// DELETE PRODUCT: Permanent removal of a product, its variants, and associated images
router.delete(
  "/jewellery/:id",
  authenticateToken,
  authorizeRoles("ADMIN"),
  async (req, res) => {
    try {
      const { id } = req.params;

      // 1. Delete Images
      await supabase.from("product_images").delete().eq("product_id", id);

      // 2. Delete Variants
      await supabase.from("product_variants").delete().eq("product_id", id);

      // 3. Delete Base Product
      const { error: productError } = await supabase
        .from("jewellery_products")
        .delete()
        .eq("id", id);

      if (productError) throw productError;

      return res.json({
        success: true,
        message: "Product and all related data deleted successfully"
      });
    } catch (err) {
      console.error("Admin Product Delete Error:", err.message);
      return res.status(500).json({
        success: false,
        message: "Internal server error",
        detail: err.message
      });
    }
  }
);

export default router;