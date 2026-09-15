// Review module: Customer -> Review -> Product.
import { Router } from "express";
import { query } from "../db.js";
import { isId, toId, validate, sendValidationError } from "../validate.js";

const router = Router();

const spec = {
  customer_id: { type: "int", required: true, min: 1 },
  product_id: { type: "int", required: true, min: 1 },
  rating: { type: "int", required: true, min: 1, max: 5 },
  comment: { type: "string", max: 500 },
};

const SELECT = `
  SELECT r.review_id, r.customer_id, c.name AS customer_name,
         r.product_id, p.name AS product_name,
         r.rating, r.comment, r.review_date
  FROM review r
  JOIN customer c ON c.customer_id = r.customer_id
  JOIN product p ON p.product_id = r.product_id`;

router.get("/", async (_req, res, next) => {
  try {
    const r = await query(`${SELECT} ORDER BY r.review_id DESC`);
    res.json(r.rows);
  } catch (e) {
    next(e);
  }
});

router.get("/:id", async (req, res, next) => {
  try {
    if (!isId(req.params.id)) return res.status(400).json({ error: "Invalid review id" });
    const r = await query(`${SELECT} WHERE r.review_id = $1`, [toId(req.params.id)]);
    if (r.rowCount === 0) return res.status(404).json({ error: "Review not found" });
    res.json(r.rows[0]);
  } catch (e) {
    next(e);
  }
});

router.get("/product/:productId", async (req, res, next) => {
  try {
    if (!isId(req.params.productId)) return res.status(400).json({ error: "Invalid product id" });
    const r = await query(`${SELECT} WHERE r.product_id = $1 ORDER BY r.review_id DESC`, [
      toId(req.params.productId),
    ]);
    res.json(r.rows);
  } catch (e) {
    next(e);
  }
});

router.get("/customer/:customerId", async (req, res, next) => {
  try {
    if (!isId(req.params.customerId)) return res.status(400).json({ error: "Invalid customer id" });
    const r = await query(`${SELECT} WHERE r.customer_id = $1 ORDER BY r.review_id DESC`, [
      toId(req.params.customerId),
    ]);
    res.json(r.rows);
  } catch (e) {
    next(e);
  }
});

router.post("/", async (req, res, next) => {
  try {
    const { errors, data } = validate(req.body, spec);
    if (sendValidationError(res, errors)) return;
    const r = await query(
      `INSERT INTO review (customer_id, product_id, rating, comment)
       VALUES ($1, $2, $3, $4)
       RETURNING review_id, customer_id, product_id, rating, comment, review_date`,
      [data.customer_id, data.product_id, data.rating, data.comment]
    );
    res.status(201).json(r.rows[0]);
  } catch (e) {
    next(e);
  }
});

router.put("/:id", async (req, res, next) => {
  try {
    if (!isId(req.params.id)) return res.status(400).json({ error: "Invalid review id" });
    const { errors, data } = validate(req.body, {
      rating: spec.rating,
      comment: spec.comment,
    });
    if (sendValidationError(res, errors)) return;
    const r = await query(
      `UPDATE review SET rating = $1, comment = $2 WHERE review_id = $3 RETURNING *`,
      [data.rating, data.comment, toId(req.params.id)]
    );
    if (r.rowCount === 0) return res.status(404).json({ error: "Review not found" });
    res.json(r.rows[0]);
  } catch (e) {
    next(e);
  }
});

router.delete("/:id", async (req, res, next) => {
  try {
    if (!isId(req.params.id)) return res.status(400).json({ error: "Invalid review id" });
    const r = await query(`DELETE FROM review WHERE review_id = $1 RETURNING review_id`, [
      toId(req.params.id),
    ]);
    if (r.rowCount === 0) return res.status(404).json({ error: "Review not found" });
    res.json({ message: "Review deleted", review_id: r.rows[0].review_id });
  } catch (e) {
    next(e);
  }
});

export default router;
