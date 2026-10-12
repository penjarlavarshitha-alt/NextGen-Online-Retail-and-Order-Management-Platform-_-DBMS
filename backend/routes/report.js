// Reports module.
// Provides SQL aggregate reports for sales, products, inventory,
// customers, payments and product ratings.

import { Router } from "express";
import { query } from "../db.js";

const router = Router();

// 1. Sales Summary
router.get("/sales", async (_req, res, next) => {
  try {
    const r = await query(`
      SELECT
        COUNT(order_id) AS total_orders,
        COALESCE(SUM(total_amount), 0) AS total_sales,
        COALESCE(AVG(total_amount), 0) AS average_order_value
      FROM "order"
      WHERE status <> 'Cancelled'
    `);

    res.json(r.rows[0]);
  } catch (e) {
    next(e);
  }
});

// 2. Top Selling Products
router.get("/top-products", async (_req, res, next) => {
  try {
    const r = await query(`
      SELECT
        p.product_id,
        p.name AS product_name,
        SUM(oi.quantity) AS total_quantity_sold,
        COALESCE(SUM(oi.quantity * oi.unit_price), 0) AS total_sales
      FROM order_item oi
      JOIN product p ON p.product_id = oi.product_id
      JOIN "order" o ON o.order_id = oi.order_id
      WHERE o.status <> 'Cancelled'
      GROUP BY p.product_id, p.name
      ORDER BY total_quantity_sold DESC
      LIMIT 10
    `);

    res.json(r.rows);
  } catch (e) {
    next(e);
  }
});

// 3. Low Stock Items
router.get("/low-stock", async (_req, res, next) => {
  try {
    const r = await query(`
      SELECT
        i.inventory_id,
        i.product_id,
        p.name AS product_name,
        i.quantity,
        i.reorder_level,
        i.warehouse_location
      FROM inventory i
      JOIN product p ON p.product_id = i.product_id
      WHERE i.quantity <= i.reorder_level
      ORDER BY i.quantity ASC
    `);

    res.json(r.rows);
  } catch (e) {
    next(e);
  }
});

// 4. Customer Order Count
router.get("/customer-orders", async (_req, res, next) => {
  try {
    const r = await query(`
      SELECT
        c.customer_id,
        c.name AS customer_name,
        COUNT(o.order_id) AS order_count,
        COALESCE(SUM(o.total_amount), 0) AS total_spent
      FROM customer c
      LEFT JOIN "order" o
        ON o.customer_id = c.customer_id
        AND o.status <> 'Cancelled'
      GROUP BY c.customer_id, c.name
      ORDER BY order_count DESC, c.customer_id
    `);

    res.json(r.rows);
  } catch (e) {
    next(e);
  }
});

// 5. Payment Mode Split
router.get("/payment-methods", async (_req, res, next) => {
  try {
    const r = await query(`
      SELECT
        payment_method,
        COUNT(payment_id) AS payment_count,
        COALESCE(SUM(amount), 0) AS total_amount
      FROM payment
      GROUP BY payment_method
      ORDER BY payment_count DESC
    `);

    res.json(r.rows);
  } catch (e) {
    next(e);
  }
});

// 6. Average Product Rating
router.get("/ratings", async (_req, res, next) => {
  try {
    const r = await query(`
      SELECT
        p.product_id,
        p.name AS product_name,
        ROUND(AVG(r.rating), 2) AS average_rating,
        COUNT(r.review_id) AS review_count
      FROM product p
      LEFT JOIN review r ON r.product_id = p.product_id
      GROUP BY p.product_id, p.name
      ORDER BY average_rating DESC NULLS LAST, p.product_id
    `);

    res.json(r.rows);
  } catch (e) {
    next(e);
  }
});

export default router;