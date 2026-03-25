import express from "express";
import multer from "multer";
import axios from "axios";
import FormData from "form-data";
import fs from "fs";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import supabaseClient from "../utils/supabaseClient.js";
import { config } from "../config/index.js";
import { authenticateToken } from "../middleware/auth.js";
import { uploadFileToSupabase, saveDesignMetadata } from "../utils/supabaseStorage.js";

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
      const { apiUrl, modelId, version, apiKey } = config.roboflow;
      const inferenceUrl = `${apiUrl}/${modelId}/${version}?api_key=${apiKey}`;

      const response = await axios.post(inferenceUrl, form, {
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

/**
 * @swagger
 * /ai/segment:
 *   post:
 *     summary: Segment an image URL using Roboflow
 *     tags: [AI]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               image_url:
 *                 type: string
 *     responses:
 *       200:
 *         description: Segmentation successful
 */
router.post("/segment", async (req, res) => {
  try {
    const { image_url } = req.body;

    if (!image_url) {
      return res.status(400).json({ error: "image_url is required" });
    }

    // Extract filename from URL
    const filename = image_url.split("/").pop().split("?")[0];
    let filePath = path.join(process.cwd(), "uploads", filename);

    // If file doesn't exist locally, and it's an external URL, download it
    if (!fs.existsSync(filePath) && image_url.startsWith("http")) {
      try {
        const imgRes = await axios.get(image_url, { responseType: "arraybuffer" });
        fs.writeFileSync(filePath, Buffer.from(imgRes.data));
      } catch (dlErr) {
        console.error("Download failed for:", image_url, dlErr.message);
        return res.status(404).json({ error: "Image could not be retrieved from URL" });
      }
    }

    if (!fs.existsSync(filePath)) {
      console.error("File not found for segmentation:", filePath);
      return res.status(404).json({ error: "Image file not found" });
    }

    const form = new FormData();
    form.append("file", fs.createReadStream(filePath));

    // ROBFLOW CONFIG
    const { apiUrl, modelId, version, apiKey } = config.roboflow;
    const inferenceUrl = `${apiUrl}/${modelId}/${version}?api_key=${apiKey}`;
    const response = await axios.post(inferenceUrl, form, {
      headers: form.getHeaders(),
    });

    // Roboflow Inference API returns predictions direct in body
    const predictions = response.data?.predictions || [];

    // 3. Cleanup local temporary file
    if (fs.existsSync(filePath)) {
      try {
        fs.unlinkSync(filePath);
      } catch (unlinkErr) {
        console.warn("Failed to delete temp segment file:", unlinkErr.message);
      }
    }

    return res.json({
      predictions: predictions,
    });
  } catch (error) {
    console.error("Segmentation error:", error.response?.data || error.message);
    return res.status(500).json({
      error: "Segmentation failed",
      detail: error.response?.data || error.message,
    });
  }
});

/**
 * @swagger
 * /ai/generate-design:
 *   post:
 *     summary: Generate new jewelry design using Gemini AI (image + prompt)
 *     tags: [AI]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - prompt
 *             properties:
 *               prompt:
 *                 type: string
 *               reference_image_url:
 *                 type: string
 *     responses:
 *       200:
 *         description: Design generated successfully
 */
router.post("/generate-design", async (req, res) => {
  try {
    const { prompt, reference_image_url, original_image_url } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: "Prompt is required" });
    }

    const geminiApiKey = config.gemini?.apiKey;
    if (!geminiApiKey) {
      return res.status(500).json({ error: "Gemini API key not configured" });
    }

    // Build the request parts
    const parts = [];

    // Helper function to process image
    const processImage = async (url) => {
      if (!url) return null;
      try {
        const filename = url.split("/").pop().split("?")[0];
        const filePath = path.join(process.cwd(), "uploads", filename);
        let imageBase64 = null;
        let mimeType = "image/png";

        if (fs.existsSync(filePath)) {
          const imageBuffer = fs.readFileSync(filePath);
          imageBase64 = imageBuffer.toString("base64");
          const ext = path.extname(filename).toLowerCase();
          if (ext === ".jpg" || ext === ".jpeg") mimeType = "image/jpeg";
          else if (ext === ".webp") mimeType = "image/webp";
        } else if (url.startsWith("http")) {
          const imgRes = await axios.get(url, { responseType: "arraybuffer" });
          imageBase64 = Buffer.from(imgRes.data).toString("base64");
          const contentType = imgRes.headers["content-type"];
          if (contentType) mimeType = contentType;
        }
        return { mimeType, data: imageBase64 };
      } catch (err) {
        console.warn(`Could not load image ${url}:`, err.message);
        return null;
      }
    };

    // 1. Add Original Image (if provided)
    const originalImage = await processImage(original_image_url);
    if (originalImage) {
      parts.push({ text: "ORIGINAL JEWELRY REFERENCE (CLEAN):" });
      parts.push({
        inlineData: {
            mimeType: originalImage.mimeType,
            data: originalImage.data,
          },
      });
    }

    // 2. Add Edited/Segmented Image (if provided)
    const segmentedImage = await processImage(reference_image_url);
    if (segmentedImage) {
      parts.push({ text: "MODIFICATION MASK/REFERENCE (SEGMENTED):" });
      parts.push({
        inlineData: {
            mimeType: segmentedImage.mimeType,
            data: segmentedImage.data,
          },
      });
    }

    // Add the text prompt
    parts.push({
      text: `You are a luxury jewelry design AI. 
      
      Inputs provided:
      1. ORIGINAL PHOTO: A clean photo of the base jewelry piece.
      2. MODIFICATION REFERENCE: A version with colored segmentation masks indicating which parts to modify.
      
      Your Task:
      Generate a NEW modified version of the original jewelry piece following these instructions:
      ${prompt}
      
      IMPORTANT: Generate a photorealistic, high-quality luxury jewelry product image. Maintain the same lighting, perspective, and background style as the original photo, but apply the requested modifications precisely where indicated. The output must be a single stunning jewelry photograph.`,
    });

    // Call Gemini API
    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-image-preview:generateContent?key=${geminiApiKey}`;

    console.log("[Gemini] Generating design with prompt:", prompt.substring(0, 100) + "...");

    const geminiResponse = await axios.post(
      geminiUrl,
      {
        contents: [
          {
            parts: parts,
          },
        ],
        generationConfig: {
          responseModalities: ["TEXT", "IMAGE"],
        },
      },
      {
        headers: { "Content-Type": "application/json" },
        timeout: 120000, // 2 minute timeout for image generation
      }
    );

    // Extract the generated image from the response
    const candidates = geminiResponse.data?.candidates;
    if (!candidates || candidates.length === 0) {
      throw new Error("No response from Gemini");
    }

    const responseParts = candidates[0]?.content?.parts || [];
    let generatedImageBase64 = null;
    let generatedMimeType = "image/png";

    for (const part of responseParts) {
      if (part.inlineData) {
        generatedImageBase64 = part.inlineData.data;
        generatedMimeType = part.inlineData.mimeType || "image/png";
        break;
      }
    }

    if (!generatedImageBase64) {
      throw new Error("Gemini did not return an image. Response: " + JSON.stringify(responseParts.map(p => p.text || "[image]")));
    }

    // Save the generated image to uploads folder
    const ext = generatedMimeType.includes("jpeg") ? ".jpg" : generatedMimeType.includes("webp") ? ".webp" : ".png";
    const outputFilename = `gemini-${Date.now()}-${Math.floor(Math.random() * 1000000)}${ext}`;
    const outputPath = path.join(process.cwd(), "uploads", outputFilename);

    fs.writeFileSync(outputPath, Buffer.from(generatedImageBase64, "base64"));
    console.log("[Gemini] Image saved locally:", outputFilename);

    // 1. Upload to Supabase Storage
    let finalImageUrl = `http://localhost:${config.port || 3000}/uploads/${outputFilename}`;
    try {
      const supabaseUrl = await uploadFileToSupabase(outputPath, "designs");
      if (supabaseUrl) finalImageUrl = supabaseUrl;
      console.log("[Supabase] Uploaded to storage:", finalImageUrl);
    } catch (storageErr) {
      console.warn("[Supabase] Storage upload failed, using local URL:", storageErr.message);
    }

    // 2. Save metadata to jewelry_designs table
    try {
      if (req.user?.id) {
        await saveDesignMetadata({
          user_id: req.user.id,
          prompt: prompt,
          original_image_url: original_image_url || null,
          mask_image_url: reference_image_url || null,
          generated_image_url: finalImageUrl
        });
        console.log("[Supabase] Design metadata saved to database");
      }
    } catch (dbErr) {
      console.error("[Supabase] Database save failed:", dbErr.message);
    }

    // 3. Final Cleanup: Delete the local temporary generated file
    if (fs.existsSync(outputPath)) {
        try {
            fs.unlinkSync(outputPath);
        } catch (unlinkErr) {
            console.warn("[Cleanup] Failed to delete generated file:", unlinkErr.message);
        }
    }

    return res.json({
      message: "Design generated successfully",
      image_url: finalImageUrl,
    });
  } catch (error) {
    console.error("[Gemini] Generation error:", error.response?.data || error.message);
    return res.status(500).json({
      error: "Design generation failed",
      detail: error.response?.data?.error?.message || error.message,
    });
  }
});

export default router;
