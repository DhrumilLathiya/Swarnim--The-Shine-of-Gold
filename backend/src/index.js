import "./loadEnv.js";

import express from "express";
import cors from "cors";
import swaggerUi from "swagger-ui-express";
import swaggerJsdoc from "swagger-jsdoc";

// =============================
// Config + Middleware
// =============================
import { config } from "./config/index.js";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler.js";

const app = express();

// =============================
// Middleware
// =============================
app.use(cors({
  origin: ["http://localhost:8080", "http://localhost:5173", "http://localhost:3000"],
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logger for debugging
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// =============================
// Routes
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
<<<<<<< dhrumil
import productImageRoutes from "./routes/productImages.js";
import categoryRoutes from "./routes/category.js";
import uploadRoutes from "./routes/upload.js";
import couponRoutes from "./routes/coupons.js";
import addressRoutes from "./routes/addresses.js";
=======
import uploadRoutes from "./routes/upload.js";

const app = express();

// =============================
// DEBUG ENV (REMOVE IN PROD)
// =============================
console.log("JWT SECRET =", process.env.SECRET_KEY ? "Loaded ✅" : "Missing ❌");

// =============================
// Middleware
// =============================
app.use(cors({
  origin: ["http://localhost:8080", "http://localhost:5173"],
  credentials: true
}));
>>>>>>> main

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// =============================
// Swagger Config
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
        url: `http://localhost:${config.port}`,
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
// API Routes
// =============================

// Authentication
app.use("/auth", authRoutes);

// Core Catalogue
app.use("/jewellery", jewelleryRoutes);
app.use("/product-variants", productVariantRoutes);
<<<<<<< dhrumil
app.use("/product-images", productImageRoutes);
app.use("/categories", categoryRoutes);
=======
>>>>>>> main
app.use("/rates", ratesRoutes);
app.use("/", productRoutes);

// User Operations
app.use("/user", userRoutes);
app.use("/wishlist", wishlistRoutes);
app.use("/cart", cartRoutes);
app.use("/orders", orderRoutes);
<<<<<<< dhrumil
app.use("/addresses", addressRoutes);

// Admin / AI (if needed)
app.use("/admin", adminRoutes);
app.use("/admin/coupons", couponRoutes);
app.use("/ai", aiRoutes);
app.use("/notifications", notificationRoutes);
app.use("/reviews", reviewsRoutes);
app.use("/coupons", couponRoutes);
=======

// Admin / AI (if needed)
app.use("/admin", adminRoutes);
app.use("/ai", aiRoutes);
app.use("/notifications", notificationRoutes);
app.use("/reviews", reviewsRoutes);
>>>>>>> main

// Uploads
app.use("/upload", uploadRoutes);
app.use("/uploads", express.static("uploads"));

// =============================
// Error Handling (LAST)
// =============================
app.use(notFoundHandler);
app.use(errorHandler);

// =============================
// Start Server
// =============================
const PORT = config.port || 3000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});

export default app;