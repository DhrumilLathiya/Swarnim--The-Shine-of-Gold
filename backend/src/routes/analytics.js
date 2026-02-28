import express from "express";
import { supabase } from "../config/database.js";
import { authenticateToken } from "../middleware/auth.js";
import { authorizeRoles } from "../middleware/roleMiddleware.js";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Analytics
 */

router.get("/sales", authenticateToken, authorizeRoles("admin"), async (req, res) => {
  const { data } = await supabase
    .from("sales_summary")
    .select("*")
    .order("year", { ascending: false });

  res.json(data);
});

export default router;