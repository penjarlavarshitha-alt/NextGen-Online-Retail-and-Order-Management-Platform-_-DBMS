// Payment module: Order -> Payment.
import { Router } from "express";
import { query } from "../db.js";
import { isId, toId, validate, sendValidationError } from "../validate.js";

const router = Router();

const METHODS = ["Card", "UPI", "NetBanking", "COD", "Wallet"];
const STATUS = ["Pending", "Success", "Failed", "Refunded"];

const spec = {
  order_id: { type: "int", required: true, min: 1 },
  amount: { type: "number", required: true, min: 0 },
  payment_method: { type: "string", required: true, enum: METHODS },
  payment_status: { type: "string", enum: STATUS, default: "Pending" },
};

const SELECT = `
  SELECT pa.payment_id, pa.order_id, pa.amount, pa.payment_method,
         pa.payment_status, pa.payment_date
  FROM payment pa`;

router.get("/", async (_req, res, next) => {
  try {
    const r = await query(`${SELECT} ORDER BY pa.payment_id DESC`);
    res.json(r.rows);
  } catch (e) {
    next(e);
  }
});

router.get("/:id", async (req, res, next) => {
  try {
    if (!isId(req.params.id)) return res.status(400).json({ error: "Invalid payment id" });
    const r = await query(`${SELECT} WHERE pa.payment_id = $1`, [toId(req.params.id)]);
    if (r.rowCount === 0) return res.status(404).json({ error: "Payment not found" });
    res.json(r.rows[0]);
  } catch (e) {
    next(e);
  }
});

router.get("/order/:orderId", async (req, res, next) => {
  try {
    if (!isId(req.params.orderId)) return res.status(400).json({ error: "Invalid order id" });
    const r = await query(`${SELECT} WHERE pa.order_id = $1`, [toId(req.params.orderId)]);
    if (r.rowCount === 0) return res.status(404).json({ error: "No payment for this order" });
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
      `INSERT INTO payment (order_id, amount, payment_method, payment_status)
       VALUES ($1, $2, $3, $4)
       RETURNING payment_id, order_id, amount, payment_method, payment_status, payment_date`,
      [data.order_id, data.amount, data.payment_method, data.payment_status ?? "Pending"]
    );
    res.status(201).json(r.rows[0]);
  } catch (e) {
    next(e);
  }
});

// Update payment status (e.g. Pending -> Success)
router.put("/:id", async (req, res, next) => {
  try {
    if (!isId(req.params.id)) return res.status(400).json({ error: "Invalid payment id" });
    const { errors, data } = validate(req.body, {
      payment_status: { type: "string", required: true, enum: STATUS },
    });
    if (sendValidationError(res, errors)) return;
    const r = await query(
      `UPDATE payment SET payment_status = $1 WHERE payment_id = $2 RETURNING *`,
      [data.payment_status, toId(req.params.id)]
    );
    if (r.rowCount === 0) return res.status(404).json({ error: "Payment not found" });
    res.json(r.rows[0]);
  } catch (e) {
    next(e);
  }
});

router.delete("/:id", async (req, res, next) => {
  try {
    if (!isId(req.params.id)) return res.status(400).json({ error: "Invalid payment id" });
    const r = await query(`DELETE FROM payment WHERE payment_id = $1 RETURNING payment_id`, [
      toId(req.params.id),
    ]);
    if (r.rowCount === 0) return res.status(404).json({ error: "Payment not found" });
    res.json({ message: "Payment deleted", payment_id: r.rows[0].payment_id });
  } catch (e) {
    next(e);
  }
});

export default router;
