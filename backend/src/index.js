import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import swaggerUi from "swagger-ui-express";
import swaggerJsdoc from "swagger-jsdoc";

import { config } from "./config/index.js";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler.js";

// =============================
// Route Imports
// =============================
import authRoutes from "./routes/auth.js";
import jewelleryRoutes from "./routes/jewellery.js";
import userRoutes from "./routes/user.js";
import aiRoutes from "./routes/ai.js";
import adminRoutes from "./routes/admin.js";
import cartRoutes from "./routes/cart.js";
import orderRoutes from "./routes/order.js";
import notificationRoutes from "./routes/notification.js";
import wishlistRoutes from "./routes/wishlist.js";
import reviewsRoutes from "./routes/reviews.js";
import ratesRoutes from "./routes/rates.js";
import productVariantRoutes from "./routes/productVariant.js";
import productRoutes from "./routes/productRoutes.js";
import productImagesRoutes from "./routes/productImages.js";

const app = express();

// =============================
// Core Middleware
// =============================
console.log("JWT SECRET =", process.env.SECRET_KEY ? "Loaded ✅" : "Missing ❌");

// =============================
// Middleware
// =============================
app.use(cors({
  origin: true,
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// =============================
// Swagger Configuration
// =============================
const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Swarnim Jewellery AI API",
      version: "1.0.0",
      description: "Backend API documentation for Swarnim AI platform"
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
          bearerFormat: "JWT"
        }
      }
    }
  },
  apis: ["./src/routes/*.js"]
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
    timestamp: new Date().toISOString()
  });
});

// =============================
// API Routes (Structured & Ordered)
// =============================

// Authentication
app.use("/auth", authRoutes);

// Core Catalogue
app.use("/jewellery", jewelleryRoutes);
app.use("/product-variants", productVariantRoutes);   // ✅ FIXED NAME
app.use("/rates", ratesRoutes);
app.use("/products", productRoutes);
app.use("/product-images", productImagesRoutes);

// User Operations
app.use("/user", userRoutes);
app.use("/wishlist", wishlistRoutes);
app.use("/cart", cartRoutes);
app.use("/orders", orderRoutes);
app.use("/reviews", reviewsRoutes);

// Admin
app.use("/admin", adminRoutes);

// AI
app.use("/ai", aiRoutes);

// Product (keep last to avoid route swallowing)
app.use("/products", productRoutes);

// =============================
// Error Handling (MUST BE LAST)
// =============================
app.use(notFoundHandler);
app.use(errorHandler);

// =============================
// Start Server
// =============================
const PORT = config.port || 3000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📚 API Docs available at http://localhost:${PORT}/api-docs`);
});

export default app;