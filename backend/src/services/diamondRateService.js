import { supabase } from "../config/database.js";

export async function getDiamondRate(quality = "VVS1") {
  try {
    const normalizedQuality = quality.toUpperCase();

    const { data, error } = await supabase
      .from("diamond_rates")
      .select("price_per_carat")
      .eq("quality", normalizedQuality)
      .single();

    if (error || !data) {
      throw new Error(`Diamond rate not found for quality: ${normalizedQuality}`);
    }

    return data.price_per_carat;   

  } catch (err) {
    console.error("Diamond Rate Fetch Error:", err.message);
    throw err;
  }
}
