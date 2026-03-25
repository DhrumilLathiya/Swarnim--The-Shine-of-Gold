/**
 * JEWELLERY DATA MODEL
 * 
 * PURPOSE: The primary model for managing jewelry product data in Supabase.
 * USAGE: Used across the catalog (src/routes/productRoutes.js) and admin dashboard (src/routes/admin.js).
 */
import { v4 as uuidv4 } from "uuid"; // Generates secure unique IDs for new products
import supabase from "../config/database.js"; // Administrative client for protected product operations

// FETCH ALL: Retrieves a paginated list of catalog items
export const getAllJewellery = async (limit = 50, offset = 0) => {
  const { data, error } = await supabase
    .from("jewellery") // Targeting the main jewellery table
    .select("*")
    .range(offset, offset + limit - 1) // Pagination support
    .order("created_at", { ascending: false }); // Sort by newest items first

  if (error) {
    throw new Error(`Failed to fetch jewellery: ${error.message}`);
  }

  return data;
};

/**
 * Get a single jewellery item by ID
 */
export const getJewelleryById = async (jewelleryId) => {
  const { data, error } = await supabase
    .from("jewellery")
    .select("*")
    .eq("id", jewelleryId)
    .single();

  if (error && error.code !== "PGRST116") {
    throw new Error(`Failed to fetch jewellery: ${error.message}`);
  }

  return data || null;
};

// CREATE: Admin only - Inserts a new luxury item into the database
export const createJewellery = async ({
  title,
  type,
  material,
  price,
  image_url,
  description = null,
}) => {
  const jewelleryId = uuidv4(); // Assign a fresh unique ID

  const { data, error } = await supabase
    .from("jewellery")
    .insert([
      {
        id: jewelleryId,
        title,
        type,
        material,
        price,
        image_url,
        description,
      },
    ])
    .select()
    .single(); // Get the inserted object back directly

  if (error) {
    throw new Error(`Failed to create jewellery: ${error.message}`);
  }

  return data;
};

/**
 * Update a jewellery item (admin only)
 */
export const updateJewellery = async (jewelleryId, updates) => {
  const { data, error } = await supabase
    .from("jewellery")
    .update(updates)
    .eq("id", jewelleryId)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to update jewellery: ${error.message}`);
  }

  return data;
};

/**
 * Delete a jewellery item (admin only)
 */
export const deleteJewellery = async (jewelleryId) => {
  const { error } = await supabase
    .from("jewellery")
    .delete()
    .eq("id", jewelleryId);

  if (error) {
    throw new Error(`Failed to delete jewellery: ${error.message}`);
  }

  return true;
};

/**
 * Search jewellery by title or type
 */
export const searchJewellery = async (query) => {
  const { data, error } = await supabase
    .from("jewellery")
    .select("*")
    .or(`title.ilike.%${query}%,type.ilike.%${query}%`);

  if (error) {
    throw new Error(`Failed to search jewellery: ${error.message}`);
  }

  return data;
};

export default {
  getAllJewellery,
  getJewelleryById,
  createJewellery,
  updateJewellery,
  deleteJewellery,
  searchJewellery,
};