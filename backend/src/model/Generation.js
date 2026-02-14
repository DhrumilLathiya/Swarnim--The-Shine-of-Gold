import { v4 as uuidv4 } from "uuid";
import supabase from "../config/database.js";

/**
 * Create a new generation record
 */
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
    throw new Error(`Failed to create generation: ${error.message}`);
  }

  return data;
};

/**
 * Get all generations for a user
 */
export const getUserGenerations = async (userId, limit = 50, offset = 0) => {
  const { data, error } = await supabase
    .from("generation_history")
    .select("*")
    .eq("user_id", userId)
    .range(offset, offset + limit - 1)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch generations: ${error.message}`);
  }

  return data;
};

/**
 * Get a single generation record by ID
 */
export const getGenerationById = async (generationId) => {
  const { data, error } = await supabase
    .from("generation_history")
    .select("*")
    .eq("id", generationId)
    .single();

  if (error && error.code !== "PGRST116") {
    throw new Error(`Failed to fetch generation: ${error.message}`);
  }

  return data || null;
};

/**
 * Update generation with results
 */
export const updateGeneration = async (generationId, updates) => {
  const { data, error } = await supabase
    .from("generation_history")
    .update({
      ...updates,
      updated_at: new Date(),
    })
    .eq("id", generationId)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to update generation: ${error.message}`);
  }

  return data;
};

/**
 * Get all generations (admin only)
 */
export const getAllGenerations = async (limit = 50, offset = 0) => {
  const { data, error } = await supabase
    .from("generation_history")
    .select("*")
    .range(offset, offset + limit - 1)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch generations: ${error.message}`);
  }

  return data;
};

/**
 * Delete a generation record (admin only)
 */
export const deleteGeneration = async (generationId) => {
  const { error } = await supabase
    .from("generation_history")
    .delete()
    .eq("id", generationId);

  if (error) {
    throw new Error(`Failed to delete generation: ${error.message}`);
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