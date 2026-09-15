# Backend API - NextGen Online Retail and Order Management Platform

Architecture: **React Frontend -> Backend API (Node + Express) -> PostgreSQL -> pgAdmin 4**

## Setup (run on your own laptop)

```bash
cd backend
npm install
cp .env.example .env     # Windows: copy .env.example .env
# edit .env with your PostgreSQL user, password and database name
npm start
```

API base URL: `http://localhost:4000`

Before first run, execute `backend/schema.sql` once in pgAdmin 4 (Query Tool).

## Folder structure

```
backend/
├── server.js            # Express app, mounts all modules, error handler
├── db.js                # PostgreSQL connection pool (pg)
├── validate.js          # Shared input validation helpers
├── schema.sql           # All tables, primary keys, foreign keys, checks
├── .env.example         # Connection settings template
└── routes/
    ├── customers.js     # Customer
    ├── categories.js    # Category
    ├── products.js      # Product
    ├── inventory.js     # Inventory
    ├── carts.js         # Cart + Cart_Item
    ├── orders.js        # Order + Order_Item
    ├── payments.js      # Payment
    ├── deliveries.js    # Delivery
    └── reviews.js       # Review
```

## Relationships

```
Customer -> Cart -> Cart_Item -> Product
Customer -> Order -> Order_Item -> Product
Product  -> Category
Product  -> Inventory
Order    -> Payment
Order    -> Delivery
Customer -> Review -> Product
```

## Endpoints

| Module     | Endpoints |
| ---------- | --------- |
| Health     | GET /api/health |
| Customer   | GET/POST /api/customers · GET/PUT/DELETE /api/customers/:id |
| Category   | GET/POST /api/categories · GET/PUT/DELETE /api/categories/:id |
| Product    | GET/POST /api/products · GET /api/products?category_id=1 · GET/PUT/DELETE /api/products/:id |
| Inventory  | GET/POST /api/inventory · GET/PUT/DELETE /api/inventory/:id · GET /api/inventory/product/:productId |
| Cart       | GET/POST /api/carts · GET/DELETE /api/carts/:id · GET /api/carts/customer/:customerId |
| Cart_Item  | GET /api/carts/:id/items · POST /api/carts/items · PUT/DELETE /api/carts/items/:itemId |
| Order      | GET/POST /api/orders · GET /api/orders?customer_id=1 · GET/PUT/DELETE /api/orders/:id |
| Order_Item | GET /api/orders/:id/items · POST /api/orders/items · PUT/DELETE /api/orders/items/:itemId |
| Payment    | GET/POST /api/payments · GET/PUT/DELETE /api/payments/:id · GET /api/payments/order/:orderId |
| Delivery   | GET/POST /api/deliveries · GET/PUT/DELETE /api/deliveries/:id · GET /api/deliveries/order/:orderId |
| Review     | GET/POST /api/reviews · GET/PUT/DELETE /api/reviews/:id · GET /api/reviews/product/:productId · GET /api/reviews/customer/:customerId |

### Example request bodies

```jsonc
// POST /api/categories
{ "name": "Electronics", "description": "Phones and laptops" }

// POST /api/products
{ "name": "Laptop", "description": "14 inch", "price": 55000, "category_id": 1 }

// POST /api/inventory
{ "product_id": 1, "quantity": 25, "warehouse_location": "Hyderabad" }

// POST /api/carts
{ "customer_id": 1 }

// POST /api/carts/items
{ "cart_id": 1, "product_id": 1, "quantity": 2 }

// POST /api/orders  (items are inserted and total_amount is calculated automatically)
{ "customer_id": 1, "status": "Pending",
  "items": [ { "product_id": 1, "quantity": 2 } ] }

// PUT /api/orders/1
{ "status": "Shipped" }

// POST /api/payments
{ "order_id": 1, "amount": 110000, "payment_method": "UPI", "payment_status": "Success" }

// POST /api/deliveries
{ "order_id": 1, "delivery_address": "Hyderabad", "courier_name": "BlueDart",
  "delivery_status": "Dispatched", "delivery_date": "2026-09-20" }

// POST /api/reviews
{ "customer_id": 1, "product_id": 1, "rating": 5, "comment": "Very good" }
```

## Frontend connection

The React app reads `VITE_API_URL` (defaults to `http://localhost:4000`).
