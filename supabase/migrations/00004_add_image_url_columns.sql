-- Add image_url columns to tables
ALTER TABLE crops ADD COLUMN IF NOT EXISTS image_url TEXT;
ALTER TABLE livestock ADD COLUMN IF NOT EXISTS image_url TEXT;