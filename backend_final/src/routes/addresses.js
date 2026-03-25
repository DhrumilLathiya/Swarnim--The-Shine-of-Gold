/**
 * USER ADDRESS MANAGEMENT ROUTES
 * 
 * PURPOSE: Handles the storage, retrieval, and updates of user shipping addresses.
 * USAGE: Targeted by user profile settings and checkout address selection components.
 */
import express from "express";
import { supabase } from "../config/database.js"; // Connection for address table operations
import { authenticateToken } from "../middleware/auth.js"; // Restricts access to authenticated users

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Addresses
 *   description: User address management
 */

/* ==========================================================
   1️⃣ CREATE ADDRESS
========================================================== */

/**
 * @swagger
 * /addresses:
 *   post:
 *     summary: Add new address
 *     tags: [Addresses]
 *     security:
 *       - BearerAuth: []
 */
// CREATE ADDRESS: Adds a new shipping destination and handles default address logic
router.post("/", authenticateToken, async (req, res) => {
  try {
    const user_id = req.user.user_id;
    const {
      full_name,
      phone,
      line1,
      line2,
      city,
      state,
      postal_code,
      country,
      is_default = false
    } = req.body;

    // REQUIRED FIELDS: Ensure critical shipping details are provided
    if (!full_name || !phone || !line1 || !city || !state || !postal_code) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields"
      });
    }

    // DEFAULT LOGIC: If this new address is set as default, clear existing default flag for other addresses
    if (is_default) {
      await supabase
        .from("addresses")
        .update({ is_default: false })
        .eq("user_id", user_id);
    }

    // PERSISTENCE: Save the new address linked to the authenticated user's ID
    const { data, error } = await supabase
      .from("addresses")
      .insert([
        {
          user_id,
          full_name,
          phone,
          line1,
          line2,
          city,
          state,
          postal_code,
          country,
          is_default
        }
      ])
      .select()
      .single();

    if (error) throw error;

    return res.status(201).json({
      success: true,
      message: "Address added successfully",
      data
    });

  } catch (err) {
    console.error("DEBUG: Failed to add address error:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to add address",
      detail: err.message
    });
  }
});

/* ==========================================================
   2️⃣ GET USER ADDRESSES
========================================================== */

router.get("/", authenticateToken, async (req, res) => {
  try {
    const user_id = req.user.user_id;

    const { data, error } = await supabase
      .from("addresses")
      .select("*")
      .eq("user_id", user_id)
      .order("created_at", { ascending: false });

    if (error) throw error;

    return res.status(200).json({
      success: true,
      data
    });

  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch addresses",
      detail: err.message
    });
  }
});

/* ==========================================================
   3️⃣ UPDATE ADDRESS
========================================================== */

router.put("/:id", authenticateToken, async (req, res) => {
  try {
    const user_id = req.user.user_id;
    const { id } = req.params;
    const updates = { ...req.body };

    delete updates.user_id;
    delete updates.created_at;

    const { data, error } = await supabase
      .from("addresses")
      .update(updates)
      .eq("id", id)
      .eq("user_id", user_id)
      .select()
      .single();

    if (error || !data) {
      return res.status(404).json({
        success: false,
        message: "Address not found"
      });
    }

    return res.status(200).json({
      success: true,
      message: "Address updated successfully",
      data
    });

  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Update failed",
      detail: err.message
    });
  }
});

/* ==========================================================
   4️⃣ DELETE ADDRESS
========================================================== */

router.delete("/:id", authenticateToken, async (req, res) => {
  try {
    const user_id = req.user.user_id;
    const { id } = req.params;

    const { error } = await supabase
      .from("addresses")
      .delete()
      .eq("id", id)
      .eq("user_id", user_id);

    if (error) throw error;

    return res.status(200).json({
      success: true,
      message: "Address deleted successfully"
    });

  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Deletion failed",
      detail: err.message
    });
  }
});

export default router;