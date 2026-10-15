import express from "express";
import axios from "axios";
import { supabase } from "../config/database.js";
import { authenticateToken } from "../middleware/auth.js";
import { authorizeRoles } from "../middleware/roleMiddleware.js";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Rates
 *   description: Metal and diamond rate management
 */

/**
 * ======================================================
 * 1️⃣ FETCH LIVE GOLD RATE (24K Base)
 * ======================================================
 */

/**
 * @swagger
 * /rates/gold/live:
 *   get:
 *     summary: Fetch live 24K gold rate and store snapshot
 *     tags: [Rates]
 *     responses:
 *       200:
 *         description: Gold rate stored successfully
 *       500:
 *         description: API failure
 */
router.get("/gold/live", async (req, res) => {
  try {
    const apiKey = process.env.GOLD_API_KEY;

    if (!apiKey) {
      return res.status(500).json({ error: "GOLD_API_KEY not configured" });
    }

    const response = await axios.get(
      "https://www.goldapi.io/api/XAU/INR",
      {
        headers: {
          "x-access-token": apiKey,
          "Content-Type": "application/json"
        }
      }
    );

    if (!response.data?.price) {
      return res.status(500).json({ error: "Invalid API response" });
    }

    const price_per_gram = response.data.price / 31.1035;

    const { data, error } = await supabase
      .from("metal_rates")
      .insert([{
        metal_type: "gold",
        purity: "24K",
        price_per_gram,
        source: "api",
        fetched_at: new Date(),
        effective_date: new Date()
      }])
      .select()
      .single();

    if (error) throw error;

    return res.json({
      message: "Gold rate stored",
      rate: data
    });

  } catch (err) {
    return res.status(500).json({
      error: "Gold API fetch failed",
      detail: err.message
    });
  }
});


/**
 * ======================================================
 * 2️⃣ GET METAL RATE
 * ======================================================
 */

/**
 * @swagger
 * /rates/metal/{metal_type}:
 *   get:
 *     summary: Get latest metal rate with optional purity conversion
 *     tags: [Rates]
 *     parameters:
 *       - in: path
 *         name: metal_type
 *         required: true
 *         schema:
 *           type: string
 *           example: gold
 *       - in: query
 *         name: purity
 *         schema:
 *           type: string
 *           example: 22K
 *     responses:
 *       200:
 *         description: Metal rate returned
 */
router.get("/metal/:metal_type", async (req, res) => {
  try {
    const { metal_type } = req.params;
    const requestedPurity = req.query.purity || "24K";

    const { data: baseRate, error } = await supabase
      .from("metal_rates")
      .select("*")
      .eq("metal_type", metal_type)
      .eq("purity", "24K")
      .order("effective_date", { ascending: false })
      .limit(1)
      .single();

    if (error || !baseRate) {
      return res.status(404).json({
        error: "Base 24K rate not found"
      });
    }

    let finalPrice = baseRate.price_per_gram;

    if (metal_type === "gold" && requestedPurity !== "24K") {
      const purityNumber = parseInt(requestedPurity.replace("K", ""));
      finalPrice = (baseRate.price_per_gram * purityNumber) / 24;
    }

    return res.json({
      metal_type,
      purity: requestedPurity,
      price_per_gram: Number(finalPrice.toFixed(2)),
      source: baseRate.source,
      effective_date: baseRate.effective_date
    });

  } catch (err) {
    return res.status(500).json({
      error: "Internal server error",
      detail: err.message
    });
  }
});


/**
 * ======================================================
 * 3️⃣ ADD MANUAL METAL RATE (ADMIN)
 * ======================================================
 */

/**
 * @swagger
 * /rates/metal:
 *   post:
 *     summary: Add manual metal rate (Admin only)
 *     tags: [Rates]
 *     security:
 *       - BearerAuth: []
 */
router.post(
  "/metal",
  authenticateToken,
  authorizeRoles("admin"),
  async (req, res) => {
    try {
      const { metal_type, purity, price_per_gram } = req.body;

      if (!metal_type || !purity || !price_per_gram) {
        return res.status(400).json({
          error: "metal_type, purity, price_per_gram required"
        });
      }

      const { data, error } = await supabase
        .from("metal_rates")
        .insert([{
          metal_type,
          purity,
          price_per_gram,
          source: "manual",
          fetched_at: new Date(),
          effective_date: new Date()
        }])
        .select()
        .single();

      if (error) throw error;

      return res.status(201).json({
        message: "Rate added successfully",
        rate: data
      });

    } catch (err) {
      return res.status(500).json({
        error: "Insert failed",
        detail: err.message
      });
    }
  }
);


/**
 * ======================================================
 * 4️⃣ DIAMOND RATE (Hardcoded)
 * ======================================================
 */

/**
 * @swagger
 * /rates/diamond/{grade}:
 *   get:
 *     summary: Get diamond rate per carat
 *     tags: [Rates]
 */
router.get("/diamond/:grade", async (req, res) => {
  try {
    const { grade } = req.params;

    const diamondRates = {
      VVS1: 55000,
      VVS2: 50000,
      VS1: 45000,
      VS2: 40000,
      SI1: 35000
    };

    if (!diamondRates[grade]) {
      return res.status(404).json({
        error: "Invalid grade"
      });
    }

    return res.json({
      grade,
      price_per_carat: diamondRates[grade],
      source: "hardcoded"
    });

  } catch (err) {
    return res.status(500).json({
      error: "Internal error",
      detail: err.message
    });
  }
});

export default router;