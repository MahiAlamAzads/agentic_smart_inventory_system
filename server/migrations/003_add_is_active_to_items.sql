-- Migration: 003_add_is_active_to_items.sql
-- Description: Add is_active column to items table with default true

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'items' AND column_name = 'is_active'
    ) THEN
        ALTER TABLE items ADD COLUMN is_active BOOLEAN NOT NULL DEFAULT true;
    END IF;
END $$;

