import { supabase } from "../config/database.js";

/* ==========================================================
   VALID STATUS
========================================================== */

const VALID_STATUS = ["pending", "processing", "completed", "failed"];

/* ==========================================================
   CREATE GENERATION
========================================================== */

export const createGeneration = async ({
  user_id,
  uploaded_image_url,
  result_image_url = null,
  ai_result = null,
  status = "pending",
}) => {
  const generationId = uuidv4();

  const { data, error } = await supabase
    .from("generation_history")
    .insert([
      {
        id: generationId,
        user_id,
        uploaded_image_url,
        result_image_url,
        ai_result,
        status,
        created_at: new Date(),
      },
    ])
    .select()
    .single();

  if (error) {
    throw new Error(`Create failed: ${error.message}`);
  }

  return data;
};

/* ==========================================================
   GET USER GENERATIONS (Paginated)
========================================================== */

export const getUserGenerations = async (
  userId,
  limit = 20,
  offset = 0
) => {
  const { data, error, count } = await supabase
    .from("generation_history")
    .select("*", { count: "exact" })
    .eq("user_id", userId)
    .range(offset, offset + limit - 1)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(`Fetch failed: ${error.message}`);
  }

  return {
    total: count,
    data
  };
};

/* ==========================================================
   GET SINGLE GENERATION
========================================================== */

export const getGenerationById = async (generationId) => {
  const { data, error } = await supabase
    .from("generation_history")
    .select("*")
    .eq("id", generationId)
    .maybeSingle();

  if (error) {
    throw new Error(`Fetch failed: ${error.message}`);
  }

  return data || null;
};

/* ==========================================================
   UPDATE GENERATION
========================================================== */

export const updateGeneration = async (generationId, updates) => {
  if (updates.status && !VALID_STATUS.includes(updates.status)) {
    throw new Error("Invalid status value");
  }

  const { data, error } = await supabase
    .from("generation_history")
    .update({
      ...updates,
      updated_at: new Date()
    })
    .eq("id", generationId)
    .select()
    .single();

  if (error) {
    throw new Error(`Update failed: ${error.message}`);
  }

  return data;
};

/* ==========================================================
   GET ALL GENERATIONS (Admin)
========================================================== */

export const getAllGenerations = async (
  limit = 50,
  offset = 0
) => {
  const { data, error, count } = await supabase
    .from("generation_history")
    .select("*", { count: "exact" })
    .range(offset, offset + limit - 1)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(`Fetch failed: ${error.message}`);
  }

  return {
    total: count,
    data
  };
};

/* ==========================================================
   DELETE GENERATION (Admin)
========================================================== */

export const deleteGeneration = async (generationId) => {
  const { error } = await supabase
    .from("generation_history")
    .delete()
    .eq("id", generationId);

  if (error) {
    throw new Error(`Delete failed: ${error.message}`);
  }

  return true;
};

export default {
  createGeneration,
  getUserGenerations,
  getGenerationById,
  updateGeneration,
  getAllGenerations,
  deleteGeneration,
};