// Order and Order_Item modules.
// Customer -> Order -> Order_Item -> Product
import { Router } from "express";
import { pool, query } from "../db.js";
import { isId, toId, validate, sendValidationError } from "../validate.js";

const router = Router();

const STATUS = ["Pending", "Confirmed", "Shipped", "Delivered", "Cancelled"];

// ---------------- Order ----------------
router.get("/", async (req, res, next) => {
  try {
    const base = `
      SELECT o.order_id, o.customer_id, c.name AS customer_name,
             o.order_date, o.status, o.total_amount
      FROM "order" o JOIN customer c ON c.customer_id = o.customer_id`;

    if (req.query.customer_id !== undefined) {
      if (!isId(req.query.customer_id))
        return res.status(400).json({ error: "Invalid customer_id" });
      const r = await query(`${base} WHERE o.customer_id = $1 ORDER BY o.order_id DESC`, [
        toId(req.query.customer_id),
      ]);
      return res.json(r.rows);
    }
    const r = await query(`${base} ORDER BY o.order_id DESC`);
    res.json(r.rows);
  } catch (e) {
    next(e);
  }
});

// Full order with its items
router.get("/:id", async (req, res, next) => {
  try {
    if (!isId(req.params.id)) return res.status(400).json({ error: "Invalid order id" });
    const id = toId(req.params.id);

    const order = await query(`SELECT * FROM "order" WHERE order_id = $1`, [id]);
    if (order.rowCount === 0) return res.status(404).json({ error: "Order not found" });

    const items = await query(
      `SELECT oi.order_item_id, oi.product_id, p.name AS product_name,
              oi.quantity, oi.unit_price, (oi.quantity * oi.unit_price) AS line_total
       FROM order_item oi JOIN product p ON p.product_id = oi.product_id
       WHERE oi.order_id = $1 ORDER BY oi.order_item_id`,
      [id]
    );
    res.json({ ...order.rows[0], items: items.rows });
  } catch (e) {
    next(e);
  }
});

// Create an order together with its items (single transaction)
router.post("/", async (req, res, next) => {
  const client = await pool.connect();
  try {
    const { errors, data } = validate(req.body, {
      customer_id: { type: "int", required: true, min: 1 },
      status: { type: "string", enum: STATUS, default: "Pending" },
    });

    const items = Array.isArray(req.body?.items) ? req.body.items : [];
    if (items.length === 0) errors.push("items must be a non-empty array");
    items.forEach((it, idx) => {
      if (!isId(it?.product_id)) errors.push(`items[${idx}].product_id is invalid`);
      if (!Number.isInteger(Number(it?.quantity)) || Number(it?.quantity) < 1)
        errors.push(`items[${idx}].quantity must be a whole number of at least 1`);
    });
    if (sendValidationError(res, errors)) return;

    await client.query("BEGIN");

    const orderRes = await client.query(
      `INSERT INTO "order" (customer_id, status, total_amount)
       VALUES ($1, $2, 0) RETURNING order_id, customer_id, order_date, status, total_amount`,
      [data.customer_id, data.status ?? "Pending"]
    );
    const orderId = orderRes.rows[0].order_id;

    let total = 0;
    for (const it of items) {
      const priceRes = await client.query(`SELECT price FROM product WHERE product_id = $1`, [
        Number(it.product_id),
      ]);
      if (priceRes.rowCount === 0) {
        await client.query("ROLLBACK");
        return res.status(400).json({ error: `Product ${it.product_id} does not exist` });
      }
      const unitPrice = Number(priceRes.rows[0].price);
      const qty = Number(it.quantity);
      total += unitPrice * qty;

      await client.query(
        `INSERT INTO order_item (order_id, product_id, quantity, unit_price)
         VALUES ($1, $2, $3, $4)`,
        [orderId, Number(it.product_id), qty, unitPrice]
      );
    }

    const finalOrder = await client.query(
      `UPDATE "order" SET total_amount = $1 WHERE order_id = $2 RETURNING *`,
      [total, orderId]
    );

    await client.query("COMMIT");
    res.status(201).json(finalOrder.rows[0]);
  } catch (e) {
    await client.query("ROLLBACK").catch(() => {});
    next(e);
  } finally {
    client.release();
  }
});

