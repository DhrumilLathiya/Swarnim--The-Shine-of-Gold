import dotenv from "dotenv";

dotenv.config();

export const config = {
  // Server
  port: process.env.PORT || 3000,
  nodeEnv: process.env.NODE_ENV || "development",

  // Supabase
  supabase: {
    url: process.env.SUPABASE_URL,
    anonKey: process.env.SUPABASE_ANON_KEY,
    serviceKey: process.env.SUPABASE_SERVICE_KEY,
  },

  // JWT
  jwt: {
    secret: process.env.SECRET_KEY,
    expiresIn: process.env.JWT_EXPIRY || "24h",
  },

  // Roboflow
  roboflow: {
    apiUrl: process.env.ROBOFLOW_API_URL,
    apiKey: process.env.ROBOFLOW_API_KEY,
    workspace: process.env.ROBOFLOW_WORKSPACE,
    workflow: process.env.ROBOFLOW_WORKFLOW,
  },
};

// Validate required config
const requiredEnvVars = [
  "SUPABASE_URL",
  "SUPABASE_ANON_KEY",
  "SECRET_KEY",
  "ROBOFLOW_API_KEY",
];

for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    console.warn(`Warning: Missing required environment variable: ${envVar}`);
  }
}

export default config;