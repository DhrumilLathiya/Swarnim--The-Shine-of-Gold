import express from "express";
import { supabase } from "../config/database.js";
import { authenticateToken } from "../middleware/auth.js";
import { authorizeRoles } from "../middleware/roleMiddleware.js";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Inventory
 */

router.get("/", authenticateToken, authorizeRoles("admin"), async (req, res) => {
  const { data, error } = await supabase
    .from("inventory_logs")
    .select("*")
    .order("created_at", { ascending: false });

  res.json(data);
});

export default router;