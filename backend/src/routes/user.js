import express from "express";
import { getUserGenerations } from "../model/Generation.js";
import { getUserById, updateUser } from "../model/User.js";
import { authenticateToken } from "../middleware/auth.js";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: User
 *   description: User profile and history endpoints
 */

/**
 * @swagger
 * /user/me:
 *   get:
 *     summary: Get current user profile
 *     tags: [User]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: User profile data
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: User not found
 */
router.get("/me", authenticateToken, async (req, res) => {
  try {
    const { user_id } = req.user;

    const user = await getUserById(user_id);

    if (!user) {
      return res.status(404).json({
        error: "Not found",
        detail: "User not found",
      });
    }

    const { password, ...userWithoutPassword } = user;

    return res.json(userWithoutPassword);
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return res.status(500).json({
      error: "Internal server error",
      detail: error.message,
    });
  }
});

/**
 * @swagger
 * /user/me:
 *   put:
 *     summary: Update current user profile
 *     tags: [User]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: Raj Mehta Updated
 *               email:
 *                 type: string
 *                 example: raj.new@example.com
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 */
router.put("/me", authenticateToken, async (req, res) => {
  try {
    const { user_id } = req.user;
    const { name, email } = req.body;

    const updates = {};
    if (name) updates.name = name;
    if (email) updates.email = email;

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({
        error: "Validation error",
        detail: "At least one field (name or email) is required",
      });
    }

    const user = await updateUser(user_id, updates);

    const { password, ...userWithoutPassword } = user;

    return res.json({
      message: "Profile updated successfully",
      user: userWithoutPassword,
    });
  } catch (error) {
    console.error("Error updating user profile:", error);
    return res.status(500).json({
      error: "Internal server error",
      detail: error.message,
    });
  }
});

/**
 * @swagger
 * /user/my-generations:
 *   get:
 *     summary: Get current user's generation history
 *     tags: [User]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Number of records to return
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *         description: Offset for pagination
 *     responses:
 *       200:
 *         description: Generation history
 *       401:
 *         description: Unauthorized
 */
router.get("/my-generations", authenticateToken, async (req, res) => {
  try {
    const { user_id } = req.user;
    const limit = parseInt(req.query.limit) || 50;
    const offset = parseInt(req.query.offset) || 0;

    const generations = await getUserGenerations(user_id, limit, offset);

    return res.json({
      count: generations.length,
      generations,
    });
  } catch (error) {
    console.error("Error fetching user generations:", error);
    return res.status(500).json({
      error: "Internal server error",
      detail: error.message,
    });
  }
});

export default router;
