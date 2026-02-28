import express from "express";
import { supabase } from "../config/database.js";
import { authenticateToken } from "../middleware/auth.js";
import { authorizeRoles } from "../middleware/roleMiddleware.js";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Coupons
 */

router.post("/", authenticateToken, authorizeRoles("admin"), async (req, res) => {
  const { data, error } = await supabase
    .from("coupons")
    .insert([req.body])
    .select()
    .single();

  if (error) return res.status(400).json({ error: error.message });
  res.json(data);
});

router.get("/", async (req, res) => {
  const { data, error } = await supabase.from("coupons").select("*");
  res.json(data);
});

export default router;