// Customer module routes: Create, Read, Update, Delete.

import { Router } from "express";
import { query } from "../db.js";

const router = Router();

// ---------- validation ----------

function validateCustomer(body = {}, { partial = false } = {}) {
  const errors = [];
  const data = {};

  const check = (field, value, rules) => {
    if (value === undefined) {
      if (!partial && rules.required) {
        errors.push(`${field} is required`);
      }
      return;
    }

    if (value === null || String(value).trim() === "") {
      if (rules.required) {
        errors.push(`${field} cannot be empty`);
      } else {
        data[field] = null;
      }
      return;
    }

    const v = String(value).trim();

    if (rules.max && v.length > rules.max) {
      errors.push(`${field} must be at most ${rules.max} characters`);
      return;
    }

    if (rules.pattern && !rules.pattern.test(v)) {
      errors.push(`${field} is not valid`);
      return;
    }

    data[field] = v;
  };

  // Name
  check("name", body.name, {
    required: true,
    max: 100,
  });

  // Email
  check("email", body.email, {
    required: true,
    max: 150,
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  });

  // Phone
  check("phone", body.phone, {
    required: false,
    max: 15,
    pattern: /^[0-9+\-\s]{6,15}$/,
  });

  // Address
  check("address", body.address, {
    required: false,
    max: 255,
  });

  return { errors, data };
}

// ---------- GET /api/customers ----------

router.get("/", async (_req, res, next) => {
  try {
    const result = await query(
      `SELECT customer_id, name, email, phone, address, created_at
       FROM customer
       ORDER BY customer_id DESC`
    );

    res.json(result.rows);
  } catch (err) {
    next(err);
  }
});

// ---------- GET /api/customers/:id ----------

router.get("/:id", async (req, res, next) => {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id)) {
      return res.status(400).json({
        error: "Invalid customer id",
      });
    }

    const result = await query(
      `SELECT customer_id, name, email, phone, address, created_at
       FROM customer
       WHERE customer_id = $1`,
      [id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({
        error: "Customer not found",
      });
    }

    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
});

// ---------- POST /api/customers ----------

router.post("/", async (req, res, next) => {
  try {
    console.log("CUSTOMER DATA RECEIVED:", req.body);

    const { errors, data } = validateCustomer(req.body);

    console.log("VALIDATION ERRORS:", errors);
    console.log("VALIDATED DATA:", data);

    if (errors.length > 0) {
      return res.status(400).json({
        error: "Validation failed",
        details: errors,
      });
    }

    const result = await query(
      `INSERT INTO customer (name, email, phone, address)
       VALUES ($1, $2, $3, $4)
       RETURNING customer_id, name, email, phone, address, created_at`,
      [
        data.name,
        data.email,
        data.phone ?? null,
        data.address ?? null,
      ]
    );

    console.log("CUSTOMER SAVED:", result.rows[0]);

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("CUSTOMER INSERT ERROR:", err);
    next(err);
  }
});

// ---------- PUT /api/customers/:id ----------

router.put("/:id", async (req, res, next) => {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id)) {
      return res.status(400).json({
        error: "Invalid customer id",
      });
    }

    const { errors, data } = validateCustomer(req.body);

    if (errors.length > 0) {
      return res.status(400).json({
        error: "Validation failed",
        details: errors,
      });
    }

    const result = await query(
      `UPDATE customer
       SET name = $1,
           email = $2,
           phone = $3,
           address = $4
       WHERE customer_id = $5
       RETURNING customer_id, name, email, phone, address, created_at`,
      [
        data.name,
        data.email,
        data.phone ?? null,
        data.address ?? null,
        id,
      ]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({
        error: "Customer not found",
      });
    }

    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
});

// ---------- DELETE /api/customers/:id ----------

router.delete("/:id", async (req, res, next) => {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id)) {
      return res.status(400).json({
        error: "Invalid customer id",
      });
    }

    const result = await query(
      `DELETE FROM customer
       WHERE customer_id = $1
       RETURNING customer_id`,
      [id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({
        error: "Customer not found",
      });
    }

    res.json({
      message: "Customer deleted",
      customer_id: result.rows[0].customer_id,
    });
  } catch (err) {
    next(err);
  }
});

export default router;