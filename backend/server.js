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

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT || 4000);

app.use(cors()); // allow the React frontend to call this API
app.use(express.json()); // parse JSON request bodies

// Health check: confirms the API is up and PostgreSQL is reachable
app.get("/api/health", async (_req, res) => {
  try {
    const info = await testConnection();
    res.json({ status: "ok", database: info.db, time: info.ts });
  } catch (err) {
    res.status(500).json({ status: "error", message: err.message });
  }
});

// Modules
app.use("/api/customers", customerRoutes); // 1. Customer Management
app.use("/api/categories", categoryRoutes); // 2. Category
app.use("/api/products", productRoutes); // 3. Product
app.use("/api/inventory", inventoryRoutes); // 4. Inventory
app.use("/api/carts", cartRoutes); // 5 & 6. Cart + Cart_Item
app.use("/api/orders", orderRoutes); // 7 & 8. Order + Order_Item
app.use("/api/payments", paymentRoutes); // 9. Payment
app.use("/api/deliveries", deliveryRoutes); // 10. Delivery
app.use("/api/reviews", reviewRoutes); // 11. Review

// Unknown route
app.use((_req, res) => res.status(404).json({ error: "Route not found" }));

// Central error handler - converts PostgreSQL errors into clean API responses
app.use((err, _req, res, _next) => {
  console.error(err);

  if (err.code === "23505") {
    return res.status(409).json({ error: "This record already exists (duplicate value)" });
  }
  if (err.code === "23503") {
    return res
      .status(409)
      .json({ error: "Related record missing or still referenced (foreign key constraint)" });
  }
  if (err.code === "23514") {
    return res.status(400).json({ error: "Value not allowed by a database check constraint" });
  }
  if (err.code === "42P01") {
    return res
      .status(500)
      .json({ error: "A required table does not exist. Run backend/schema.sql in pgAdmin 4." });
  }
  if (err.code === "ECONNREFUSED") {
    return res.status(500).json({ error: "Cannot connect to PostgreSQL. Is the server running?" });
  }

  res.status(500).json({ error: "Internal server error", detail: err.message });
});

app.listen(PORT, () => {
  console.log(`Backend API running on http://localhost:${PORT}`);
});
