import axios from "axios";
import { supabase } from "../config/database.js";

// No redundant dotenv.config() here, handled in index.js

const GOLD_API_URL = "https://www.goldapi.io/api/XAU/INR";

export async function fetchGoldRate(purity = "24K") {
  try {
    const normalizedPurity = purity.toUpperCase();

    // ---------------------------
    // 1️⃣ Check today's cached rate
    // ---------------------------
    const { data: existingRates, error: fetchError } = await supabase
      .from("metal_rates")
      .select("price_per_gram, fetched_at")
      .eq("metal_type", "gold")
      .eq("purity", normalizedPurity)
      .order("fetched_at", { ascending: false })
      .limit(1);

    if (fetchError) {
      console.error("Rate Fetch Error:", fetchError.message);
    }

    if (existingRates && existingRates.length > 0) {
      const latest = existingRates[0];
      const fetchedDate = new Date(latest.fetched_at).toDateString();
      const today = new Date().toDateString();

      if (fetchedDate === today) {
        return Number(latest.price_per_gram);
      }
    }

    // ---------------------------
    // 2️⃣ Fetch from GoldAPI
    // ---------------------------

    const response = await axios.get(GOLD_API_URL, {
      headers: {
        "x-access-token": process.env.GOLD_API_KEY
      },
      timeout: 5000
    });

    const data = response.data;

    let pricePerGram =
      normalizedPurity === "22K"
        ? data.price_gram_22k
        : data.price_gram_24k;

    if (!pricePerGram && data.price) {
      // fallback ounce conversion
      pricePerGram = data.price / 31.1035;
    }

    if (!pricePerGram || isNaN(pricePerGram)) {
      throw new Error("Invalid gold rate received from API");
    }

    pricePerGram = Number(pricePerGram);

    // ---------------------------
    // 3️⃣ Save snapshot
    // ---------------------------
    await supabase.from("metal_rates").insert({
      metal_type: "gold",
      purity: normalizedPurity,
      price_per_gram: pricePerGram,
      source: "goldapi.io"
    });

    return pricePerGram;

  } catch (error) {
    console.error("🔴 Gold API Error:", error.message);

    // FALLBACK: If API fails, try to return the LATEST available rate from DB
    // even if it's not from "today", or return 0 to prevent crash.
    console.warn("⚠️ Using fallback gold rate (0) to prevent application crash.");
    return 0;
  }
}
