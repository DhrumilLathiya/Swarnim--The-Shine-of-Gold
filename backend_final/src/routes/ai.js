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
    const { image_url, category } = req.body;

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

    // ROBOFLOW CONFIG (Dynamic selection for Earrings/Bangles vs Ring/Necklace)
    const isEarringOrBangle =
      category &&
      (category.toLowerCase().includes("earring") ||
       category.toLowerCase().includes("bangle"));

    const { apiUrl, apiKey } = config.roboflow;

    let response;

    if (isEarringOrBangle) {
      // â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
      // Earring / Bangle: uses serverless.roboflow.com with Bearer Auth + base64
      // Model: swarnim_bangle_earring/11 (rfdetr-seg-nano-t1)
      // â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
      const earringModelId = "swarnim_bangle_earring";
      const earringVersion = "11";
      const serverlessUrl = `https://serverless.roboflow.com/${earringModelId}/${earringVersion}`;
      
      console.log(`[Roboflow] Category: '${category}', using SERVERLESS model: '${earringModelId}/${earringVersion}'`);
      
      // Read image file and convert to base64
      const imageBuffer = fs.readFileSync(filePath);
      const base64Image = imageBuffer.toString("base64");

      response = await axios.post(serverlessUrl, base64Image, {
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        timeout: 30000,
      });
    } else {
      // â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
      // Rings / Necklaces: uses detect.roboflow.com with multipart form
      // â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
      const form = new FormData();
      form.append("file", fs.createReadStream(filePath));

      const activeModelId = config.roboflow.modelId;
      const activeVersion = config.roboflow.version;
      const inferenceUrl = `${apiUrl}/${activeModelId}/${activeVersion}?api_key=${apiKey}`;
      console.log(`[Roboflow] Category: '${category || "default"}', using model: '${activeModelId}/${activeVersion}'`);
      
      response = await axios.post(inferenceUrl, form, {
        headers: form.getHeaders(),
        timeout: 30000,
      });
    }

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

    const geminiKey = process.env.GEMINI_API;
    const modelId = "gemini-3.1-flash-image";
    let imageBuffer = null;
    let providerName = "Pollinations.ai";

    // Attempt 1: Google Gemini API (gemini-3.1-flash-image)
    if (geminiKey) {
      try {
        console.log(`[Gemini] Attempting design generation with '${modelId}'...`);
        const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${modelId}:generateImages?key=${geminiKey}`;
        const geminiRes = await axios.post(geminiUrl, {
          prompt: `${prompt}, luxury jewelry, white background, 8k resolution product photo`,
          number_of_images: 1,
          aspect_ratio: "1:1",
          output_mime_type: "image/jpeg"
        }, { timeout: 40000 });

        if (geminiRes.data?.generatedImages?.[0]?.image?.imageBytes) {
          imageBuffer = Buffer.from(geminiRes.data.generatedImages[0].image.imageBytes, "base64");
          providerName = "Gemini 3.1 Flash Image";
          console.log("[Gemini] Successfully generated design image!");
        }
      } catch (geminiErr) {
        const msg = geminiErr.response?.data?.error?.message || geminiErr.message;
        console.warn("[Gemini] API notice:", msg);
        console.log("[Fallback] Using Pollinations.ai Image-to-Image reference model...");
      }
    }

    // Attempt 2: Fallback to Pollinations.ai (Image-to-Image reference with auto-retry)
    if (!imageBuffer) {
      const encodedPrompt = encodeURIComponent(
        `${prompt}, luxury jewelry, white background, professional product photo, 8k photorealistic`
      );
      const seed = Math.floor(Math.random() * 2147483647);
      const refImage = reference_image_url || original_image_url;

      let pollinationsUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=1024&height=1024&nologo=true&seed=${seed}`;
      if (refImage && refImage.startsWith("http")) {
        pollinationsUrl += `&image=${encodeURIComponent(refImage)}`;
        console.log("[Pollinations] Using Image-to-Image reference:", refImage);
      }

      console.log("[Pollinations] Generating design...");
      try {
        const imgRes = await axios.get(pollinationsUrl, {
          responseType: "arraybuffer",
          timeout: 120000,
          headers: { "Accept": "image/*" },
        });

        if (imgRes.data && imgRes.data.byteLength > 1000) {
          imageBuffer = Buffer.from(imgRes.data);
        }
      } catch (pollErr) {
        console.warn("[Pollinations] Reference URL fetch failed, retrying text generation...", pollErr.message);
        // Retry Pollinations without image param
        const fallbackUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=1024&height=1024&nologo=true&seed=${seed}`;
        const imgRes = await axios.get(fallbackUrl, {
          responseType: "arraybuffer",
          timeout: 120000,
          headers: { "Accept": "image/*" },
        });
        if (imgRes.data && imgRes.data.byteLength > 1000) {
          imageBuffer = Buffer.from(imgRes.data);
        }
      }

      if (!imageBuffer || imageBuffer.byteLength < 1000) {
        throw new Error("Pollinations returned empty or invalid image");
      }
    }

    const outputFilename = `design-${Date.now()}-${Math.floor(Math.random() * 1000000)}.jpg`;
    const outputPath = path.join(process.cwd(), "uploads", outputFilename);

    fs.writeFileSync(outputPath, imageBuffer);
    console.log(`[${providerName}] Image saved:`, outputFilename, `(${imageBuffer.byteLength} bytes)`);

    // Upload to Supabase Storage
    let finalImageUrl = `http://localhost:${config.port || 3000}/uploads/${outputFilename}`;
    try {
      const supabaseUrl = await uploadFileToSupabase(outputPath, "designs");
      if (supabaseUrl) finalImageUrl = supabaseUrl;
      console.log("[Supabase] Uploaded:", finalImageUrl);
    } catch (storageErr) {
      console.warn("[Supabase] Upload failed, using local URL:", storageErr.message);
    }

    // Save metadata to database
    try {
      if (req.user?.id) {
        await saveDesignMetadata({
          user_id: req.user.id,
          prompt,
          original_image_url: original_image_url || null,
          mask_image_url: reference_image_url || null,
          generated_image_url: finalImageUrl,
        });
        console.log("[DB] Design metadata saved");
      }
    } catch (dbErr) {
      console.error("[DB] Save failed:", dbErr.message);
    }

    // Cleanup local file
    if (fs.existsSync(outputPath)) {
      try { fs.unlinkSync(outputPath); } catch (_) {}
    }

    return res.json({
      message: "Design generated successfully",
      image_url: finalImageUrl,
      provider: providerName,
    });

  } catch (error) {
    let errorDetail = error.message;
    if (error.response?.data) {
      errorDetail = Buffer.isBuffer(error.response.data)
        ? error.response.data.toString("utf-8")
        : typeof error.response.data === "object"
        ? JSON.stringify(error.response.data)
        : String(error.response.data);
    }
    console.error("[Generate] Error:", errorDetail);
    return res.status(500).json({
      error: "Design generation failed",
      detail: errorDetail,
    });
  }
});
export default router;;