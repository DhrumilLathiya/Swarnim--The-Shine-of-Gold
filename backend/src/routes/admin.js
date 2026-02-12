import express from "express";
import { authenticateToken } from "../middleware/auth.js";
import { authorizeRoles } from "../middleware/roleMiddleware.js";
import { getAllUsers } from "../models/User.js";
import {
  createJewellery,
  updateJewellery,
  deleteJewellery,
} from "../models/Jewellery.js";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Admin
 *   description: Admin-only endpoints
 */

/**
 * ======================================================
 * GET ALL USERS (ADMIN ONLY)
 * ======================================================
 */
/**
 * @swagger
 * /admin/users:
 *   get:
 *     summary: Get all users (Admin only)
 *     tags: [Admin]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: List of users
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (Admin only)
 */
router.get(
  "/users",
  authenticateToken,
  authorizeRoles("ADMIN"),
  async (req, res) => {
    try {
      const users = await getAllUsers();
      return res.json({
        count: users.length,
        users,
      });
    } catch (error) {
      return res.status(500).json({
        error: "Internal server error",
        detail: error.message,
      });
    }
  }
);

/**
 * ======================================================
 * CREATE JEWELLERY (ADMIN ONLY)
 * ======================================================
 */
/**
 * @swagger
 * /admin/jewellery:
 *   post:
 *     summary: Create jewellery (Admin only)
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
 *               - title
 *               - type
 *               - material
 *               - price
 *             properties:
 *               title:
 *                 type: string
 *                 example: Diamond Ring
 *               type:
 *                 type: string
 *                 example: ring
 *               material:
 *                 type: string
 *                 example: gold
 *               price:
 *                 type: number
 *                 example: 75000
 *               image_url:
 *                 type: string
 *                 example: https://example.com/ring.jpg
 *               description:
 *                 type: string
 *                 example: Luxury diamond ring
 *     responses:
 *       201:
 *         description: Jewellery created successfully
 *       400:
 *         description: Validation error
 */
router.post(
  "/jewellery",
  authenticateToken,
  authorizeRoles("ADMIN"),
  async (req, res) => {
    try {
      const { title, type, material, price, image_url, description } =
        req.body;

      if (!title || !type || !material || !price) {
        return res.status(400).json({
          error: "Validation error",
          detail: "title, type, material and price are required",
        });
      }

      const jewellery = await createJewellery({
        title,
        type,
        material,
        price,
        image_url,
        description,
      });

      return res.status(201).json({
        message: "Jewellery created successfully",
        jewellery,
      });
    } catch (error) {
      return res.status(500).json({
        error: "Internal server error",
        detail: error.message,
      });
    }
  }
);

/**
 * ======================================================
 * UPDATE JEWELLERY (ADMIN ONLY)
 * ======================================================
 */
/**
 * @swagger
 * /admin/jewellery/{id}:
 *   put:
 *     summary: Update jewellery (Admin only)
 *     tags: [Admin]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               type:
 *                 type: string
 *               material:
 *                 type: string
 *               price:
 *                 type: number
 *               image_url:
 *                 type: string
 *               description:
 *                 type: string
 *     responses:
 *       200:
 *         description: Jewellery updated successfully
 *       400:
 *         description: Validation error
 */
router.put(
  "/jewellery/:id",
  authenticateToken,
  authorizeRoles("ADMIN"),
  async (req, res) => {
    try {
      const { id } = req.params;
      const updates = req.body;

      if (!updates || Object.keys(updates).length === 0) {
        return res.status(400).json({
          error: "Validation error",
          detail: "Request body cannot be empty",
        });
      }

      const jewellery = await updateJewellery(id, updates);

      return res.json({
        message: "Jewellery updated successfully",
        jewellery,
      });
    } catch (error) {
      return res.status(500).json({
        error: "Internal server error",
        detail: error.message,
      });
    }
  }
);

/**
 * ======================================================
 * DELETE JEWELLERY (ADMIN ONLY)
 * ======================================================
 */
/**
 * @swagger
 * /admin/jewellery/{id}:
 *   delete:
 *     summary: Delete jewellery (Admin only)
 *     tags: [Admin]
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
 *         description: Jewellery deleted successfully
 */
router.delete(
  "/jewellery/:id",
  authenticateToken,
  authorizeRoles("ADMIN"),
  async (req, res) => {
    try {
      const { id } = req.params;

      await deleteJewellery(id);

      return res.json({
        message: "Jewellery deleted successfully",
      });
    } catch (error) {
      return res.status(500).json({
        error: "Internal server error",
        detail: error.message,
      });
    }
  }
);

export default router;
