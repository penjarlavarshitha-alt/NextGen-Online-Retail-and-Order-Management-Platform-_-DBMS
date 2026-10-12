// Cart and Cart_Item modules.
// Customer -> Cart -> Cart_Item -> Product

import { Router } from "express";
import { query } from "../db.js";
import { isId, toId, validate, sendValidationError } from "../validate.js";

const router = Router();

// ---------------- Cart ----------------

// Get all carts with their customer names and cart items
router.get("/", async (_req, res, next) => {
  try {
    const r = await query(`
      SELECT
        c.cart_id,
        c.customer_id,
        cu.name AS customer_name,
        ci.cart_item_id,
        ci.product_id,
        p.name AS product_name,
        p.price,
        ci.quantity,
        (p.price * ci.quantity) AS line_total,
        c.created_at
      FROM cart c
      JOIN customer cu
        ON cu.customer_id = c.customer_id
      LEFT JOIN cart_item ci
        ON ci.cart_id = c.cart_id
      LEFT JOIN product p
        ON p.product_id = ci.product_id
      ORDER BY c.cart_id, ci.cart_item_id
    `);

    res.json(r.rows);
  } catch (e) {
    next(e);
  }
});

// Get one cart with all its items
router.get("/:id", async (req, res, next) => {
  try {
    if (!isId(req.params.id)) {
      return res.status(400).json({
        error: "Invalid cart id",
      });
    }

    const cartId = toId(req.params.id);

    const cart = await query(
      `SELECT
         c.cart_id,
         c.customer_id,
         cu.name AS customer_name,
         c.created_at
       FROM cart c
       JOIN customer cu
         ON cu.customer_id = c.customer_id
       WHERE c.cart_id = $1`,
      [cartId]
    );

    if (cart.rowCount === 0) {
      return res.status(404).json({
        error: "Cart not found",
      });
    }

    const items = await query(
      `SELECT
         ci.cart_item_id,
         ci.cart_id,
         ci.product_id,
         p.name AS product_name,
         p.price,
         ci.quantity,
         (p.price * ci.quantity) AS line_total
       FROM cart_item ci
       JOIN product p
         ON p.product_id = ci.product_id
       WHERE ci.cart_id = $1
       ORDER BY ci.cart_item_id`,
      [cartId]
    );

    const total = items.rows.reduce(
      (sum, item) => sum + Number(item.line_total),
      0
    );

    res.json({
      ...cart.rows[0],
      items: items.rows,
      cart_total: total,
    });
  } catch (e) {
    next(e);
  }
});

// Get carts belonging to a customer
router.get("/customer/:customerId", async (req, res, next) => {
  try {
    if (!isId(req.params.customerId)) {
      return res.status(400).json({
        error: "Invalid customer id",
      });
    }

    const r = await query(
      `SELECT
         cart_id,
         customer_id,
         created_at
       FROM cart
       WHERE customer_id = $1
       ORDER BY cart_id`,
      [toId(req.params.customerId)]
    );

    res.json(r.rows);
  } catch (e) {
    next(e);
  }
});

// Create a new cart for a customer
router.post("/", async (req, res, next) => {
  try {
    const { errors, data } = validate(req.body, {
      customer_id: {
        type: "int",
        required: true,
        min: 1,
      },
    });

    if (sendValidationError(res, errors)) return;

    const r = await query(
      `INSERT INTO cart (customer_id)
       VALUES ($1)
       RETURNING cart_id, customer_id, created_at`,
      [data.customer_id]
    );

    res.status(201).json(r.rows[0]);
  } catch (e) {
    next(e);
  }
});

// Delete a cart
router.delete("/:id", async (req, res, next) => {
  try {
    if (!isId(req.params.id)) {
      return res.status(400).json({
        error: "Invalid cart id",
      });
    }

    const r = await query(
      `DELETE FROM cart
       WHERE cart_id = $1
       RETURNING cart_id`,
      [toId(req.params.id)]
    );

    if (r.rowCount === 0) {
      return res.status(404).json({
        error: "Cart not found",
      });
    }

    res.json({
      message: "Cart deleted",
      cart_id: r.rows[0].cart_id,
    });
  } catch (e) {
    next(e);
  }
});