// Update order status
router.put("/:id", async (req, res, next) => {
  try {
    if (!isId(req.params.id)) return res.status(400).json({ error: "Invalid order id" });
    const { errors, data } = validate(req.body, {
      status: { type: "string", required: true, enum: STATUS },
    });
    if (sendValidationError(res, errors)) return;

    const r = await query(
      `UPDATE "order" SET status = $1 WHERE order_id = $2 RETURNING *`,
      [data.status, toId(req.params.id)]
    );
    if (r.rowCount === 0) return res.status(404).json({ error: "Order not found" });
    res.json(r.rows[0]);
  } catch (e) {
    next(e);
  }
});

router.delete("/:id", async (req, res, next) => {
  try {
    if (!isId(req.params.id)) return res.status(400).json({ error: "Invalid order id" });
    const r = await query(`DELETE FROM "order" WHERE order_id = $1 RETURNING order_id`, [
      toId(req.params.id),
    ]);
    if (r.rowCount === 0) return res.status(404).json({ error: "Order not found" });
    res.json({ message: "Order deleted", order_id: r.rows[0].order_id });
  } catch (e) {
    next(e);
  }
});

// ---------------- Order_Item ----------------
router.get("/:id/items", async (req, res, next) => {
  try {
    if (!isId(req.params.id)) return res.status(400).json({ error: "Invalid order id" });
    const r = await query(
      `SELECT oi.order_item_id, oi.order_id, oi.product_id, p.name AS product_name,
              oi.quantity, oi.unit_price, (oi.quantity * oi.unit_price) AS line_total
       FROM order_item oi JOIN product p ON p.product_id = oi.product_id
       WHERE oi.order_id = $1 ORDER BY oi.order_item_id`,
      [toId(req.params.id)]
    );
    res.json(r.rows);
  } catch (e) {
    next(e);
  }
});

router.post("/items", async (req, res, next) => {
  try {
    const { errors, data } = validate(req.body, {
      order_id: { type: "int", required: true, min: 1 },
      product_id: { type: "int", required: true, min: 1 },
      quantity: { type: "int", required: true, min: 1 },
      unit_price: { type: "number", min: 0 },
    });
    if (sendValidationError(res, errors)) return;

    let unitPrice = data.unit_price;
    if (unitPrice === null) {
      const p = await query(`SELECT price FROM product WHERE product_id = $1`, [data.product_id]);
      if (p.rowCount === 0) return res.status(400).json({ error: "Product does not exist" });
      unitPrice = Number(p.rows[0].price);
    }

    const r = await query(
      `INSERT INTO order_item (order_id, product_id, quantity, unit_price)
       VALUES ($1, $2, $3, $4)
       RETURNING order_item_id, order_id, product_id, quantity, unit_price`,
      [data.order_id, data.product_id, data.quantity, unitPrice]
    );
    await recalcTotal(data.order_id);
    res.status(201).json(r.rows[0]);
  } catch (e) {
    next(e);
  }
});

router.put("/items/:itemId", async (req, res, next) => {
  try {
    if (!isId(req.params.itemId)) return res.status(400).json({ error: "Invalid order item id" });
    const { errors, data } = validate(req.body, {
      quantity: { type: "int", required: true, min: 1 },
    });
    if (sendValidationError(res, errors)) return;

    const r = await query(
      `UPDATE order_item SET quantity = $1 WHERE order_item_id = $2
       RETURNING order_item_id, order_id, product_id, quantity, unit_price`,
      [data.quantity, toId(req.params.itemId)]
    );
    if (r.rowCount === 0) return res.status(404).json({ error: "Order item not found" });
    await recalcTotal(r.rows[0].order_id);
    res.json(r.rows[0]);
  } catch (e) {
    next(e);
  }
});

router.delete("/items/:itemId", async (req, res, next) => {
  try {
    if (!isId(req.params.itemId)) return res.status(400).json({ error: "Invalid order item id" });
    const r = await query(
      `DELETE FROM order_item WHERE order_item_id = $1 RETURNING order_item_id, order_id`,
      [toId(req.params.itemId)]
    );
    if (r.rowCount === 0) return res.status(404).json({ error: "Order item not found" });
    await recalcTotal(r.rows[0].order_id);
    res.json({ message: "Order item removed", order_item_id: r.rows[0].order_item_id });
  } catch (e) {
    next(e);
  }
});

async function recalcTotal(orderId) {
  await query(
    `UPDATE "order" SET total_amount = COALESCE(
       (SELECT SUM(quantity * unit_price) FROM order_item WHERE order_id = $1), 0)
     WHERE order_id = $1`,
    [orderId]
  );
}

export default router;
