import express from "express";
import { supabase } from "../config/database.js";
import { authenticateToken } from "../middleware/auth.js";
import { authorizeRoles } from "../middleware/roleMiddleware.js";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Coupons
 *   description: Coupon management system
 */

/**
 * ======================================================
 * CREATE COUPON (ADMIN)
 * ======================================================
 */

/**
 * @swagger
 * /coupons:
 *   post:
 *     summary: Create new coupon (Admin only)
 *     tags: [Coupons]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - code
 *               - discount_type
 *               - discount_value
 *               - expiry_date
 *             properties:
 *               code:
 *                 type: string
 *               discount_type:
 *                 type: string
 *                 enum: [percentage, flat]
 *               discount_value:
 *                 type: number
 *               max_usage:
 *                 type: integer
 *               expiry_date:
 *                 type: string
 *                 format: date-time
 */
router.post(
  "/",
  authenticateToken,
  authorizeRoles("admin"),
  async (req, res) => {
    try {
      const {
        code,
        discount_type,
        discount_value,
        max_usage,
        expiry_date,
      } = req.body;

      if (!code || !discount_type || !discount_value || !expiry_date) {
        return res.status(400).json({
          success: false,
          message: "Missing required fields",
        });
      }

      const couponData = {
        code: code.toUpperCase(),
        discount_type,
        discount_value,
        max_usage: max_usage || null,
        expiry_date,
        usage_count: 0,
        is_active: true,
      };

      const { data, error } = await supabase
        .from("coupons")
        .insert([couponData])
        .select()
        .single();

      if (error) {
        return res.status(400).json({
          success: false,
          message: error.message,
        });
      }

      return res.status(201).json({
        success: true,
        message: "Coupon created successfully",
        data,
      });

    } catch (err) {
      console.error("Coupon Create Error:", err.message);
      return res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }
);

/**
 * ======================================================
 * GET COUPONS (PUBLIC / ADMIN)
 * ======================================================
 */

/**
 * @swagger
 * /coupons:
 *   get:
 *     summary: Get available coupons
 *     tags: [Coupons]
 *     parameters:
 *       - in: query
 *         name: active
 *         schema:
 *           type: boolean
 *         description: Filter active coupons only
 */
router.get("/", async (req, res) => {
  try {
    const active = req.query.active === "true";

    let query = supabase.from("coupons").select("*");

    if (active) {
      query = query.eq("is_active", true);
    }

    const { data, error } = await query;

    if (error) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    return res.status(200).json({
      success: true,
      data,
    });

  } catch (err) {
    console.error("Coupon Fetch Error:", err.message);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

export default router;