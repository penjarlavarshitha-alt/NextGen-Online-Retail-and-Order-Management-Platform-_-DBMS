// Product module: CRUD. Product -> Category (foreign key).
import { Router } from "express";
import { query } from "../db.js";
import { isId, toId, validate, sendValidationError } from "../validate.js";

const router = Router();

const spec = {
  name: { type: "string", required: true, max: 150 },
  description: { type: "string", max: 500 },
  price: { type: "number", required: true, min: 0 },
  category_id: { type: "int", required: true, min: 1 },
};

const SELECT = `
  SELECT p.product_id, p.name, p.description, p.price, p.category_id,
         c.name AS category_name, p.created_at
  FROM product p
  LEFT JOIN category c ON c.category_id = p.category_id`;

// Optional filter: /api/products?category_id=2
router.get("/", async (req, res, next) => {
  try {
    if (req.query.category_id !== undefined) {
      if (!isId(req.query.category_id))
        return res.status(400).json({ error: "Invalid category_id" });
      const r = await query(`${SELECT} WHERE p.category_id = $1 ORDER BY p.product_id`, [
        toId(req.query.category_id),
      ]);
      return res.json(r.rows);
    }
    const r = await query(`${SELECT} ORDER BY p.product_id`);
    res.json(r.rows);
  } catch (e) {
    next(e);
  }
});

router.get("/:id", async (req, res, next) => {
  try {
    if (!isId(req.params.id)) return res.status(400).json({ error: "Invalid product id" });
    const r = await query(`${SELECT} WHERE p.product_id = $1`, [toId(req.params.id)]);
    if (r.rowCount === 0) return res.status(404).json({ error: "Product not found" });
    res.json(r.rows[0]);
  } catch (e) {
    next(e);
  }
});

router.post("/", async (req, res, next) => {
  try {
    const { errors, data } = validate(req.body, spec);
    if (sendValidationError(res, errors)) return;
    const r = await query(
      `INSERT INTO product (name, description, price, category_id)
       VALUES ($1, $2, $3, $4)
       RETURNING product_id, name, description, price, category_id, created_at`,
      [data.name, data.description, data.price, data.category_id]
    );
    res.status(201).json(r.rows[0]);
  } catch (e) {
    next(e);
  }
});

router.put("/:id", async (req, res, next) => {
  try {
    if (!isId(req.params.id)) return res.status(400).json({ error: "Invalid product id" });
    const { errors, data } = validate(req.body, spec);
    if (sendValidationError(res, errors)) return;
    const r = await query(
      `UPDATE product SET name = $1, description = $2, price = $3, category_id = $4
       WHERE product_id = $5
       RETURNING product_id, name, description, price, category_id, created_at`,
      [data.name, data.description, data.price, data.category_id, toId(req.params.id)]
    );
    if (r.rowCount === 0) return res.status(404).json({ error: "Product not found" });
    res.json(r.rows[0]);
  } catch (e) {
    next(e);
  }
});

router.delete("/:id", async (req, res, next) => {
  try {
    if (!isId(req.params.id)) return res.status(400).json({ error: "Invalid product id" });
    const r = await query(`DELETE FROM product WHERE product_id = $1 RETURNING product_id`, [
      toId(req.params.id),
    ]);
    if (r.rowCount === 0) return res.status(404).json({ error: "Product not found" });
    res.json({ message: "Product deleted", product_id: r.rows[0].product_id });
  } catch (e) {
    next(e);
  }
});

export default router;
