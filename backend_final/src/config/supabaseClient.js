/**
 * SUPABASE CLIENT CONNECTOR
 * 
 * PURPOSE: Provides a pre-configured Supabase client for shared use across the application.
 * USAGE: Used in utility modules (e.g., src/utils/supabaseStorage.js) and routes (e.g., src/routes/upload.js).
 */
import { createClient } from "@supabase/supabase-js"; // Supabase core SDK
import dotenv from "dotenv"; // Utility to load environment variables from .env

dotenv.config(); // MANUALLY TRIGGERS: Ensures .env is loaded specifically if this module is run independently

// CREDENTIAL CHECK: Validates that essential connection parameters are available
if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error("❌ Error: Missing Supabase environment variables (URL/Service Key)");
}

// CLIENT CREATION: Instantiates the Supabase client with Service Role privileges
export const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false, // Disables automatic refreshes for server-side stability
      persistSession: false    // Ensures no session state is saved to the local environment
    }
  }
);
