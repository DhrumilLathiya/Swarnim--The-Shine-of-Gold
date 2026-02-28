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
 *   description: Admin management endpoints
 */

const adminAuth = [authenticateToken, authorizeRoles("admin")];

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
 */
router.post("/jewellery", adminAuth, async (req, res) => {
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
      availability = "in_stock",
      description,
      image_url
    } = req.body;

    if (!product_name || !sku || !metal_type || !metal_weight || !making_charges) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields"
      });
    }

    const allowedMetals = ["gold", "silver", "platinum"];
    if (!allowedMetals.includes(metal_type.toLowerCase())) {
      return res.status(400).json({
        success: false,
        message: "Invalid metal type"
      });
    }

    const metalPricePerGram = await fetchGoldRate(purity);
    let diamondPricePerCarat = 0;

    if (Number(diamond_weight) > 0) {
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
      .insert([
        {
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
        }
      ])
      .select()
      .single();

    if (error) throw error;

    return res.status(201).json({
      success: true,
      message: "Product created successfully",
      data
    });

  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Product creation failed",
      detail: err.message
    });
  }
});

/* =========================================================
   UPDATE PRODUCT
========================================================= */

router.put("/jewellery/:id", adminAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const updates = { ...req.body };

    delete updates.id;
    delete updates.created_at;
    delete updates.updated_at;

    const { data, error } = await supabase
      .from("jewellery_products")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error || !data) {
      return res.status(404).json({
        success: false,
        message: "Product not found"
      });
    }

    return res.status(200).json({
      success: true,
      message: "Product updated successfully",
      data
    });

  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Update failed",
      detail: err.message
    });
  }
});

/* =========================================================
   SOFT DELETE PRODUCT
========================================================= */

router.delete("/jewellery/:id", adminAuth, async (req, res) => {
  try {
    const { id } = req.params;

    const { error } = await supabase
      .from("jewellery_products")
      .update({ is_active: false })
      .eq("id", id);

    if (error) throw error;

    return res.status(200).json({
      success: true,
      message: "Product deactivated successfully"
    });

  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Deletion failed",
      detail: err.message
    });
  }
});

/* =========================================================
   ADMIN ORDERS (Paginated + Filterable)
========================================================= */

router.get("/orders", adminAuth, async (req, res) => {
  try {
    const { status } = req.query;
    const page = parseInt(req.query.page) || 1;
    const limit = Math.min(parseInt(req.query.limit) || 10, 50);
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    let query = supabase
      .from("orders")
      .select("*, users(name,email)", { count: "exact" })
      .order("created_at", { ascending: false })
      .range(from, to);

    if (status) {
      query = query.eq("status", status);
    }

    const { data, error, count } = await query;

    if (error) throw error;

    return res.status(200).json({
      success: true,
      pagination: {
        page,
        limit,
        total: count,
        totalPages: Math.ceil(count / limit)
      },
      data
    });

  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch orders",
      detail: err.message
    });
  }
});

/* =========================================================
   SALES ANALYTICS
========================================================= */

router.get("/analytics", adminAuth, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("sales_summary")
      .select("*");

    if (error) throw error;

    return res.status(200).json({
      success: true,
      data
    });

  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Analytics fetch failed",
      detail: err.message
    });
  }
});

export default router;