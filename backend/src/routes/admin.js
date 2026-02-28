import express from "express";
import { supabase } from "../config/database.js";
import { authenticateToken } from "../middleware/auth.js";
import { authorizeRoles } from "../middleware/roleMiddleware.js";
import { fetchGoldRate } from "../services/goldRateService.js";
import { getDiamondRate } from "../services/diamondRateService.js";
import { calculateFinalPrice } from "../services/pricingService.js";

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
router.post(
  "/jewellery",
  authenticateToken,
  authorizeRoles("admin"),
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
        return res.status(400).json({
          success: false,
          message: "Missing required fields"
        });
      }

      const allowedMetals = ["gold", "silver", "platinum"];
      if (!allowedMetals.includes(metal_type.toLowerCase())) {
        return res.status(400).json({
          success: false,
          message: "Invalid metal_type"
        });
      }

      const allowedAvailability = ["in_stock", "out_of_stock", "preorder"];
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
        .from("jewellery_products")
        .select("id")
        .eq("sku", sku)
        .maybeSingle();

      if (existingSku) {
        return res.status(400).json({
          success: false,
          message: "SKU already exists"
        });
      }

      /* ================= CATEGORY CHECK ================= */

      const { data: categoryExists } = await supabase
        .from("categories")
        .select("id")
        .eq("name", category)
        .maybeSingle();

      if (!categoryExists) {
        return res.status(400).json({
          success: false,
          message: "Invalid category"
        });
      }

      /* ================= FETCH LIVE PRICES ================= */

      let metalPricePerGram = 0;
      let diamondPricePerCarat = 0;

      try {
        metalPricePerGram = manual_metal_price
          ? Number(manual_metal_price)
          : await fetchGoldRate(purity);
      } catch {
        metalPricePerGram = 0;
      }

      if (numericDiamondWeight > 0) {
        try {
          diamondPricePerCarat = await getDiamondRate(diamond_quality);
        } catch {
          diamondPricePerCarat = 0;
        }
      }

      /* ================= PRICE CALCULATION ================= */

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

      /* ================= INSERT PRODUCT ================= */

      const { data, error } = await supabase
        .from("jewellery_products")
        .insert([
          {
            product_name: product_name.trim(),
            category,
            collection_tag,
            sku: sku.trim(),
            metal_type: metal_type.toLowerCase(),
            purity,
            metal_weight: numericMetalWeight,
            diamond_weight: numericDiamondWeight,
            making_charges: numericMakingCharges,
            discount: numericDiscount,
            metal_price_per_gram: metalPricePerGram,
            diamond_price_per_carat: diamondPricePerCarat,
            final_price: pricing.finalPrice,
            stock_quantity: numericStockQuantity,
            availability,
            description,
            image_url,
            created_by: req.user.user_id
          }
        ])
        .select()
        .single();

      if (error) throw error;

      return res.status(201).json({
        success: true,
        message: "Product created successfully",
        pricing_breakdown: pricing,
        product: data
      });

    } catch (err) {
      console.error("Admin Product Create Error:", err.message);
      return res.status(500).json({
        success: false,
        message: "Internal server error",
        detail: err.message
      });
    }
  }
);

export default router;