import express from "express";
import { supabase } from "../config/database.js";
import { authenticateToken } from "../middleware/auth.js";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Addresses
 */

router.post("/", authenticateToken, async (req, res) => {
  const { data, error } = await supabase
    .from("addresses")
    .insert([{ ...req.body, user_id: req.user.user_id }])
    .select()
    .single();

  if (error) return res.status(400).json({ error: error.message });
  res.json(data);
});

router.get("/", authenticateToken, async (req, res) => {
  const { data, error } = await supabase
    .from("addresses")
    .select("*")
    .eq("user_id", req.user.user_id);

  if (error) return res.status(400).json({ error: error.message });
  res.json(data);
});

export default router;