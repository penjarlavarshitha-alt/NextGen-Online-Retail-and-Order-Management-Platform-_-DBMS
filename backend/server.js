// NextGen Online Retail and Order Management Platform - Backend API
// Architecture: React Frontend -> Backend API (Express) -> PostgreSQL -> pgAdmin 4

import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import { testConnection } from "./db.js";
import customerRoutes from "./routes/customers.js";
import categoryRoutes from "./routes/categories.js";
import productRoutes from "./routes/products.js";
import inventoryRoutes from "./routes/inventory.js";
import cartRoutes from "./routes/carts.js";
import orderRoutes from "./routes/orders.js";
import paymentRoutes from "./routes/payments.js";
import deliveryRoutes from "./routes/deliveries.js";
import reviewRoutes from "./routes/reviews.js";
import reportRoutes from "./routes/report.js";
import authRoutes from "./routes/auth.js";

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT || 4000);

app.use(cors());
app.use(express.json());

// Health check
app.get("/api/health", async (_req, res) => {
  try {
    const info = await testConnection();

    res.json({
      status: "ok",
      database: info.db,
      time: info.ts,
    });
  } catch (err) {
    res.status(500).json({
      status: "error",
      message: err.message,
    });
  }
});

// Authentication
app.use("/api/auth", authRoutes);

// Customer Management
app.use("/api/customers", customerRoutes);

// Category
app.use("/api/categories", categoryRoutes);

// Product
app.use("/api/products", productRoutes);

// Inventory
app.use("/api/inventory", inventoryRoutes);

// Cart + Cart Item
app.use("/api/carts", cartRoutes);

// Order + Order Item
app.use("/api/orders", orderRoutes);

// Payment
app.use("/api/payments", paymentRoutes);

// Delivery
app.use("/api/deliveries", deliveryRoutes);

// Review
app.use("/api/reviews", reviewRoutes);

// Reports
app.use("/api/reports", reportRoutes);

// Unknown route
app.use((_req, res) => {
  res.status(404).json({
    error: "Route not found",
  });
});

// Central error handler
app.use((err, _req, res, _next) => {
  console.error("ERROR:", err);

  if (err.code === "23505") {
    return res.status(409).json({
      error: "This record already exists (duplicate value)",
    });
  }

  if (err.code === "23503") {
    return res.status(409).json({
      error:
        "Related record missing or still referenced (foreign key constraint)",
    });
  }

  if (err.code === "23514") {
    return res.status(400).json({
      error: "Value not allowed by a database check constraint",
    });
  }

  if (err.code === "42P01") {
    return res.status(500).json({
      error:
        "A required table does not exist. Check your PostgreSQL database.",
    });
  }

  if (err.code === "ECONNREFUSED") {
    return res.status(500).json({
      error: "Cannot connect to PostgreSQL. Is PostgreSQL running?",
    });
  }

  res.status(500).json({
    error: "Internal server error",
    detail: err.message,
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Backend API running on http://localhost:${PORT}`);
});