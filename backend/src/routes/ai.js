import express from "express";
import multer from "multer";
import axios from "axios";
import FormData from "form-data";
import fs from "fs";
import { v4 as uuidv4 } from "uuid";
import supabase from "../config/database.js";
import { authenticateToken } from "../middleware/auth.js";

const router = express.Router();

// Store uploaded images temporarily
const upload = multer({ dest: "uploads/" });

/**
 * @swagger
 * /ai/generate:
 *   post:
 *     summary: Upload image and generate AI result
 *     tags: [AI]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: AI generation successful
 */
router.post(
  "/generate",
  authenticateToken,
  upload.single("image"),
  async (req, res) => {
    try {
      const userId = req.user.user_id;

      if (!req.file) {
        return res.status(400).json({
          error: "Validation error",
          detail: "Image file is required",
        });
      }

      const form = new FormData();
      form.append("file", fs.createReadStream(req.file.path));

      // ROBFLOW CONFIG
      const workflowUrl = `${process.env.ROBOFLOW_API_URL}/${process.env.ROBOFLOW_WORKSPACE}/${process.env.ROBOFLOW_WORKFLOW}?api_key=${process.env.ROBOFLOW_API_KEY}`;

      const response = await axios.post(workflowUrl, form, {
        headers: form.getHeaders(),
      });

      // Assume Roboflow returns image URL in response
      const resultImageUrl =
        response.data?.result?.image || response.data?.predictions || null;

      if (!resultImageUrl) {
        throw new Error("Invalid response from Roboflow");
      }

      // Save to database
      const { error } = await supabase.from("generation_history").insert([
        {
          id: uuidv4(),
          user_id: userId,
          uploaded_image_url: req.file.filename,
          result_image_url: resultImageUrl,
        },
      ]);

      if (error) throw error;

      // Delete temp file
      fs.unlinkSync(req.file.path);

      return res.json({
        message: "AI generation successful",
        result_image_url: resultImageUrl,
      });
    } catch (error) {
      console.error("Roboflow error:", error.message);

      return res.status(500).json({
        error: "AI generation failed",
        detail: error.message,
      });
    }
  }
);

export default router;
