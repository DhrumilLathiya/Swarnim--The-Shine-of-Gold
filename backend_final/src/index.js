import "./loadEnv.js";

import express from "express";
import cors from "cors";
import swaggerUi from "swagger-ui-express";
import swaggerJsdoc from "swagger-jsdoc";

import { config } from "./config/index.js";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler.js";

const app = express();

// =============================
// ✅ FINAL CORS FIX (CRITICAL)
// =============================
const allowedOrigins = [
  "http://localhost:5173",
  "https://db0dhxt6a9543.cloudfront.net"
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.log("❌ CORS blocked:", origin);
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true
}));

// =============================
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logger
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// =============================
// Routes imports
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
import productImageRoutes from "./routes/productImages.js";
import categoryRoutes from "./routes/category.js";
import uploadRoutes from "./routes/upload.js";
import couponRoutes from "./routes/coupons.js";
import addressRoutes from "./routes/addresses.js";

// =============================
// Swagger
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
        url: process.env.BASE_URL || "http://localhost:3000"
      }
    ]
  },
  apis: ["./src/routes/*.js"]
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// =============================
// Health Routes
// =============================
app.get("/", (req, res) => {
  res.json({ message: "Swarnim Backend Running" });
});

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

// =============================
// Routes
// =============================
app.use("/auth", authRoutes);
app.use("/jewellery", jewelleryRoutes);
app.use("/product-variants", productVariantRoutes);
app.use("/product-images", productImageRoutes);
app.use("/categories", categoryRoutes);
app.use("/rates", ratesRoutes);
app.use("/", productRoutes);

app.use("/user", userRoutes);
app.use("/wishlist", wishlistRoutes);
app.use("/cart", cartRoutes);
app.use("/orders", orderRoutes);
app.use("/addresses", addressRoutes);

app.use("/admin", adminRoutes);
app.use("/admin/coupons", couponRoutes);
app.use("/ai", aiRoutes);
app.use("/notifications", notificationRoutes);
app.use("/reviews", reviewsRoutes);
app.use("/coupons", couponRoutes);

app.use("/upload", uploadRoutes);
app.use("/uploads", express.static("uploads"));

// =============================
// Error Handling
// =============================
app.use(notFoundHandler);
app.use(errorHandler);

// =============================
// Start Server
// =============================
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

export default app;