-- Insert comprehensive inventory data for Rural and Urban farming
-- This migration populates the inventory table with 70 demo items across 10+ categories
-- 
-- BEST PRACTICE: For production, authenticate users first, then replace demo UUIDs with real user IDs

-- STEP 1: Alternative approach - If auth.users insert fails, use this simple method:
-- Option A: Disable foreign key checks temporarily (if you have admin access)
-- PRAGMA foreign_keys = OFF;

-- Option B: Insert demo inventory using NULL owner_id initially (we'll link to real users later)
-- Or Option C: Use your actual authenticated user ID instead of demo UUIDs below

-- STEP 2: If you have a real authenticated user, replace these UUIDs:
-- Replace: 00000000-0000-0000-0000-000000000000 with your user_id from profiles table
-- Replace: 00000000-0000-0000-0000-000000000001 with another user_id if needed

-- Attempt to insert profiles (will fail if auth users don't exist, but that's OK)
-- You can skip this and manually link inventory to your actual user after authenticating
INSERT INTO profiles (id, username, email, phone, role, farm_type, location, created_at, updated_at) 
VALUES
('00000000-0000-0000-0000-000000000000'::uuid, 'demo-rural', 'demo-rural@farm.local', '+1-800-FARM-001', 'user', 'rural', 'Demo Rural Farm', now(), now())
ON CONFLICT DO NOTHING;

INSERT INTO profiles (id, username, email, phone, role, farm_type, location, created_at, updated_at) 
VALUES
('00000000-0000-0000-0000-000000000001'::uuid, 'demo-urban', 'demo-urban@farm.local', '+1-800-FARM-002', 'user', 'urban', 'Demo Urban Garden', now(), now())
ON CONFLICT DO NOTHING;

-- STEP 3: Insert comprehensive inventory data
-- If profiles insert failed, these will also fail. In that case:
-- 1. Authenticate with your real account (creates auth.users + profiles)
-- 2. Get your user_id from: SELECT id FROM profiles WHERE username = 'your-username';
-- 3. Run the inventory inserts with your real user_id

-- RURAL INVENTORY (35 items) - Using demo rural user ID
-- Seeds Category
INSERT INTO inventory (owner_id, item_name, category, quantity, unit, reorder_threshold, created_at, updated_at) VALUES
('00000000-0000-0000-0000-000000000000'::uuid, 'Hybrid Tomato Seeds (F1)', 'Seeds', 25, 'kg', 50, now() - interval '15 days', now()),
('00000000-0000-0000-0000-000000000000'::uuid, 'Mung Bean Seeds (Hybrid)', 'Seeds', 40, 'kg', 60, now() - interval '12 days', now()),
('00000000-0000-0000-0000-000000000000'::uuid, 'Potato Seed', 'Seeds', 100, 'kg', 80, now() - interval '25 days', now()),
('00000000-0000-0000-0000-000000000000'::uuid, 'Cabbage Seeds', 'Seeds', 15, 'kg', 20, now() - interval '11 days', now()),
('00000000-0000-0000-0000-000000000000'::uuid, 'Chili Pepper Seeds', 'Seeds', 12, 'kg', 15, now() - interval '18 days', now());

-- Fertilizers Category
INSERT INTO inventory (owner_id, item_name, category, quantity, unit, reorder_threshold, created_at, updated_at) VALUES
('00000000-0000-0000-0000-000000000000'::uuid, 'NPK 10-26-26 Fertilizer', 'Fertilizers', 150, 'kg', 100, now() - interval '10 days', now()),
('00000000-0000-0000-0000-000000000000'::uuid, 'Urea (46% Nitrogen)', 'Fertilizers', 75, 'kg', 100, now() - interval '3 days', now()),
('00000000-0000-0000-0000-000000000000'::uuid, 'Vermicompost', 'Fertilizers', 300, 'kg', 150, now() - interval '6 days', now()),
('00000000-0000-0000-0000-000000000000'::uuid, 'Calcium Nitrate', 'Fertilizers', 60, 'kg', 50, now() - interval '9 days', now()),
('00000000-0000-0000-0000-000000000000'::uuid, 'Micronutrient Mix (Zn, Fe, Cu)', 'Fertilizers', 45, 'kg', 40, now() - interval '14 days', now()),
('00000000-0000-0000-0000-000000000000'::uuid, 'DAP (Diammonium Phosphate)', 'Fertilizers', 85, 'kg', 70, now() - interval '7 days', now());

-- Pesticides Category
INSERT INTO inventory (owner_id, item_name, category, quantity, unit, reorder_threshold, created_at, updated_at) VALUES
('00000000-0000-0000-0000-000000000000'::uuid, 'Neem Oil (Bio-pesticide)', 'Pesticides', 35, 'liters', 40, now() - interval '20 days', now()),
('00000000-0000-0000-0000-000000000000'::uuid, 'Copper Sulfate Fungicide', 'Pesticides', 18, 'kg', 25, now() - interval '8 days', now()),
('00000000-0000-0000-0000-000000000000'::uuid, 'Pyrethrin Insecticide', 'Pesticides', 12, 'liters', 15, now() - interval '13 days', now()),
('00000000-0000-0000-0000-000000000000'::uuid, 'Sulfur Powder (Fungicide)', 'Pesticides', 28, 'kg', 30, now() - interval '4 days', now());

-- Tools Category
INSERT INTO inventory (owner_id, item_name, category, quantity, unit, reorder_threshold, created_at, updated_at) VALUES
('00000000-0000-0000-0000-000000000000'::uuid, 'Spading Fork', 'Tools', 8, 'units', 5, now() - interval '30 days', now()),
('00000000-0000-0000-0000-000000000000'::uuid, 'Mulching Cloth', 'Tools', 150, 'sq.m', 100, now() - interval '22 days', now()),
('00000000-0000-0000-0000-000000000000'::uuid, 'Digging Hoe', 'Tools', 12, 'units', 8, now() - interval '19 days', now()),
('00000000-0000-0000-0000-000000000000'::uuid, 'Pruning Shears', 'Tools', 10, 'units', 7, now() - interval '16 days', now());

-- Irrigation Category
INSERT INTO inventory (owner_id, item_name, category, quantity, unit, reorder_threshold, created_at, updated_at) VALUES
('00000000-0000-0000-0000-000000000000'::uuid, 'Drip Irrigation Tape', 'Irrigation', 250, 'meters', 200, now() - interval '5 days', now()),
('00000000-0000-0000-0000-000000000000'::uuid, 'Garden Hose (25mm)', 'Irrigation', 6, 'units', 4, now() - interval '18 days', now());

-- Equipment Category
INSERT INTO inventory (owner_id, item_name, category, quantity, unit, reorder_threshold, created_at, updated_at) VALUES
('00000000-0000-0000-0000-000000000000'::uuid, 'Water Pump (1 HP)', 'Equipment', 2, 'units', 1, now() - interval '28 days', now()),
('00000000-0000-0000-0000-000000000000'::uuid, 'Power Sprayer', 'Equipment', 3, 'units', 2, now() - interval '24 days', now()),
('00000000-0000-0000-0000-000000000000'::uuid, 'Tiller (2 HP)', 'Equipment', 1, 'units', 1, now() - interval '60 days', now()),
('00000000-0000-0000-0000-000000000000'::uuid, 'Pesticide Sprayer Pump', 'Equipment', 7, 'units', 5, now() - interval '13 days', now());

-- Storage Category
INSERT INTO inventory (owner_id, item_name, category, quantity, unit, reorder_threshold, created_at, updated_at) VALUES
('00000000-0000-0000-0000-000000000000'::uuid, 'Plastic Storage Bins (50L)', 'Storage', 35, 'units', 25, now() - interval '17 days', now()),
('00000000-0000-0000-0000-000000000000'::uuid, 'Burlap Sacks (50kg)', 'Storage', 200, 'units', 150, now() - interval '11 days', now());

-- Harvesting Category
INSERT INTO inventory (owner_id, item_name, category, quantity, unit, reorder_threshold, created_at, updated_at) VALUES
('00000000-0000-0000-0000-000000000000'::uuid, 'Harvesting Baskets', 'Harvesting', 25, 'units', 20, now() - interval '19 days', now()),
('00000000-0000-0000-0000-000000000000'::uuid, 'Harvesting Knife/Sickle', 'Harvesting', 18, 'units', 12, now() - interval '23 days', now());

-- Safety Category
INSERT INTO inventory (owner_id, item_name, category, quantity, unit, reorder_threshold, created_at, updated_at) VALUES
('00000000-0000-0000-0000-000000000000'::uuid, 'Protective Gloves (Nitrile)', 'Safety', 500, 'pairs', 300, now() - interval '9 days', now()),
('00000000-0000-0000-0000-000000000000'::uuid, 'N95 Masks', 'Safety', 250, 'units', 200, now() - interval '6 days', now()),
('00000000-0000-0000-0000-000000000000'::uuid, 'Safety Boots (Size 10)', 'Safety', 8, 'pairs', 5, now() - interval '27 days', now());

-- Soil Amendments Category
INSERT INTO inventory (owner_id, item_name, category, quantity, unit, reorder_threshold, created_at, updated_at) VALUES
('00000000-0000-0000-0000-000000000000'::uuid, 'Gypsum (Calcium Sulfate)', 'Soil Amendments', 120, 'kg', 100, now() - interval '14 days', now()),
('00000000-0000-0000-0000-000000000000'::uuid, 'Limestone (pH Adjuster)', 'Soil Amendments', 500, 'kg', 400, now() - interval '21 days', now());

-- Other Category
INSERT INTO inventory (owner_id, item_name, category, quantity, unit, reorder_threshold, created_at, updated_at) VALUES
('00000000-0000-0000-0000-000000000000'::uuid, 'Twine/String (100m roll)', 'Other', 15, 'rolls', 10, now() - interval '10 days', now());

-- URBAN INVENTORY (35 items)
-- Seeds Category
INSERT INTO inventory (owner_id, item_name, category, quantity, unit, reorder_threshold, created_at, updated_at) VALUES
('00000000-0000-0000-0000-000000000001'::uuid, 'Cherry Tomato Seeds', 'Seeds', 8, 'packets', 10, now() - interval '20 days', now()),
('00000000-0000-0000-0000-000000000001'::uuid, 'Lettuce Seeds (Mixed)', 'Seeds', 12, 'packets', 10, now() - interval '15 days', now()),
('00000000-0000-0000-0000-000000000001'::uuid, 'Herb Seeds Variety Pack', 'Seeds', 15, 'packets', 12, now() - interval '10 days', now()),
('00000000-0000-0000-0000-000000000001'::uuid, 'Bell Pepper Seeds', 'Seeds', 6, 'packets', 8, now() - interval '18 days', now()),
('00000000-0000-0000-0000-000000000001'::uuid, 'Spinach Seeds', 'Seeds', 10, 'packets', 8, now() - interval '12 days', now());

-- Containers Category
INSERT INTO inventory (owner_id, item_name, category, quantity, unit, reorder_threshold, created_at, updated_at) VALUES
('00000000-0000-0000-0000-000000000001'::uuid, 'Ceramic Pots (8cm)', 'Containers', 20, 'units', 25, now() - interval '8 days', now()),
('00000000-0000-0000-0000-000000000001'::uuid, 'Ceramic Pots (15cm)', 'Containers', 15, 'units', 20, now() - interval '14 days', now()),
('00000000-0000-0000-0000-000000000001'::uuid, 'Plastic Hanging Baskets', 'Containers', 12, 'units', 10, now() - interval '11 days', now()),
('00000000-0000-0000-0000-000000000001'::uuid, 'Drainage Saucers (20cm)', 'Containers', 18, 'units', 15, now() - interval '7 days', now()),
('00000000-0000-0000-0000-000000000001'::uuid, 'Self-Watering Pots', 'Containers', 8, 'units', 6, now() - interval '13 days', now());

-- Soil & Amendments Category
INSERT INTO inventory (owner_id, item_name, category, quantity, unit, reorder_threshold, created_at, updated_at) VALUES
('00000000-0000-0000-0000-000000000001'::uuid, 'Potting Soil Mix (40L)', 'Soil & Amendments', 25, 'liters', 30, now() - interval '5 days', now()),
('00000000-0000-0000-0000-000000000001'::uuid, 'Perlite (Soil Amendment)', 'Soil & Amendments', 10, 'liters', 8, now() - interval '12 days', now()),
('00000000-0000-0000-0000-000000000001'::uuid, 'Coco Coir (Compressed)', 'Soil & Amendments', 8, 'blocks', 10, now() - interval '9 days', now()),
('00000000-0000-0000-0000-000000000001'::uuid, 'Mulch Chips (Indoor)', 'Soil & Amendments', 15, 'liters', 12, now() - interval '16 days', now());

-- Fertilizers Category
INSERT INTO inventory (owner_id, item_name, category, quantity, unit, reorder_threshold, created_at, updated_at) VALUES
('00000000-0000-0000-0000-000000000001'::uuid, 'Organic Fertilizer Pellets (2kg)', 'Fertilizers', 5, 'packs', 10, now() - interval '3 days', now()),
('00000000-0000-0000-0000-000000000001'::uuid, 'Liquid Plant Food (500ml)', 'Fertilizers', 12, 'bottles', 10, now() - interval '4 days', now()),
('00000000-0000-0000-0000-000000000001'::uuid, 'Slow-Release Fertilizer Sticks', 'Fertilizers', 30, 'sticks', 25, now() - interval '6 days', now()),
('00000000-0000-0000-0000-000000000001'::uuid, 'Vegetable Fertilizer (1kg)', 'Fertilizers', 8, 'packs', 6, now() - interval '8 days', now());

-- Tools Category
INSERT INTO inventory (owner_id, item_name, category, quantity, unit, reorder_threshold, created_at, updated_at) VALUES
('00000000-0000-0000-0000-000000000001'::uuid, 'Hand Pruner Shears', 'Tools', 4, 'units', 3, now() - interval '20 days', now()),
('00000000-0000-0000-0000-000000000001'::uuid, 'Watering Can (2L)', 'Tools', 3, 'units', 2, now() - interval '18 days', now()),
('00000000-0000-0000-0000-000000000001'::uuid, 'Plant Mister Spray Bottle', 'Tools', 6, 'units', 4, now() - interval '15 days', now()),
('00000000-0000-0000-0000-000000000001'::uuid, 'Soil Moisture Meter', 'Tools', 5, 'units', 3, now() - interval '10 days', now()),
('00000000-0000-0000-0000-000000000001'::uuid, 'Small Trowel', 'Tools', 7, 'units', 5, now() - interval '12 days', now());

-- Equipment Category
INSERT INTO inventory (owner_id, item_name, category, quantity, unit, reorder_threshold, created_at, updated_at) VALUES
('00000000-0000-0000-0000-000000000001'::uuid, 'LED Grow Light (20W)', 'Equipment', 2, 'units', 1, now() - interval '25 days', now()),
('00000000-0000-0000-0000-000000000001'::uuid, 'Grow Light Stand', 'Equipment', 1, 'units', 1, now() - interval '30 days', now()),
('00000000-0000-0000-0000-000000000001'::uuid, 'Small Water Fountain Pump', 'Equipment', 1, 'units', 1, now() - interval '22 days', now());

-- Accessories Category
INSERT INTO inventory (owner_id, item_name, category, quantity, unit, reorder_threshold, created_at, updated_at) VALUES
('00000000-0000-0000-0000-000000000001'::uuid, 'Plant Labels & Markers', 'Accessories', 50, 'units', 40, now() - interval '10 days', now()),
('00000000-0000-0000-0000-000000000001'::uuid, 'Moss Poles (Plant Support)', 'Accessories', 8, 'units', 6, now() - interval '14 days', now()),
('00000000-0000-0000-0000-000000000001'::uuid, 'Plant Climbing Trellis', 'Accessories', 6, 'units', 4, now() - interval '17 days', now()),
('00000000-0000-0000-0000-000000000001'::uuid, 'Twine/String (Natural)', 'Accessories', 10, 'rolls', 8, now() - interval '11 days', now());

-- Pest Control Category
INSERT INTO inventory (owner_id, item_name, category, quantity, unit, reorder_threshold, created_at, updated_at) VALUES
('00000000-0000-0000-0000-000000000001'::uuid, 'Insecticidal Soap (500ml)', 'Pest Control', 2, 'bottles', 3, now() - interval '11 days', now()),
('00000000-0000-0000-0000-000000000001'::uuid, 'Neem Oil Spray', 'Pest Control', 3, 'bottles', 2, now() - interval '9 days', now()),
('00000000-0000-0000-0000-000000000001'::uuid, 'Sticky Trap Sheets', 'Pest Control', 24, 'sheets', 20, now() - interval '7 days', now());

-- Watering Category
INSERT INTO inventory (owner_id, item_name, category, quantity, unit, reorder_threshold, created_at, updated_at) VALUES
('00000000-0000-0000-0000-000000000001'::uuid, 'Drip Watering System', 'Watering', 2, 'units', 1, now() - interval '19 days', now()),
('00000000-0000-0000-0000-000000000001'::uuid, 'Water Globes (Plant Watering)', 'Watering', 8, 'units', 6, now() - interval '16 days', now());
