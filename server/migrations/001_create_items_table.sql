-- Migration: 001_create_items_table.sql
-- Description: Create items table for inventory tracking

CREATE TABLE IF NOT EXISTS items (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    sku VARCHAR(100) UNIQUE NOT NULL,
    barcode VARCHAR(100) UNIQUE,
    category VARCHAR(100),
    cost_price NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    sell_price_min NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    sell_price_max NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    stock INTEGER NOT NULL DEFAULT 0,
    low_stock_reminder INTEGER NOT NULL DEFAULT 5,
    total_sell INTEGER NOT NULL DEFAULT 0,
    returned INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Index frequently queried fields
CREATE INDEX IF NOT EXISTS idx_items_sku ON items(sku);
CREATE INDEX IF NOT EXISTS idx_items_barcode ON items(barcode);
CREATE INDEX IF NOT EXISTS idx_items_category ON items(category);
