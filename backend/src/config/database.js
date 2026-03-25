/**
 * DATABASE CONFIGURATION
 * 
 * PURPOSE: This file initializes the Supabase client with administrative privileges.
 * USAGE: Used by backend routes (e.g., src/routes/admin.js, src/routes/jewellery.js) 
 * to perform database operations that bypass Row Level Security.
 */
import "./../loadEnv.js"; // Ensures environment variables are loaded before client initialization
import { createClient } from "@supabase/supabase-js"; // Supabase SDK to interact with the database

// EXTRACT CREDENTIALS: Retrieve Supabase URL and Service Role Key from process environment
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;

// VALIDATION: Ensure the required environment variables are present to prevent connection failure
if (!supabaseUrl || !supabaseServiceKey) {
  console.error("❌ ERROR: Missing Supabase environment variables!");
  console.error("Checked for: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY / SUPABASE_SERVICE_KEY");
}

// CLIENT INITIALIZATION: Create and export the Supabase client instance with specific server settings
export const supabase = createClient(
  supabaseUrl,
  supabaseServiceKey,
  {
    auth: {
      autoRefreshToken: false, // Disables automatic token refresh as it's not needed for server-to-server calls
      persistSession: false    // Prevents Supabase from trying to store session data in a local storage/cookie
    }
  }
);

// EXPORT: Default export for easy integration in other backend modules
export default supabase;
