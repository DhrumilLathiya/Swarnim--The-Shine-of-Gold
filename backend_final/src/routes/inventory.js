import express from "express";
import { supabase } from "../config/database.js";
import { authenticateToken } from "../middleware/auth.js";
import { authorizeRoles } from "../middleware/roleMiddleware.js";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Inventory
 *   description: Inventory management and audit logs (Admin only)
 */

/**
 * ======================================================
 * GET INVENTORY LOGS (ADMIN)
 * ======================================================
 */

/**
 * @swagger
 * /inventory:
 *   get:
 *     summary: Get inventory logs (Admin only)
 *     tags: [Inventory]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Page number (default 1)
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Records per page (default 10)
 *       - in: query
 *         name: product_id
 *         schema:
 *           type: string
 *         description: Filter by product ID
 *       - in: query
 *         name: action
 *         schema:
 *           type: string
 *           enum: [created, updated, restocked, reduced]
 *         description: Filter by inventory action
 *     responses:
 *       200:
 *         description: Inventory logs fetched successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (Admin only)
 *       500:
 *         description: Server error
 */
router.get(
  "/",
  authenticateToken,
  authorizeRoles("admin"),
  async (req, res) => {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const productId = req.query.product_id;
      const action = req.query.action;

      const from = (page - 1) * limit;
      const to = from + limit - 1;

      let query = supabase
        .from("inventory_logs")
        .select("*", { count: "exact" })
        .order("created_at", { ascending: false })
        .range(from, to);

      if (productId) {
        query = query.eq("product_id", productId);
      }

      if (action) {
        query = query.eq("action", action);
      }

      const { data, error, count } = await query;

      if (error) {
        console.error("Inventory Fetch Error:", error.message);
        return res.status(400).json({
          success: false,
          message: error.message,
        });
      }

      return res.status(200).json({
        success: true,
        data,
        pagination: {
          page,
          limit,
          total: count,
          totalPages: Math.ceil(count / limit),
        },
      });

    } catch (err) {
      console.error("Inventory Server Error:", err.message);
      return res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }
);

/**
 * ======================================================
 * GET INVENTORY SUMMARY (ADMIN DASHBOARD)
 * ======================================================
 */

/**
 * @swagger
 * /inventory/summary:
 *   get:
 *     summary: Get inventory summary statistics (Admin only)
 *     tags: [Inventory]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Inventory summary retrieved
 */
router.get(
  "/summary",
  authenticateToken,
  authorizeRoles("admin"),
  async (req, res) => {
    try {
      const { data, error } = await supabase
        .from("products")
        .select("stock_quantity");

      if (error) {
        return res.status(400).json({
          success: false,
          message: error.message,
        });
      }

      const totalProducts = data.length;
      const totalStock = data.reduce(
        (sum, item) => sum + (item.stock_quantity || 0),
        0
      );

      return res.status(200).json({
        success: true,
        data: {
          totalProducts,
          totalStock,
        },
      });

    } catch (err) {
      console.error("Inventory Summary Error:", err.message);
      return res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }
);

export default router;