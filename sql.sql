-- Ecommerce Storage Planner
-- PostgreSQL-compatible schema for an online storefront with catalog, inventory, cart, and orders.

BEGIN;

CREATE TABLE users (
    user_id BIGSERIAL PRIMARY KEY,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE addresses (
    address_id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    address_line1 VARCHAR(255) NOT NULL,
    address_line2 VARCHAR(255),
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100) NOT NULL,
    postal_code VARCHAR(20) NOT NULL,
    country VARCHAR(100) NOT NULL DEFAULT 'USA',
    is_default BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE categories (
    category_id BIGSERIAL PRIMARY KEY,
    category_name VARCHAR(100) NOT NULL UNIQUE,
    parent_category_id BIGINT REFERENCES categories(category_id) ON DELETE SET NULL,
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE products (
    product_id BIGSERIAL PRIMARY KEY,
    category_id BIGINT REFERENCES categories(category_id) ON DELETE SET NULL,
    product_name VARCHAR(150) NOT NULL,
    slug VARCHAR(180) NOT NULL UNIQUE,
    short_description TEXT,
    long_description TEXT,
    price NUMERIC(10,2) NOT NULL CHECK (price >= 0),
    compare_at_price NUMERIC(10,2) CHECK (compare_at_price >= 0),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    is_featured BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE product_images (
    image_id BIGSERIAL PRIMARY KEY,
    product_id BIGINT NOT NULL REFERENCES products(product_id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    alt_text VARCHAR(255),
    is_primary BOOLEAN NOT NULL DEFAULT FALSE,
    sort_order INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE warehouses (
    warehouse_id BIGSERIAL PRIMARY KEY,
    warehouse_name VARCHAR(100) NOT NULL,
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100) NOT NULL,
    country VARCHAR(100) NOT NULL DEFAULT 'USA',
    is_active BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE inventory (
    product_id BIGINT NOT NULL REFERENCES products(product_id) ON DELETE CASCADE,
    warehouse_id BIGINT NOT NULL REFERENCES warehouses(warehouse_id) ON DELETE CASCADE,
    stock_quantity INT NOT NULL DEFAULT 0 CHECK (stock_quantity >= 0),
    reserved_quantity INT NOT NULL DEFAULT 0 CHECK (reserved_quantity >= 0),
    reorder_level INT NOT NULL DEFAULT 0 CHECK (reorder_level >= 0),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (product_id, warehouse_id)
);

CREATE TABLE carts (
    cart_id BIGSERIAL PRIMARY KEY,
    user_id BIGINT REFERENCES users(user_id) ON DELETE CASCADE,
    guest_token VARCHAR(128),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (user_id),
    UNIQUE (guest_token)
);

CREATE TABLE cart_items (
    cart_item_id BIGSERIAL PRIMARY KEY,
    cart_id BIGINT NOT NULL REFERENCES carts(cart_id) ON DELETE CASCADE,
    product_id BIGINT NOT NULL REFERENCES products(product_id) ON DELETE CASCADE,
    quantity INT NOT NULL CHECK (quantity > 0),
    added_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (cart_id, product_id)
);

CREATE TABLE orders (
    order_id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(user_id) ON DELETE RESTRICT,
    order_number VARCHAR(50) NOT NULL UNIQUE,
    status VARCHAR(30) NOT NULL DEFAULT 'pending' CHECK (
        status IN ('pending', 'paid', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded')
    ),
    subtotal NUMERIC(12,2) NOT NULL CHECK (subtotal >= 0),
    shipping_total NUMERIC(10,2) NOT NULL DEFAULT 0 CHECK (shipping_total >= 0),
    tax_total NUMERIC(10,2) NOT NULL DEFAULT 0 CHECK (tax_total >= 0),
    discount_total NUMERIC(10,2) NOT NULL DEFAULT 0 CHECK (discount_total >= 0),
    grand_total NUMERIC(12,2) NOT NULL CHECK (grand_total >= 0),
    shipping_address_id BIGINT REFERENCES addresses(address_id) ON DELETE SET NULL,
    billing_address_id BIGINT REFERENCES addresses(address_id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE order_items (
    order_item_id BIGSERIAL PRIMARY KEY,
    order_id BIGINT NOT NULL REFERENCES orders(order_id) ON DELETE CASCADE,
    product_id BIGINT NOT NULL REFERENCES products(product_id) ON DELETE RESTRICT,
    product_name VARCHAR(150) NOT NULL,
    quantity INT NOT NULL CHECK (quantity > 0),
    unit_price NUMERIC(10,2) NOT NULL CHECK (unit_price >= 0),
    total_price NUMERIC(12,2) NOT NULL CHECK (total_price >= 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE payments (
    payment_id BIGSERIAL PRIMARY KEY,
    order_id BIGINT NOT NULL REFERENCES orders(order_id) ON DELETE CASCADE,
    payment_method VARCHAR(30) NOT NULL CHECK (
        payment_method IN ('credit_card', 'debit_card', 'paypal', 'bank_transfer', 'cash_on_delivery')
    ),
    transaction_id VARCHAR(100),
    amount NUMERIC(12,2) NOT NULL CHECK (amount >= 0),
    status VARCHAR(30) NOT NULL DEFAULT 'pending' CHECK (
        status IN ('pending', 'authorized', 'paid', 'failed', 'refunded', 'partially_refunded')
    ),
    payment_date TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (order_id, transaction_id)
);

CREATE TABLE order_status_history (
    history_id BIGSERIAL PRIMARY KEY,
    order_id BIGINT NOT NULL REFERENCES orders(order_id) ON DELETE CASCADE,
    previous_status VARCHAR(30),
    new_status VARCHAR(30) NOT NULL,
    changed_by VARCHAR(50) NOT NULL DEFAULT 'system',
    changed_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE reviews (
    review_id BIGSERIAL PRIMARY KEY,
    product_id BIGINT NOT NULL REFERENCES products(product_id) ON DELETE CASCADE,
    user_id BIGINT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    rating SMALLINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
    title VARCHAR(150),
    comment TEXT,
    is_approved BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (product_id, user_id)
);

CREATE INDEX idx_products_category_id ON products(category_id);
CREATE INDEX idx_products_is_featured ON products(is_featured, is_active);
CREATE INDEX idx_inventory_warehouse_id ON inventory(warehouse_id);
CREATE INDEX idx_cart_items_product_id ON cart_items(product_id);
CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_order_items_product_id ON order_items(product_id);
CREATE INDEX idx_payments_order_id ON payments(order_id);
CREATE INDEX idx_reviews_product_id ON reviews(product_id);

INSERT INTO categories (category_name, description) VALUES
    ('Electronics', 'Devices and digital products'),
    ('Wearables', 'Smart wearable accessories'),
    ('Audio', 'Sound and listening devices'),
    ('Fitness', 'Wellness and motion tracking gear');

INSERT INTO products (category_id, product_name, slug, short_description, long_description, price, compare_at_price, is_active, is_featured) VALUES
    (1, 'Wireless Headphones', 'wireless-headphones', 'Premium wireless listening with deep bass and all-day comfort.', 'Enjoy immersive sound and a long battery life with these lightweight wireless headphones.', 59.99, 79.99, TRUE, TRUE),
    (2, 'Smart Watch', 'smart-watch', 'Track fitness goals and stay connected all day.', 'A sleek smart watch with health monitoring, notifications, and GPS.', 89.99, 119.99, TRUE, TRUE),
    (3, 'Bluetooth Speaker', 'bluetooth-speaker', 'Portable sound for home, travel, and outdoor activities.', 'Compact wireless speaker with excellent durability and room-filling sound.', 39.99, 59.99, TRUE, FALSE),
    (4, 'Fitness Tracker', 'fitness-tracker', 'Monitor activity, sleep, and heart rate with comfort in mind.', 'A lightweight wearable that helps you stay on top of your daily health goals.', 29.99, 49.99, TRUE, TRUE);

INSERT INTO warehouses (warehouse_name, city, state, country, is_active) VALUES
    ('Central Fulfillment Hub', 'Chicago', 'Illinois', 'USA', TRUE),
    ('West Distribution Center', 'Los Angeles', 'California', 'USA', TRUE);

INSERT INTO inventory (product_id, warehouse_id, stock_quantity, reserved_quantity, reorder_level) VALUES
    (1, 1, 75, 10, 20),
    (2, 1, 40, 5, 15),
    (3, 2, 60, 8, 18),
    (4, 1, 90, 12, 25),
    (2, 2, 30, 3, 10),
    (1, 2, 50, 5, 15);

COMMIT;
