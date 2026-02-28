import express from "express";
import { supabase } from "../config/database.js";
import { authorizeRoles } from "../middleware/roleMiddleware.js";
import { authenticateToken } from "../middleware/auth.js";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Jewellery
 *   description: Jewellery catalogue management (Design level)
 */


/**
 * ==========================================================
 * 1️⃣ GET ALL JEWELLERY (Public)
 * ==========================================================
 */

/**
 * @swagger
 * /jewellery:
 *   get:
 *     summary: Get all active jewellery (Paginated)
 *     tags: [Jewellery]
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           example: 20
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           example: 0
 *     responses:
 *       200:
 *         description: List of jewellery items
 *       500:
 *         description: Server error
 */
router.get("/", async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit) || 20, 100);
    const offset = parseInt(req.query.offset) || 0;

    const { data, error } = await supabase
      .from("jewellery_products")
      .select("*")
      .eq("is_active", true)
      .range(offset, offset + limit - 1)
      .order("created_at", { ascending: false });

    if (error) throw error;

    return res.json({
      count: data.length,
      items: data
    });

  } catch (err) {
    return res.status(500).json({
      error: "Failed to fetch jewellery",
      detail: err.message
    });
  }
});


/**
 * ==========================================================
 * 2️⃣ GET SINGLE JEWELLERY
 * ==========================================================
 */

/**
 * @swagger
 * /jewellery/{id}:
 *   get:
 *     summary: Get jewellery by ID
 *     tags: [Jewellery]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Jewellery found
 *       404:
 *         description: Jewellery not found
 *       500:
 *         description: Server error
 */
router.get("/:id", async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("jewellery_products")
      .select("*")
      .eq("id", req.params.id)
      .eq("is_active", true)
      .single();

    if (!data) {
      return res.status(404).json({
        error: "Jewellery not found"
      });
    }

    if (error) throw error;

    return res.json(data);

  } catch (err) {
    return res.status(500).json({
      error: "Fetch failed",
      detail: err.message
    });
  }
});


/**
 * ==========================================================
 * 3️⃣ CREATE JEWELLERY (Admin Only)
 * ==========================================================
 */

/**
 * @swagger
 * /jewellery:
 *   post:
 *     summary: Create jewellery (Admin only)
 *     tags: [Jewellery]
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
 *               - category
 *               - image_url
 *             properties:
 *               title:
 *                 type: string
 *               category:
 *                 type: string
 *               description:
 *                 type: string
 *               image_url:
 *                 type: string
 *           example:
 *             title: "Royal Gold Ring"
 *             category: "ring"
 *             description: "Premium handcrafted ring"
 *             image_url: "https://example.com/ring.jpg"
 *     responses:
 *       201:
 *         description: Jewellery created successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       500:
 *         description: Server error
 */
router.post(
  "/",
  authenticateToken,
  authorizeRoles("admin"),
  async (req, res) => {
    try {
      const { title, category, description, image_url } = req.body;

      if (!title || !category || !image_url) {
        return res.status(400).json({
          error: "title, category and image_url are required"
        });
      }

      const { data, error } = await supabase
        .from("jewellery_products")
        .insert([{
          title,
          category,
          description,
          image_url,
          is_active: true
        }])
        .select()
        .single();

      if (error) throw error;

      return res.status(201).json({
        message: "Jewellery created successfully",
        item: data
      });

    } catch (err) {
      return res.status(500).json({
        error: "Creation failed",
        detail: err.message
      });
    }
  }
);


/**
 * ==========================================================
 * 4️⃣ UPDATE JEWELLERY (Admin Only)
 * ==========================================================
 */

/**
 * @swagger
 * /jewellery/{id}:
 *   put:
 *     summary: Update jewellery (Admin only)
 *     tags: [Jewellery]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           example:
 *             title: "Updated Gold Ring"
 *             description: "Updated description"
 *     responses:
 *       200:
 *         description: Jewellery updated successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       500:
 *         description: Server error
 */
router.put(
  "/:id",
  authenticateToken,
  authorizeRoles("admin"),
  async (req, res) => {
    try {
      const { data, error } = await supabase
        .from("jewellery_products")
        .update({
          ...req.body,
          updated_at: new Date()
        })
        .eq("id", req.params.id)
        .select()
        .single();

      if (error) throw error;

      return res.json({
        message: "Jewellery updated successfully",
        item: data
      });

    } catch (err) {
      return res.status(500).json({
        error: "Update failed",
        detail: err.message
      });
    }
  }
);


/**
 * ==========================================================
 * 5️⃣ SOFT DELETE JEWELLERY (Admin Only)
 * ==========================================================
 */

/**
 * @swagger
 * /jewellery/{id}:
 *   delete:
 *     summary: Soft delete jewellery (Admin only)
 *     tags: [Jewellery]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Jewellery deleted successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       500:
 *         description: Server error
 */
router.delete(
  "/:id",
  authenticateToken,
  authorizeRoles("admin"),
  async (req, res) => {
    try {
      await supabase
        .from("jewellery_products")
        .update({ is_active: false })
        .eq("id", req.params.id);

      return res.json({
        message: "Jewellery deleted successfully"
      });

    } catch (err) {
      return res.status(500).json({
        error: "Delete failed",
        detail: err.message
      });
    }
  }
);

export default router;