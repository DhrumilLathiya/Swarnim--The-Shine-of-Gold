/**
 * ADMINISTRATIVE PRODUCT ROUTES
 */
import express from "express";
import { supabase } from "../config/database.js";
import { authenticateToken } from "../middleware/auth.js";
import { authorizeRoles } from "../middleware/roleMiddleware.js";
import { fetchGoldRate } from "../services/goldRateService.js";
import { getDiamondRate } from "../services/diamondRateService.js";
import { calculateFinalPrice } from "../services/pricingService.js";

const router = express.Router();

/* ================= CREATE PRODUCT ================= */

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

      console.log("DEBUG:", req.body);

      /* ===== VALIDATION ===== */

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

      const allowedMetals = ["gold", "silver", "platinum", "diamond-jewelry"];
      if (!allowedMetals.includes(metal_type.toLowerCase())) {
        return res.status(400).json({
          success: false,
          message: "Invalid metal_type"
        });
      }

      /* ===== NUMERIC ===== */

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

      /* ===== SKU CHECK ===== */

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

      /* ===== PRICING ===== */

      let metalPricePerGram = manual_metal_price
        ? Number(manual_metal_price)
        : await fetchGoldRate(purity);

      let diamondPricePerCarat = 0;

      if (numericDiamondWeight > 0) {
        diamondPricePerCarat = await getDiamondRate(diamond_quality);
      }

      const pricing = calculateFinalPrice({
        metalPricePerGram,
        metalWeight: numericMetalWeight,
        diamondPricePerCarat,
        diamondWeight: numericDiamondWeight,
        makingCharges: numericMakingCharges,
        discount: numericDiscount
      });

      /* ===== INSERT PRODUCT ===== */

      const { data: productData } = await supabase
        .from("jewellery_products")
        .insert([{
          title: product_name,
          category,
          collection_tag,
          description,
          image_url,
          is_active: true
        }])
        .select()
        .single();

      const { data: variantData } = await supabase
        .from("product_variants")
        .insert([{
          product_id: productData.id,
          sku,
          metal_type,
          purity,
          weight: numericMetalWeight,
          additional_price: pricing.finalPrice,
          stock_quantity: numericStockQuantity
        }])
        .select()
        .single();

      return res.status(201).json({
        success: true,
        product: { ...productData, ...variantData }
      });

    } catch (err) {
      return res.status(500).json({
        success: false,
        message: err.message
      });
    }
  }
);

/* ================= UPDATE PRODUCT ================= */

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
        collection_tag,
        description,
        image_url,
        metal_type,
        purity,
        metal_weight,
        stock_quantity,
        final_price
      } = req.body;

      await supabase
        .from("jewellery_products")
        .update({
          title: product_name,
          category,
          collection_tag,
          description,
          image_url
        })
        .eq("id", id);

      await supabase
        .from("product_variants")
        .update({
          metal_type,
          purity,
          weight: metal_weight,
          stock_quantity,
          additional_price: final_price
        })
        .eq("product_id", id);

      res.json({ success: true });

    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

/* ================= DELETE PRODUCT ================= */

router.delete(
  "/jewellery/:id",
  authenticateToken,
  authorizeRoles("ADMIN"),
  async (req, res) => {
    try {
      const { id } = req.params;

      await supabase.from("product_images").delete().eq("product_id", id);
      await supabase.from("product_variants").delete().eq("product_id", id);
      await supabase.from("jewellery_products").delete().eq("id", id);

      res.json({ success: true });

    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

export default router;