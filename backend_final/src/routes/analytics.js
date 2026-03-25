import express from "express";
import { supabase } from "../config/database.js";
import { authenticateToken } from "../middleware/auth.js";
import { authorizeRoles } from "../middleware/roleMiddleware.js";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Analytics
 *   description: Admin sales and revenue analytics
 */

/* ==========================================================
   1️⃣ SALES SUMMARY (ADMIN)
========================================================== */

/**
 * @swagger
 * /analytics/sales:
 *   get:
 *     summary: Get sales summary (Admin only)
 *     tags: [Analytics]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: year
 *         schema:
 *           type: integer
 *           example: 2025
 *       - in: query
 *         name: month
 *         schema:
 *           type: integer
 *           example: 6
 *       - in: query
 *         name: from
 *         schema:
 *           type: string
 *           format: date
 *           example: 2025-01-01
 *       - in: query
 *         name: to
 *         schema:
 *           type: string
 *           format: date
 *           example: 2025-12-31
 *     responses:
 *       200:
 *         description: Sales analytics retrieved
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Admin only
 *       500:
 *         description: Server error
 */
router.get(
  "/sales",
  authenticateToken,
  authorizeRoles("admin"),
  async (req, res) => {
    try {
      const { year, month, from, to } = req.query;

      let query = supabase
        .from("sales_summary")
        .select("*")
        .order("year", { ascending: false })
        .order("month", { ascending: false });

      if (year) {
        query = query.eq("year", parseInt(year));
      }

      if (month) {
        query = query.eq("month", parseInt(month));
      }

      if (from) {
        query = query.gte("date", from);
      }

      if (to) {
        query = query.lte("date", to);
      }

      const { data, error } = await query;

      if (error) {
        return res.status(400).json({
          success: false,
          message: error.message
        });
      }

      return res.status(200).json({
        success: true,
        data
      });

    } catch (err) {
      return res.status(500).json({
        success: false,
        message: "Failed to fetch sales analytics",
        detail: err.message
      });
    }
  }
);

/* ==========================================================
   2️⃣ OVERALL STATS (ADMIN DASHBOARD)
========================================================== */

/**
 * @swagger
 * /analytics/overview:
 *   get:
 *     summary: Get overall revenue, order count and average order value
 *     tags: [Analytics]
 *     security:
 *       - BearerAuth: []
 */
router.get(
  "/overview",
  authenticateToken,
  authorizeRoles("admin"),
  async (req, res) => {
    try {
      const { data: orders, error } = await supabase
        .from("orders")
        .select("final_amount");

      if (error) throw error;

      const totalRevenue = orders.reduce(
        (sum, order) => sum + Number(order.final_amount || 0),
        0
      );

      const totalOrders = orders.length;
      const averageOrderValue =
        totalOrders > 0 ? totalRevenue / totalOrders : 0;

      return res.status(200).json({
        success: true,
        data: {
          totalRevenue,
          totalOrders,
          averageOrderValue
        }
      });

    } catch (err) {
      return res.status(500).json({
        success: false,
        message: "Failed to fetch overview",
        detail: err.message
      });
    }
  }
);

export default router;