import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const router = express.Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import { uploadFileToSupabase } from "../utils/supabaseStorage.js";

// Ensure upload directory exists (as temporary buffer)
const uploadDir = path.join(__dirname, "../../uploads");
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer Config
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    },
});

const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: (req, file, cb) => {
        const filetypes = /jpeg|jpg|png|webp/;
        const mimetype = filetypes.test(file.mimetype);
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

        if (mimetype && extname) {
            return cb(null, true);
        }
        cb(new Error("Only images (jpeg, jpg, png, webp) are allowed"));
    },
});

// Route
router.post("/", upload.single("image"), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: "No image uploaded" });
        }

        const bucket = req.query.bucket || "catalog"; // Default to catalog
        const localFilePath = req.file.path;
        
        // 1. Upload to Supabase
        const supabaseUrl = await uploadFileToSupabase(localFilePath, bucket);

        // 2. Cleanup local temporary file
        fs.unlinkSync(localFilePath);

        res.json({
            message: "Image uploaded successfully to " + bucket,
            imageUrl: supabaseUrl,
        });
    } catch (error) {
        console.error("Upload error:", error);
        res.status(500).json({ error: "Image upload failed", details: error.message });
    }
});

export default router;