// ---------------- Cart_Item ----------------

const itemSpec = {
  cart_id: {
    type: "int",
    required: true,
    min: 1,
  },
  product_id: {
    type: "int",
    required: true,
    min: 1,
  },
  quantity: {
    type: "int",
    required: true,
    min: 1,
  },
};

// Get all items in a specific cart
router.get("/:id/items", async (req, res, next) => {
  try {
    if (!isId(req.params.id)) {
      return res.status(400).json({
        error: "Invalid cart id",
      });
    }

    const r = await query(
      `SELECT
         ci.cart_item_id,
         ci.cart_id,
         ci.product_id,
         p.name AS product_name,
         p.price,
         ci.quantity,
         (p.price * ci.quantity) AS line_total
       FROM cart_item ci
       JOIN product p
         ON p.product_id = ci.product_id
       WHERE ci.cart_id = $1
       ORDER BY ci.cart_item_id`,
      [toId(req.params.id)]
    );

    res.json(r.rows);
  } catch (e) {
    next(e);
  }
});

// Add a product to a cart
router.post("/items", async (req, res, next) => {
  try {
    const { errors, data } = validate(req.body, itemSpec);

    if (sendValidationError(res, errors)) return;

    // Check that the cart exists
    const cart = await query(
      `SELECT cart_id
       FROM cart
       WHERE cart_id = $1`,
      [data.cart_id]
    );

    if (cart.rowCount === 0) {
      return res.status(400).json({
        error: "Cart does not exist",
      });
    }

    // Check that the product exists
    const product = await query(
      `SELECT product_id
       FROM product
       WHERE product_id = $1`,
      [data.product_id]
    );

    if (product.rowCount === 0) {
      return res.status(400).json({
        error: "Product does not exist",
      });
    }

    const r = await query(
      `INSERT INTO cart_item
       (cart_id, product_id, quantity)
       VALUES ($1, $2, $3)
       ON CONFLICT (cart_id, product_id)
       DO UPDATE SET quantity = cart_item.quantity + EXCLUDED.quantity
       RETURNING
         cart_item_id,
         cart_id,
         product_id,
         quantity`,
      [
        data.cart_id,
        data.product_id,
        data.quantity,
      ]
    );

    res.status(201).json(r.rows[0]);
  } catch (e) {
    next(e);
  }
});

// Update cart item quantity
router.put("/items/:itemId", async (req, res, next) => {
  try {
    if (!isId(req.params.itemId)) {
      return res.status(400).json({
        error: "Invalid cart item id",
      });
    }

    const { errors, data } = validate(req.body, {
      quantity: itemSpec.quantity,
    });

    if (sendValidationError(res, errors)) return;

    const r = await query(
      `UPDATE cart_item
       SET quantity = $1
       WHERE cart_item_id = $2
       RETURNING
         cart_item_id,
         cart_id,
         product_id,
         quantity`,
      [
        data.quantity,
        toId(req.params.itemId),
      ]
    );

    if (r.rowCount === 0) {
      return res.status(404).json({
        error: "Cart item not found",
      });
    }

    res.json(r.rows[0]);
  } catch (e) {
    next(e);
  }
});

// Delete cart item
router.delete("/items/:itemId", async (req, res, next) => {
  try {
    if (!isId(req.params.itemId)) {
      return res.status(400).json({
        error: "Invalid cart item id",
      });
    }

    const r = await query(
      `DELETE FROM cart_item
       WHERE cart_item_id = $1
       RETURNING cart_item_id`,
      [toId(req.params.itemId)]
    );

    if (r.rowCount === 0) {
      return res.status(404).json({
        error: "Cart item not found",
      });
    }

    res.json({
      message: "Cart item removed",
      cart_item_id: r.rows[0].cart_item_id,
    });
  } catch (e) {
    next(e);
  }
});

export default router;