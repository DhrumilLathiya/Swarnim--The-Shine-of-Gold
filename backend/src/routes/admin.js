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

/**
 * @swagger
 * /admin/jewellery:
 *   post:
 *     summary: Create jewellery product with live pricing (Admin only)
 *     tags: [Admin]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - product_name
 *               - category
 *               - sku
 *               - metal_type
 *               - purity
 *               - metal_weight
 *               - making_charges
 *               - stock_quantity
 *               - availability
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
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Admin only
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

      // ---------------------------
      // VALIDATION
      // ---------------------------
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
          error: "Validation error",
          detail: "Missing required fields"
        });
      }

      // ---------------------------
      // TYPE CASTING
      // ---------------------------
      const numericMetalWeight = Number(metal_weight);
      const numericDiamondWeight = Number(diamond_weight);
      const numericMakingCharges = Number(making_charges);
      const numericDiscount = Number(discount);
      const numericStockQuantity = Number(stock_quantity);

      if (
        isNaN(numericMetalWeight) ||
        isNaN(numericDiamondWeight) ||
        isNaN(numericMakingCharges) ||
        isNaN(numericDiscount) ||
        isNaN(numericStockQuantity)
      ) {
        return res.status(400).json({
          error: "Validation error",
          detail: "Numeric fields contain invalid values"
        });
      }

      console.log("🟢 Creating product:", product_name);

      // ---------------------------
      // FETCH GOLD RATE
      // ---------------------------
      const metalPricePerGram = await fetchGoldRate(purity);
      console.log("Gold Rate Used:", metalPricePerGram);

      // ---------------------------
      // FETCH DIAMOND RATE
      // ---------------------------
      let diamondPricePerCarat = 0;

      if (numericDiamondWeight > 0) {
        diamondPricePerCarat = await getDiamondRate(diamond_quality);
      }

      console.log("Diamond Rate Used:", diamondPricePerCarat);

      // ---------------------------
      // CALCULATE FINAL PRICE
      // ---------------------------
      const pricing = calculateFinalPrice({
        metalPricePerGram,
        metalWeight: numericMetalWeight,
        diamondPricePerCarat,
        diamondWeight: numericDiamondWeight,
        makingCharges: numericMakingCharges,
        discount: numericDiscount
      });

      console.log("Pricing Breakdown:", pricing);

      if (
        pricing.finalPrice == null ||
        isNaN(pricing.finalPrice)
      ) {
        throw new Error("Final price calculation failed");
      }

      // ---------------------------
      // INSERT INTO DATABASE
      // ---------------------------
      const { data, error } = await supabase
        .from("jewellery_products")
        .insert({
          product_name,
          category,
          sku,
          metal_type,
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
          created_by: req.user.id
        })
        .select()
        .single();

      if (error) {
        console.error("DB Insert Error:", error.message);
        throw error;
      }

      return res.status(201).json({
        message: "Product created successfully",
        pricing_breakdown: pricing,
        product: data
      });

    } catch (error) {
      console.error("Create Product Error:", error.message);
      return res.status(500).json({
        error: "Internal server error",
        detail: error.message
      });
    }
  }
);

export default router;
