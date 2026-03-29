/**
 * AI GENERATION MODEL
 * 
 * PURPOSE: Manages records of AI-generated designs and their processing history.
 * USAGE: Used by AI routes (e.g., src/routes/ai.js) and user history views to track design tasks.
 */
import { supabase } from "../config/database.js"; // Uses the administrative Supabase client for history logs
import { v4 as uuidv4 } from "uuid";

// STATUS CONSTANTS: Defines the allowed states for an AI generation task
const VALID_STATUS = ["pending", "processing", "completed", "failed"];

// CREATE RECORD: Initializes a new entry in the generation_history table
export const createGeneration = async ({
  user_id,
  uploaded_image_url,
  result_image_url = null,
  ai_result = null,
  status = "pending",
}) => {
  const generationId = uuidv4(); // Generate a unique identifier for the task

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
    .single(); // Ensure we get the created record back immediately

  if (error) {
    throw new Error(`Create failed: ${error.message}`);
  }

  return data;
};

// FETCH USER HISTORY: Retrieves a paginated list of generations for a specific user
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

// FETCH SINGLE RECORD: Retrieves a specific generation record by its ID
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

// UPDATE TASK: Modifies an existing generation record (e.g., when the AI finishes processing)
export const updateGeneration = async (generationId, updates) => {
  // Integrity Check: Only allow updates if the new status is valid
  if (updates.status && !VALID_STATUS.includes(updates.status)) {
    throw new Error("Invalid status value");
  }

  const { data, error } = await supabase
    .from("generation_history")
    .update({
      ...updates,
      updated_at: new Date() // Timestamp the update
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