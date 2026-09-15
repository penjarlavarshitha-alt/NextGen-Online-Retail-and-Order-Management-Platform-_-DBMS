-- NextGen Online Retail and Order Management Platform
-- Run this once in pgAdmin 4 (Query Tool) on your project database.
-- No sample records are inserted - you manage all data yourself in pgAdmin 4.

-- ============ 1. Customer ============
CREATE TABLE IF NOT EXISTS customer (
    customer_id SERIAL PRIMARY KEY,
    name        VARCHAR(100) NOT NULL,
    email       VARCHAR(150) NOT NULL UNIQUE,
    phone       VARCHAR(15),
    address     VARCHAR(255),
    created_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ============ 2. Category ============
CREATE TABLE IF NOT EXISTS category (
    category_id SERIAL PRIMARY KEY,
    name        VARCHAR(100) NOT NULL UNIQUE,
    description VARCHAR(255)
);

-- ============ 3. Product (Product -> Category) ============
CREATE TABLE IF NOT EXISTS product (
    product_id  SERIAL PRIMARY KEY,
    name        VARCHAR(150) NOT NULL,
    description VARCHAR(500),
    price       NUMERIC(10, 2) NOT NULL CHECK (price >= 0),
    category_id INTEGER NOT NULL REFERENCES category(category_id) ON DELETE RESTRICT,
    created_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ============ 4. Inventory (one row per product) ============
CREATE TABLE IF NOT EXISTS inventory (
    inventory_id       SERIAL PRIMARY KEY,
    product_id         INTEGER NOT NULL UNIQUE REFERENCES product(product_id) ON DELETE CASCADE,
    quantity           INTEGER NOT NULL DEFAULT 0 CHECK (quantity >= 0),
    warehouse_location VARCHAR(100),
    last_updated       TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ============ 5. Cart (Customer -> Cart) ============
CREATE TABLE IF NOT EXISTS cart (
    cart_id     SERIAL PRIMARY KEY,
    customer_id INTEGER NOT NULL REFERENCES customer(customer_id) ON DELETE CASCADE,
    created_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ============ 6. Cart_Item (Cart -> Cart_Item -> Product) ============
CREATE TABLE IF NOT EXISTS cart_item (
    cart_item_id SERIAL PRIMARY KEY,
    cart_id      INTEGER NOT NULL REFERENCES cart(cart_id) ON DELETE CASCADE,
    product_id   INTEGER NOT NULL REFERENCES product(product_id) ON DELETE CASCADE,
    quantity     INTEGER NOT NULL CHECK (quantity > 0),
    CONSTRAINT uq_cart_product UNIQUE (cart_id, product_id)
);

-- ============ 7. Order (Customer -> Order) ============
-- "order" is a reserved word in SQL, so it is always written in double quotes.
CREATE TABLE IF NOT EXISTS "order" (
    order_id     SERIAL PRIMARY KEY,
    customer_id  INTEGER NOT NULL REFERENCES customer(customer_id) ON DELETE CASCADE,
    order_date   TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    status       VARCHAR(20) NOT NULL DEFAULT 'Pending'
                 CHECK (status IN ('Pending','Confirmed','Shipped','Delivered','Cancelled')),
    total_amount NUMERIC(10, 2) NOT NULL DEFAULT 0 CHECK (total_amount >= 0)
);

-- ============ 8. Order_Item (Order -> Order_Item -> Product) ============
CREATE TABLE IF NOT EXISTS order_item (
    order_item_id SERIAL PRIMARY KEY,
    order_id      INTEGER NOT NULL REFERENCES "order"(order_id) ON DELETE CASCADE,
    product_id    INTEGER NOT NULL REFERENCES product(product_id) ON DELETE RESTRICT,
    quantity      INTEGER NOT NULL CHECK (quantity > 0),
    unit_price    NUMERIC(10, 2) NOT NULL CHECK (unit_price >= 0)
);

-- ============ 9. Payment (Order -> Payment, one payment per order) ============
CREATE TABLE IF NOT EXISTS payment (
    payment_id     SERIAL PRIMARY KEY,
    order_id       INTEGER NOT NULL UNIQUE REFERENCES "order"(order_id) ON DELETE CASCADE,
    amount         NUMERIC(10, 2) NOT NULL CHECK (amount >= 0),
    payment_method VARCHAR(20) NOT NULL
                   CHECK (payment_method IN ('Card','UPI','NetBanking','COD','Wallet')),
    payment_status VARCHAR(20) NOT NULL DEFAULT 'Pending'
                   CHECK (payment_status IN ('Pending','Success','Failed','Refunded')),
    payment_date   TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ============ 10. Delivery (Order -> Delivery, one delivery per order) ============
CREATE TABLE IF NOT EXISTS delivery (
    delivery_id      SERIAL PRIMARY KEY,
    order_id         INTEGER NOT NULL UNIQUE REFERENCES "order"(order_id) ON DELETE CASCADE,
    delivery_address VARCHAR(255) NOT NULL,
    courier_name     VARCHAR(100),
    delivery_status  VARCHAR(20) NOT NULL DEFAULT 'Pending'
                     CHECK (delivery_status IN ('Pending','Dispatched','In Transit','Delivered','Returned')),
    delivery_date    DATE
);

-- ============ 11. Review (Customer -> Review -> Product) ============
CREATE TABLE IF NOT EXISTS review (
    review_id   SERIAL PRIMARY KEY,
    customer_id INTEGER NOT NULL REFERENCES customer(customer_id) ON DELETE CASCADE,
    product_id  INTEGER NOT NULL REFERENCES product(product_id) ON DELETE CASCADE,
    rating      INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
    comment     VARCHAR(500),
    review_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_customer_product_review UNIQUE (customer_id, product_id)
);
