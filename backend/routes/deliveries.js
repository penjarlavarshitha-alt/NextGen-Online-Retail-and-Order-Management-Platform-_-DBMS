// Delivery module: Order -> Delivery.
import { Router } from "express";
import { query } from "../db.js";
import { isId, toId, validate, sendValidationError } from "../validate.js";

const router = Router();

const STATUS = ["Pending", "Dispatched", "In Transit", "Delivered", "Returned"];

const spec = {
  order_id: { type: "int", required: true, min: 1 },
  delivery_address: { type: "string", required: true, max: 255 },
  courier_name: { type: "string", max: 100 },
  delivery_status: { type: "string", enum: STATUS, default: "Pending" },
  delivery_date: { type: "string", max: 30 },
};

const SELECT = `
  SELECT d.delivery_id, d.order_id, d.delivery_address, d.courier_name,
         d.delivery_status, d.delivery_date
  FROM delivery d`;

router.get("/", async (_req, res, next) => {
  try {
    const r = await query(`${SELECT} ORDER BY d.delivery_id DESC`);
    res.json(r.rows);
  } catch (e) {
    next(e);
  }
});

router.get("/:id", async (req, res, next) => {
  try {
    if (!isId(req.params.id)) return res.status(400).json({ error: "Invalid delivery id" });
    const r = await query(`${SELECT} WHERE d.delivery_id = $1`, [toId(req.params.id)]);
    if (r.rowCount === 0) return res.status(404).json({ error: "Delivery not found" });
    res.json(r.rows[0]);
  } catch (e) {
    next(e);
  }
});

router.get("/order/:orderId", async (req, res, next) => {
  try {
    if (!isId(req.params.orderId)) return res.status(400).json({ error: "Invalid order id" });
    const r = await query(`${SELECT} WHERE d.order_id = $1`, [toId(req.params.orderId)]);
    if (r.rowCount === 0) return res.status(404).json({ error: "No delivery for this order" });
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
      `INSERT INTO delivery (order_id, delivery_address, courier_name, delivery_status, delivery_date)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING delivery_id, order_id, delivery_address, courier_name, delivery_status, delivery_date`,
      [
        data.order_id,
        data.delivery_address,
        data.courier_name,
        data.delivery_status ?? "Pending",
        data.delivery_date,
      ]
    );
    res.status(201).json(r.rows[0]);
  } catch (e) {
    next(e);
  }
});

router.put("/:id", async (req, res, next) => {
  try {
    if (!isId(req.params.id)) return res.status(400).json({ error: "Invalid delivery id" });
    const { errors, data } = validate(req.body, {
      delivery_address: spec.delivery_address,
      courier_name: spec.courier_name,
      delivery_status: { type: "string", required: true, enum: STATUS },
      delivery_date: spec.delivery_date,
    });
    if (sendValidationError(res, errors)) return;

    const r = await query(
      `UPDATE delivery
       SET delivery_address = $1, courier_name = $2, delivery_status = $3, delivery_date = $4
       WHERE delivery_id = $5 RETURNING *`,
      [
        data.delivery_address,
        data.courier_name,
        data.delivery_status,
        data.delivery_date,
        toId(req.params.id),
      ]
    );
    if (r.rowCount === 0) return res.status(404).json({ error: "Delivery not found" });
    res.json(r.rows[0]);
  } catch (e) {
    next(e);
  }
});

router.delete("/:id", async (req, res, next) => {
  try {
    if (!isId(req.params.id)) return res.status(400).json({ error: "Invalid delivery id" });
    const r = await query(`DELETE FROM delivery WHERE delivery_id = $1 RETURNING delivery_id`, [
      toId(req.params.id),
    ]);
    if (r.rowCount === 0) return res.status(404).json({ error: "Delivery not found" });
    res.json({ message: "Delivery deleted", delivery_id: r.rows[0].delivery_id });
  } catch (e) {
    next(e);
  }
});

export default router;
