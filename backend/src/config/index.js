/**
 * CENTRAL APPLICATION CONFIGURATION
 * 
 * PURPOSE: Consolidates all environment variables into a single, organized configuration object.
 * USAGE: Imported by almost every backend file (e.g., src/index.js, src/routes/*, src/middleware/*) 
 * to access settings for the server, DB, AI, and Mail.
 */
import "./../loadEnv.js"; // Loads environment variables from .env file via the central loadEnv helper

// CONFIG OBJECT: Maps raw process.env values to a structured hierarchy for easier access
export const config = {
  // SERVER SETTINGS: Defines the port and environment (development/production) for Express
  port: process.env.PORT || 3000,
  nodeEnv: process.env.NODE_ENV || "development",

  // SUPABASE CREDENTIALS: Connection info for database and file storage
  supabase: {
    url: process.env.SUPABASE_URL,
    anonKey: process.env.SUPABASE_ANON_KEY,
    serviceKey: process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY,
  },

  // AUTH SECURITY: Settings for JSON Web Token (JWT) generation and validation
  jwt: {
    secret: process.env.SECRET_KEY, // The secret key used to sign tokens
    expiresIn: process.env.JWT_EXPIRY || "24h", // Token lifespan
  },

  // ROBOFLOW AI: Configuration for the image segmentation model
  roboflow: {
    apiUrl: process.env.ROBOFLOW_API_URL || "https://detect.roboflow.com",
    apiKey: process.env.ROBOFLOW_API_KEY,
    modelId: process.env.ROBOFLOW_MODEL_ID,
    version: process.env.ROBOFLOW_VERSION,
    earringModelId: process.env.ROBOFLOW_EARRING_MODEL_ID || "swarnim_bangle_earring",
    earringVersion: process.env.ROBOFLOW_EARRING_VERSION || "1",
  },

  // GOOGLE GEMINI: API key for the generative AI features
  gemini: {
    apiKey: process.env.GEMINI_API,
  },

  // BLACK FOREST LABS (FLUX): High-quality AI image generation
  bfl: {
    apiKey: process.env.BFL_API_KEY,
  },

  // MAIL SERVICE: SMTP settings for sending transactional emails (OTP, etc.)
  mail: {
    host: process.env.MAIL_HOST || "smtp.gmail.com",
    port: process.env.MAIL_PORT || 587,
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
    frontendUrl: process.env.FRONTEND_URL || "http://localhost:5173",
  },
};

// CONFIG VALIDATOR: Iterates through essential variables to warn if they are missing at startup
const requiredEnvVars = [
  "SUPABASE_URL",
  "SUPABASE_ANON_KEY",
  "SECRET_KEY",
  "ROBOFLOW_API_KEY",
  "MAIL_USER",
  "MAIL_PASS",
];

for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    console.warn(`⚠️ Warning: Missing required environment variable: ${envVar}`);
  }
}

// DEFAULT EXPORT: Allows importing the entire config object in other files
export default config;
