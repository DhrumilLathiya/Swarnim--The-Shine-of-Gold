import express from "express";
import { supabase } from "../config/database.js";
import { authenticateToken } from "../middleware/auth.js";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Notifications
 *   description: User notification management
 */

/**
 * ======================================================
 * GET USER NOTIFICATIONS
 * ======================================================
 */

/**
 * @swagger
 * /notifications:
 *   get:
 *     summary: Get logged-in user's notifications
 *     tags: [Notifications]
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
 *         description: Number of records per page (default 10)
 *       - in: query
 *         name: unread
 *         schema:
 *           type: boolean
 *         description: Filter only unread notifications
 *     responses:
 *       200:
 *         description: Notifications fetched successfully
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get("/", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.user_id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized: Invalid token payload",
      });
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const unread = req.query.unread === "true";

    const from = (page - 1) * limit;
    const to = from + limit - 1;

    let query = supabase
      .from("notifications")
      .select("*", { count: "exact" })
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .range(from, to);

    if (unread) {
      query = query.eq("is_read", false);
    }

    const { data, error, count } = await query;

    if (error) {
      console.error("Notification Fetch Error:", error.message);
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
    console.error("Server Error:", err.message);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

/**
 * ======================================================
 * MARK NOTIFICATION AS READ
 * ======================================================
 */

/**
 * @swagger
 * /notifications/{id}/read:
 *   patch:
 *     summary: Mark notification as read
 *     tags: [Notifications]
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
 *         description: Notification marked as read
 *       404:
 *         description: Notification not found
 */
router.patch("/:id/read", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.user_id;
    const { id } = req.params;

    const { data, error } = await supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("id", id)
      .eq("user_id", userId)
      .select()
      .single();

    if (error || !data) {
      return res.status(404).json({
        success: false,
        message: "Notification not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Notification marked as read",
      data,
    });

  } catch (err) {
    console.error("Mark Read Error:", err.message);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

/**
 * ======================================================
 * DELETE NOTIFICATION
 * ======================================================
 */

/**
 * @swagger
 * /notifications/{id}:
 *   delete:
 *     summary: Delete notification
 *     tags: [Notifications]
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
 *         description: Notification deleted
 *       404:
 *         description: Notification not found
 */
router.delete("/:id", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.user_id;
    const { id } = req.params;

    const { error } = await supabase
      .from("notifications")
      .delete()
      .eq("id", id)
      .eq("user_id", userId);

    if (error) {
      return res.status(404).json({
        success: false,
        message: "Notification not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Notification deleted successfully",
    });

  } catch (err) {
    console.error("Delete Error:", err.message);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

export default router;