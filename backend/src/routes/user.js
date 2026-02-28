import express from "express";
import { getUserGenerations } from "../models/Generation.js";
import { getUserById, updateUser } from "../models/User.js";
import { authenticateToken } from "../middleware/auth.js";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: User
 *   description: User profile and history management
 */

/**
 * @swagger
 * /user/me:
 *   get:
 *     summary: Get current logged-in user's profile
 *     tags: [User]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: User profile retrieved successfully
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
        error: "User not found"
      });
    }

    delete user.password;

    return res.status(200).json(user);

  } catch (error) {
    return res.status(500).json({
      error: "Internal server error",
      detail: error.message
    });
  }
});

/**
 * @swagger
 * /user/me:
 *   put:
 *     summary: Update current user's profile
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
 *                 example: Raj Mehta
 *               email:
 *                 type: string
 *                 format: email
 *                 example: raj@example.com
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
    let { name, email } = req.body;

    const updates = {};

    if (name) {
      name = name.trim();

      if (name.length < 2 || name.length > 100) {
        return res.status(400).json({
          error: "Name must be between 2 and 100 characters"
        });
      }

      updates.name = name;
    }

    if (email) {
      email = email.trim().toLowerCase();

      if (!validator.isEmail(email)) {
        return res.status(400).json({
          error: "Invalid email format"
        });
      }

      updates.email = email;
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({
        error: "At least one valid field (name or email) is required"
      });
    }

    const updatedUser = await updateUser(user_id, updates);

    delete updatedUser.password;

    return res.status(200).json({
      message: "Profile updated successfully",
      user: updatedUser
    });

  } catch (error) {
    return res.status(500).json({
      error: "Internal server error",
      detail: error.message
    });
  }
});

/**
 * @swagger
 * /user/my-generations:
 *   get:
 *     summary: Get current user's AI generation history
 *     tags: [User]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *         description: Number of records to return (max 100)
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           default: 0
 *         description: Offset for pagination
 *     responses:
 *       200:
 *         description: Generation history retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get("/my-generations", authenticateToken, async (req, res) => {
  try {
    const { user_id } = req.user;

    const limit = Math.min(parseInt(req.query.limit) || 20, 100);
    const offset = parseInt(req.query.offset) || 0;

    const generations = await getUserGenerations(user_id, limit, offset);

    return res.status(200).json({
      count: generations.length,
      limit,
      offset,
      generations
    });

  } catch (error) {
    return res.status(500).json({
      error: "Internal server error",
      detail: error.message
    });
  }
});

export default router;