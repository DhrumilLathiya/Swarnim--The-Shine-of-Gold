<<<<<<< dhrumil
/**
 * CATEGORY DATA MODEL
 * 
 * PURPOSE: Handles Supabase interactions for the 'categories' table in the database.
 * USAGE: Used by backend routes (e.g., src/routes/admin.js, src/routes/category.js) to manage jewelry categories.
 */
// CREATE CATEGORY: Inserts a new category record and returns the created object
=======
>>>>>>> main
export const createCategory = async (supabase, data) => {
  return await supabase
    .from("categories")
    .insert([data])
    .select()
    .single();
};

<<<<<<< dhrumil
// FETCH ALL CATEGORIES: Retrieves all categories sorted by most recently created
export const getAllCategories = async (supabase) => {
  return await supabase
    .from("categories") // Targeting the categories table
    .select("*")        // Selecting all columns
    .order("created_at", { ascending: false }); // Latest categories first
=======
export const getAllCategories = async (supabase) => {
  return await supabase
    .from("categories")
    .select("*")
    .order("created_at", { ascending: false });
>>>>>>> main
};