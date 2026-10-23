-- Migration: 002_update_items_and_create_sale_items.sql
-- Description: Ensure cost_price, sell_price_min, sell_price_max in items, and create sale_items table

-- 1. Add cost_price if it does not exist (or rename unit_price if needed)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'items' AND column_name = 'cost_price'
    ) THEN
        IF EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'items' AND column_name = 'unit_price'
        ) THEN
            ALTER TABLE items RENAME COLUMN unit_price TO cost_price;
        ELSE
            ALTER TABLE items ADD COLUMN cost_price NUMERIC(12, 2) NOT NULL DEFAULT 0.00;
        END IF;
    END IF;

    -- Ensure sell_price_min exists
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'items' AND column_name = 'sell_price_min'
    ) THEN
        ALTER TABLE items ADD COLUMN sell_price_min NUMERIC(12, 2) NOT NULL DEFAULT 0.00;
    END IF;

    -- Ensure sell_price_max exists
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'items' AND column_name = 'sell_price_max'
    ) THEN
        ALTER TABLE items ADD COLUMN sell_price_max NUMERIC(12, 2) NOT NULL DEFAULT 0.00;
    END IF;
END $$;

-- 2. Create sale_items table
CREATE TABLE IF NOT EXISTS sale_items (
    id SERIAL PRIMARY KEY,
    sale_id INTEGER NOT NULL,
    item_id INTEGER NOT NULL REFERENCES items(id) ON DELETE RESTRICT,
    quantity INTEGER NOT NULL,
    unit_price NUMERIC(12, 2) NOT NULL,
    total_price NUMERIC(12, 2)
        GENERATED ALWAYS AS (quantity * unit_price) STORED
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_sale_items_sale_id ON sale_items(sale_id);
CREATE INDEX IF NOT EXISTS idx_sale_items_item_id ON sale_items(item_id);

