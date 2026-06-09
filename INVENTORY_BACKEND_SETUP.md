# Attaching Inventory Data to Supabase Backend

## Overview
You now have 70 comprehensive inventory items (35 rural + 35 urban) ready to be synced to your Supabase backend through 5 migration files.

## Migration Files Ready

✅ **00001_create_initial_schema.sql** - Creates all tables including inventory
✅ **00002_insert_seed_data.sql** - Seeds crop encyclopedia & government schemes  
✅ **00003_enable_realtime_and_storage.sql** - Enables real-time subscriptions
✅ **00004_add_image_url_columns.sql** - Adds image_url columns
✅ **00005_insert_inventory_data.sql** - Inserts all 70 inventory items (NEW)

---

## Step 1: Execute Migrations in Supabase Dashboard

### Method A: Direct SQL Editor (Recommended)

1. Go to https://app.supabase.com
2. Select your project: **SmartFarm** (ID: xhwcxtkiwxhkyywppkhv)
3. Navigate to **SQL Editor** → **New Query**
4. Copy and paste each migration file in order:

#### Execute in this order:

**First:** Copy content from `supabase/migrations/00001_create_initial_schema.sql`
- Click **Run**
- Wait for completion ✅

**Second:** Copy content from `supabase/migrations/00002_insert_seed_data.sql`
- Click **Run**
- Wait for completion ✅

**Third:** Copy content from `supabase/migrations/00003_enable_realtime_and_storage.sql`
- Click **Run**
- Wait for completion ✅

**Fourth:** Copy content from `supabase/migrations/00004_add_image_url_columns.sql`
- Click **Run**
- Wait for completion ✅

**Fifth:** Copy content from `supabase/migrations/00005_insert_inventory_data.sql`
- Click **Run**
- Wait for completion ✅

### Method B: CLI (If Docker works)

```bash
cd "d:\R & U farming"
supabase db push
```

---

## Step 2: Verify Installation

After all migrations complete, verify in Supabase:

1. Go to **Table Editor**
2. Click on **inventory** table
3. You should see **70 rows** with:
   - 35 items for rural farming (owner_id: 00000000-0000-0000-0000-000000000000)
   - 35 items for urban gardening (owner_id: 00000000-0000-0000-0000-000000000001)

### Expected Data:

**Rural Inventory (35 items):**
- 5 Seeds items (Tomato, Mung Bean, Potato, Cabbage, Chili)
- 6 Fertilizer items (NPK, Urea, Vermicompost, Calcium, Micro-mix, DAP)
- 4 Pesticide items (Neem Oil, Copper Sulfate, Pyrethrin, Sulfur)
- 4 Tool items (Spading Fork, Mulching Cloth, Hoe, Pruning Shears)
- 2 Irrigation items (Drip Tape, Garden Hose)
- 4 Equipment items (Pump, Sprayer, Tiller, Sprayer Pump)
- 2 Storage items (Storage Bins, Burlap Sacks)
- 2 Harvesting items (Baskets, Knife/Sickle)
- 3 Safety items (Gloves, Masks, Boots)
- 2 Soil Amendment items (Gypsum, Limestone)
- 1 Other item (Twine)

**Urban Inventory (35 items):**
- 5 Seeds items (Cherry Tomato, Lettuce, Herbs, Bell Pepper, Spinach)
- 5 Container items (8cm pots, 15cm pots, Hanging Baskets, Saucers, Self-watering)
- 4 Soil & Amendment items (Potting Soil, Perlite, Coco Coir, Mulch)
- 4 Fertilizer items (Organic Pellets, Liquid Food, Slow-release, Vegetable)
- 5 Tool items (Pruners, Watering Can, Mister, Moisture Meter, Trowel)
- 3 Equipment items (LED Grow Light, Stand, Water Pump)
- 4 Accessory items (Labels, Moss Poles, Trellis, Twine)
- 3 Pest Control items (Insecticidal Soap, Neem Oil, Sticky Traps)
- 2 Watering items (Drip System, Water Globes)

---

## Step 3: Test in Your App

After migrations complete:

1. Start your app: `pnpm exec vite`
2. Navigate to `/rural/inventory` and `/urban/inventory`
3. The app should now:
   - Load data from Supabase (instead of demo data)
   - Allow you to add/edit/delete items
   - Show real-time updates
   - Persist data across sessions

---

## Step 4: Update App Configuration (Optional)

The demo data will automatically be replaced by Supabase data. If you want to:

### A) Keep using demo data as fallback:
- No changes needed! The app already has conditional logic:
  ```typescript
  if (!isSupabaseConfigured) {
    setInventory(DEMO_INVENTORY);  // Falls back if connection fails
  } else {
    const data = await getInventory(user.id);  // Uses Supabase
  }
  ```

### B) Remove demo data constants:
- Edit `/src/pages/rural/Inventory.tsx` - Remove `DEMO_INVENTORY` array
- Edit `/src/pages/urban/Inventory.tsx` - Remove `DEMO_URBAN_INVENTORY` array
- Update the conditional check to always call API

---

## Troubleshooting

### Q: "Table 'inventory' does not exist"
**A:** You skipped migration 00001. Run it first to create all tables.

### Q: "Foreign key violation on owner_id"
**A:** The demo owner_ids don't exist. Do one of:
1. Replace `00000000-0000-0000-0000-000000000000` with your actual user UUID
2. Create a demo profile first:
   ```sql
   INSERT INTO profiles (id, username, email, role, farm_type) VALUES
   ('00000000-0000-0000-0000-000000000000'::uuid, 'demo-rural', 'rural@demo.com', 'user', 'rural'),
   ('00000000-0000-0000-0000-000000000001'::uuid, 'demo-urban', 'urban@demo.com', 'user', 'urban');
   ```

### Q: "No data showing in app"
**A:** 
1. Check `isSupabaseConfigured` is true
2. Verify `.env` has correct `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`
3. Check browser console for API errors
4. Verify inventory rows exist: Go to Supabase → Table Editor → inventory

### Q: "App still showing demo data"
**A:** Check that you're logged in with the same user ID as the inventory data. Or check network tab to see if API calls are happening.

---

## Stock Status Color Coding

After migration, inventory items automatically show stock status:

- 🔴 **LOW STOCK** (Red): Quantity ≤ reorder_threshold
- 🟢 **ADEQUATE** (Green): quantity ≤ threshold × 1.5
- 🟡 **OVERSTOCKED** (Amber): quantity > threshold × 1.5

Example:
- Hybrid Tomato: 25 kg (threshold 50) → **LOW STOCK** 🔴
- NPK Fertilizer: 150 kg (threshold 100) → **ADEQUATE** 🟢
- Vermicompost: 300 kg (threshold 150) → **OVERSTOCKED** 🟡

---

## Next Steps

After successful migration:

1. ✅ Add more users and inventory items via the app UI
2. ✅ Set up real-time subscriptions (already enabled)
3. ✅ Deploy Edge Functions for AI features
4. ✅ Configure storage buckets for images
5. ✅ Enable Row-Level Security (RLS) policies for multi-user safety

---

## Timeline

- **Demo Mode**: App fully functional without backend (✅ Current state)
- **After Migration**: App syncs with Supabase (⏳ Next step)
- **Live Data**: All 70 items sync in real-time across devices
- **Full Production**: Multi-user support, RLS policies, backup

---

**Questions?** Check the migration file at: `supabase/migrations/00005_insert_inventory_data.sql`
