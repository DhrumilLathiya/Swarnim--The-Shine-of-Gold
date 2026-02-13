import express from "express";
import {
  getAllJewellery,
  getJewelleryById,
  createJewellery,
  updateJewellery,
  deleteJewellery,
  searchJewellery,
} from "../model/Jewellery.js";
import { authenticateToken, adminRequired } from "../middleware/auth.js";

const router = express.Router();

/**
 * GET /jewellery
 * Get all jewellery items with pagination
 */
router.get("/", async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 50;
    const offset = parseInt(req.query.offset) || 0;

    const items = await getAllJewellery(limit, offset);

    return res.json({
      count: items.length,
      items,
    });
  } catch (error) {
    console.error("Error fetching jewellery:", error);
    return res.status(500).json({
      error: "Internal server error",
      detail: error.message,
    });
  }
});

/**
 * GET /jewellery/search
 * Search jewellery by query
 */
router.get("/search", async (req, res) => {
  try {
    const { q } = req.query;

    if (!q) {
      return res.status(400).json({
        error: "Validation error",
        detail: "Query parameter 'q' is required",
      });
    }

    const results = await searchJewellery(q);

    return res.json({
      count: results.length,
      results,
    });
  } catch (error) {
    console.error("Error searching jewellery:", error);
    return res.status(500).json({
      error: "Internal server error",
      detail: error.message,
    });
  }
});

/**
 * GET /jewellery/:id
 * Get a single jewellery item by ID
 */
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const item = await getJewelleryById(id);

    if (!item) {
      return res.status(404).json({
        error: "Not found",
        detail: "Jewellery item not found",
      });
    }

    return res.json(item);
  } catch (error) {
    console.error("Error fetching jewellery:", error);
    return res.status(500).json({
      error: "Internal server error",
      detail: error.message,
    });
  }
});

/**
 * POST /jewellery
 * Create a new jewellery item (admin only)
 */
router.post(
  "/",
  authenticateToken,
  adminRequired,
  async (req, res) => {
    try {
      const { title, type, material, price, image_url, description } = req.body;

      // Validate input
      if (!title || !type || !material || !price || !image_url) {
        return res.status(400).json({
          error: "Validation error",
          detail: "title, type, material, price, and image_url are required",
        });
      }

      const item = await createJewellery({
        title,
        type,
        material,
        price: parseFloat(price),
        image_url,
        description,
      });

      return res.status(201).json({
        message: "Jewellery item created successfully",
        item,
      });
    } catch (error) {
      console.error("Error creating jewellery:", error);
      return res.status(500).json({
        error: "Internal server error",
        detail: error.message,
      });
    }
  }
);

/**
 * PUT /jewellery/:id
 * Update a jewellery item (admin only)
 */
router.put(
  "/:id",
  authenticateToken,
  adminRequired,
  async (req, res) => {
    try {
      const { id } = req.params;
      const updates = req.body;

      const item = await updateJewellery(id, updates);

      return res.json({
        message: "Jewellery item updated successfully",
        item,
      });
    } catch (error) {
      console.error("Error updating jewellery:", error);
      return res.status(500).json({
        error: "Internal server error",
        detail: error.message,
      });
    }
  }
);

/**
 * DELETE /jewellery/:id
 * Delete a jewellery item (admin only)
 */
router.delete(
  "/:id",
  authenticateToken,
  adminRequired,
  async (req, res) => {
    try {
      const { id } = req.params;

      await deleteJewellery(id);

      return res.json({
        message: "Jewellery item deleted successfully",
      });
    } catch (error) {
      console.error("Error deleting jewellery:", error);
      return res.status(500).json({
        error: "Internal server error",
        detail: error.message,
      });
    }
  }
);

export default router;