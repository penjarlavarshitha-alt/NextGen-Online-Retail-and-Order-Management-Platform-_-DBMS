// Inventory module: one inventory row per product (Product -> Inventory).
import { Router } from "express";
import { query } from "../db.js";
import { isId, toId, validate, sendValidationError } from "../validate.js";

const router = Router();

const spec = {
  product_id: { type: "int", required: true, min: 1 },
  quantity: { type: "int", required: true, min: 0 },
  warehouse_location: { type: "string", max: 100 },
  reorder_level: { type: "int", min: 0 },
};

const SELECT = `
  SELECT i.inventory_id,
         i.product_id,
         p.name AS product_name,
         i.quantity,
         i.warehouse_location,
         i.reorder_level,
         i.last_updated
  FROM inventory i
  JOIN product p ON p.product_id = i.product_id`;

router.get("/", async (_req, res, next) => {
  try {
    const r = await query(`${SELECT} ORDER BY i.inventory_id`);
    res.json(r.rows);
  } catch (e) {
    next(e);
  }
});

router.get("/:id", async (req, res, next) => {
  try {
    if (!isId(req.params.id)) {
      return res.status(400).json({ error: "Invalid inventory id" });
    }

    const r = await query(
      `${SELECT} WHERE i.inventory_id = $1`,
      [toId(req.params.id)]
    );

    if (r.rowCount === 0) {
      return res.status(404).json({
        error: "Inventory record not found",
      });
    }

    res.json(r.rows[0]);
  } catch (e) {
    next(e);
  }
});

// Stock for a specific product
router.get("/product/:productId", async (req, res, next) => {
  try {
    if (!isId(req.params.productId)) {
      return res.status(400).json({
        error: "Invalid product id",
      });
    }

    const r = await query(
      `${SELECT} WHERE i.product_id = $1`,
      [toId(req.params.productId)]
    );

    if (r.rowCount === 0) {
      return res.status(404).json({
        error: "No inventory record for this product",
      });
    }

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
      `INSERT INTO inventory
       (product_id, quantity, warehouse_location, reorder_level)
       VALUES ($1, $2, $3, $4)
       RETURNING inventory_id,
                 product_id,
                 quantity,
                 warehouse_location,
                 reorder_level,
                 last_updated`,
      [
        data.product_id,
        data.quantity,
        data.warehouse_location,
        data.reorder_level ?? 5,
      ]
    );

    res.status(201).json(r.rows[0]);
  } catch (e) {
    next(e);
  }
});

router.put("/:id", async (req, res, next) => {
  try {
    if (!isId(req.params.id)) {
      return res.status(400).json({
        error: "Invalid inventory id",
      });
    }

    const { errors, data } = validate(req.body, {
      quantity: spec.quantity,
      warehouse_location: spec.warehouse_location,
      reorder_level: spec.reorder_level,
    });

    if (sendValidationError(res, errors)) return;

    const r = await query(
      `UPDATE inventory
       SET quantity = $1,
           warehouse_location = $2,
           reorder_level = $3,
           last_updated = CURRENT_TIMESTAMP
       WHERE inventory_id = $4
       RETURNING inventory_id,
                 product_id,
                 quantity,
                 warehouse_location,
                 reorder_level,
                 last_updated`,
      [
        data.quantity,
        data.warehouse_location,
        data.reorder_level ?? 5,
        toId(req.params.id),
      ]
    );

    if (r.rowCount === 0) {
      return res.status(404).json({
        error: "Inventory record not found",
      });
    }

    res.json(r.rows[0]);
  } catch (e) {
    next(e);
  }
});

router.delete("/:id", async (req, res, next) => {
  try {
    if (!isId(req.params.id)) {
      return res.status(400).json({
        error: "Invalid inventory id",
      });
    }

    const r = await query(
      `DELETE FROM inventory
       WHERE inventory_id = $1
       RETURNING inventory_id`,
      [toId(req.params.id)]
    );

    if (r.rowCount === 0) {
      return res.status(404).json({
        error: "Inventory record not found",
      });
    }

    res.json({
      message: "Inventory record deleted",
      inventory_id: r.rows[0].inventory_id,
    });
  } catch (e) {
    next(e);
  }
});

export default router;