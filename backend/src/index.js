import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import swaggerUi from "swagger-ui-express";
import swaggerJsdoc from "swagger-jsdoc";

import { config } from "./config/index.js";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler.js";

// Routes
import authRoutes from "./routes/auth.js";
import jewelleryRoutes from "./routes/jewellery.js";
import userRoutes from "./routes/user.js";
import aiRoutes from "./routes/ai.js";
import adminRoutes from "./routes/admin.js";

// Load environment variables
dotenv.config();

const app = express();

// =============================
// Middleware
// =============================
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

// =============================
// Swagger Configuration
// =============================
const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Swarnim Jewellery AI API",
      version: "1.0.0",
      description: "Backend API documentation for Swarnim AI platform",
    },
    servers: [
      {
        url: `http://localhost:${config.port || 3000}`,
      },
    ],
    components: {
      securitySchemes: {
        BearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
    security: [
      {
        BearerAuth: [],
      },
    ],
  },
  apis: ["./src/routes/*.js"],
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// =============================
// Health Routes
// =============================
app.get("/", (req, res) => {
  res.json({ message: "Swarnim Jewellery AI Backend Running" });
});

app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    message: "Server is healthy",
    timestamp: new Date().toISOString(),
  });
});

// =============================
// API Routes
// =============================
app.use("/auth", authRoutes);
app.use("/jewellery", jewelleryRoutes);
app.use("/user", userRoutes);
app.use("/ai", aiRoutes);
app.use("/admin", adminRoutes);

// =============================
// Error Handling
// =============================
app.use(notFoundHandler);
app.use(errorHandler);

// =============================
// Start Server
// =============================
const PORT = config.port || 3000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📚 API Docs: http://localhost:${PORT}/api-docs`);
  console.log(`Environment: ${config.nodeEnv}`);
});

export default app;
