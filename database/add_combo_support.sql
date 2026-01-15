-- Add combo support to products table
-- Run this migration on Vercel Postgres

ALTER TABLE products 
ADD COLUMN IF NOT EXISTS is_combo BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS combo_items JSONB;

COMMENT ON COLUMN products.is_combo IS 'Indicates if this product is a combo';
COMMENT ON COLUMN products.combo_items IS 'Array of product IDs and quantities that make up this combo';
