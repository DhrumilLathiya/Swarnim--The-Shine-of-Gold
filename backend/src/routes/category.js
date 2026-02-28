import express from "express";
import { supabase } from "../config/database.js";
import { authenticateToken } from "../middleware/auth.js";
import { authorizeRoles } from "../middleware/roleMiddleware.js";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Categories
 *   description: Jewellery category management
 */

/* ==========================================================
   1️⃣ CREATE CATEGORY (ADMIN)
========================================================== */

/**
 * @swagger
 * /categories:
 *   post:
 *     summary: Create a new category (Admin only)
 *     tags: [Categories]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *                 example: Rings
 *               description:
 *                 type: string
 *                 example: Gold and diamond rings
 *     responses:
 *       201:
 *         description: Category created successfully
 *       400:
 *         description: Validation error
 */
router.post(
  "/",
  authenticateToken,
  authorizeRoles("admin"),
  async (req, res) => {
    try {
      const { name, description } = req.body;

      if (!name || name.trim().length < 2) {
        return res.status(400).json({
          success: false,
          message: "Category name is required (min 2 characters)"
        });
      }

      const slug = name
        .toLowerCase()
        .trim()
        .replace(/\s+/g, "-");

      // Check uniqueness
      const { data: existing } = await supabase
        .from("categories")
        .select("id")
        .eq("slug", slug)
        .single();

      if (existing) {
        return res.status(400).json({
          success: false,
          message: "Category already exists"
        });
      }

      const { data, error } = await supabase
        .from("categories")
        .insert([
          {
            name: name.trim(),
            description: description || null,
            slug,
            is_active: true
          }
        ])
        .select()
        .single();

      if (error) throw error;

      return res.status(201).json({
        success: true,
        message: "Category created successfully",
        data
      });

    } catch (err) {
      return res.status(500).json({
        success: false,
        message: "Failed to create category",
        detail: err.message
      });
    }
  }
);

/* ==========================================================
   2️⃣ GET ALL CATEGORIES (PUBLIC)
========================================================== */

/**
 * @swagger
 * /categories:
 *   get:
 *     summary: Get all active categories
 *     tags: [Categories]
 *     parameters:
 *       - in: query
 *         name: active
 *         schema:
 *           type: boolean
 *           example: true
 *         description: Filter only active categories
 */
router.get("/", async (req, res) => {
  try {
    const active = req.query.active === "true";

    let query = supabase
      .from("categories")
      .select("*")
      .order("created_at", { ascending: false });

    if (active) {
      query = query.eq("is_active", true);
    }

    const { data, error } = await query;

    if (error) throw error;

    return res.status(200).json({
      success: true,
      data
    });

  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch categories",
      detail: err.message
    });
  }
});

/* ==========================================================
   3️⃣ UPDATE CATEGORY (ADMIN)
========================================================== */

/**
 * @swagger
 * /categories/{id}:
 *   put:
 *     summary: Update category (Admin only)
 *     tags: [Categories]
 *     security:
 *       - BearerAuth: []
 */
router.put(
  "/:id",
  authenticateToken,
  authorizeRoles("admin"),
  async (req, res) => {
    try {
      const { id } = req.params;
      const { name, description, is_active } = req.body;

      const updateData = {};

      if (name) {
        updateData.name = name.trim();
        updateData.slug = name
          .toLowerCase()
          .trim()
          .replace(/\s+/g, "-");
      }

      if (description !== undefined)
        updateData.description = description;

      if (is_active !== undefined)
        updateData.is_active = is_active;

      const { data, error } = await supabase
        .from("categories")
        .update(updateData)
        .eq("id", id)
        .select()
        .single();

      if (error || !data) {
        return res.status(404).json({
          success: false,
          message: "Category not found"
        });
      }

      return res.status(200).json({
        success: true,
        message: "Category updated successfully",
        data
      });

    } catch (err) {
      return res.status(500).json({
        success: false,
        message: "Failed to update category",
        detail: err.message
      });
    }
  }
);

/* ==========================================================
   4️⃣ DELETE CATEGORY (ADMIN - SOFT DELETE)
========================================================== */

/**
 * @swagger
 * /categories/{id}:
 *   delete:
 *     summary: Soft delete category (Admin only)
 *     tags: [Categories]
 *     security:
 *       - BearerAuth: []
 */
router.delete(
  "/:id",
  authenticateToken,
  authorizeRoles("admin"),
  async (req, res) => {
    try {
      const { id } = req.params;

      const { data, error } = await supabase
        .from("categories")
        .update({ is_active: false })
        .eq("id", id)
        .select()
        .single();

      if (error || !data) {
        return res.status(404).json({
          success: false,
          message: "Category not found"
        });
      }

      return res.status(200).json({
        success: true,
        message: "Category deactivated successfully"
      });

    } catch (err) {
      return res.status(500).json({
        success: false,
        message: "Failed to delete category",
        detail: err.message
      });
    }
  }
);

export default router;