// Category module: CRUD.
import { Router } from "express";
import { query } from "../db.js";
import { isId, toId, validate, sendValidationError } from "../validate.js";

const router = Router();

const spec = {
  name: { type: "string", required: true, max: 100 },
  description: { type: "string", max: 255 },
};

router.get("/", async (_req, res, next) => {
  try {
    const r = await query(
      `SELECT category_id, name, description FROM category ORDER BY category_id`
    );
    res.json(r.rows);
  } catch (e) {
    next(e);
  }
});

router.get("/:id", async (req, res, next) => {
  try {
    if (!isId(req.params.id)) return res.status(400).json({ error: "Invalid category id" });
    const r = await query(
      `SELECT category_id, name, description FROM category WHERE category_id = $1`,
      [toId(req.params.id)]
    );
    if (r.rowCount === 0) return res.status(404).json({ error: "Category not found" });
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
      `INSERT INTO category (name, description) VALUES ($1, $2)
       RETURNING category_id, name, description`,
      [data.name, data.description]
    );
    res.status(201).json(r.rows[0]);
  } catch (e) {
    next(e);
  }
});

router.put("/:id", async (req, res, next) => {
  try {
    if (!isId(req.params.id)) return res.status(400).json({ error: "Invalid category id" });
    const { errors, data } = validate(req.body, spec);
    if (sendValidationError(res, errors)) return;
    const r = await query(
      `UPDATE category SET name = $1, description = $2 WHERE category_id = $3
       RETURNING category_id, name, description`,
      [data.name, data.description, toId(req.params.id)]
    );
    if (r.rowCount === 0) return res.status(404).json({ error: "Category not found" });
    res.json(r.rows[0]);
  } catch (e) {
    next(e);
  }
});

router.delete("/:id", async (req, res, next) => {
  try {
    if (!isId(req.params.id)) return res.status(400).json({ error: "Invalid category id" });
    const r = await query(`DELETE FROM category WHERE category_id = $1 RETURNING category_id`, [
      toId(req.params.id),
    ]);
    if (r.rowCount === 0) return res.status(404).json({ error: "Category not found" });
    res.json({ message: "Category deleted", category_id: r.rows[0].category_id });
  } catch (e) {
    next(e);
  }
});

export default router;
