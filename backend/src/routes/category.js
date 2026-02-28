import express from "express";
import { supabase } from "../config/database.js";
import { authenticateToken } from "../middleware/auth.js";
import { authorizeRoles } from "../middleware/roleMiddleware.js";
import { createCategory, getAllCategories } from "../model/Category.js";

const router = express.Router();

// Admin create
router.post(
  "/",
  authenticateToken,
  authorizeRoles("admin"),
  async (req, res) => {
    const { data, error } = await createCategory(supabase, req.body);

    if (error) return res.status(400).json({ error });
    res.json(data);
  }
);

// Public list
router.get("/", async (req, res) => {
  const { data, error } = await getAllCategories(supabase);

  if (error) return res.status(400).json({ error });
  res.json(data);
});

export default router;