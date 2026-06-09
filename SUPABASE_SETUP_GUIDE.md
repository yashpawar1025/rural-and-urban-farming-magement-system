# 🌾 SmartFarm - Supabase Database Setup Guide

## ✅ Configuration Complete!

Your environment variables have been configured with your Supabase credentials:
- **Project Name**: SmartFarm
- **Project ID**: xhwcxtkiwxhkyywppkhv
- **Project URL**: https://xhwcxtkiwxhkyywppkhv.supabase.co

---

## 🔧 Next Steps: Execute Database Migrations

To fully connect your database, you need to run the SQL migration files on your Supabase instance. Follow these steps:

### **Option 1: Using Supabase Dashboard (Recommended for First Time)**

1. **Go to Supabase Dashboard**
   - Open: https://app.supabase.com
   - Sign in to your account
   - Select your **SmartFarm** project

2. **Navigate to SQL Editor**
   - Click on **"SQL Editor"** in the left sidebar
   - Click **"New Query"** button

3. **Run Migrations in Order**
   - Copy the entire contents of each migration file below
   - Paste into the SQL Editor
   - Click **"Run"** button
   - **IMPORTANT**: Run them in this order:

### **Migration Files to Execute**

---

#### **1️⃣ First: Create Schema (00001_create_initial_schema.sql)**

This creates all tables, enums, and indexes.

**Location**: `/supabase/migrations/00001_create_initial_schema.sql`

Copy this entire file content and run in Supabase SQL Editor.

**Tables Created**:
- ✅ profiles (user data)
- ✅ crops (crop management)
- ✅ livestock (animal tracking)
- ✅ inventory (stock management)
- ✅ equipment (farm equipment)
- ✅ financial_records (income/expenses)
- ✅ orders (order management)
- ✅ weather (weather data)
- ✅ crop_encyclopedia (crop reference data)
- ✅ crop_plans (urban farming plans)
- ✅ irrigation_schedules (water management)
- ✅ diagnoses (plant health diagnostics)
- ✅ farm_mapping (field mapping)
- ✅ government_schemes (subsidy/scheme info)
- ✅ analytics (farm analytics)
- ✅ alerts (notifications)

---

#### **2️⃣ Second: Insert Seed Data (00002_insert_seed_data.sql)**

This populates reference data (crop encyclopedia, schemes, etc.).

**Location**: `/supabase/migrations/00002_insert_seed_data.sql`

**Data Added**:
- 50+ crop encyclopedia entries
- Government schemes and subsidies
- Sample weather data
- Default reference data

---

#### **3️⃣ Third: Enable Realtime & Storage (00003_enable_realtime_and_storage.sql)**

This enables real-time subscriptions and sets up storage buckets.

**Location**: `/supabase/migrations/00003_enable_realtime_and_storage.sql`

**Enabled Features**:
- Real-time database subscriptions
- Image storage bucket for plant images
- Image storage bucket for crop photos
- Automatic row-level security

---

#### **4️⃣ Fourth: Add Image URL Columns (00004_add_image_url_columns.sql)**

This adds image URL columns to various tables.

**Location**: `/supabase/migrations/00004_add_image_url_columns.sql`

**Tables Updated**:
- crops (add image_url)
- livestock (add image_url)
- equipment (add image_url)

---

## 📋 Step-by-Step Instructions

### **Via Supabase Dashboard (Easy)**

1. Go to https://app.supabase.com
2. Click your **SmartFarm** project
3. Click **SQL Editor** in left sidebar
4. Click **New Query**
5. Open the file: `/supabase/migrations/00001_create_initial_schema.sql`
6. Copy all contents
7. Paste into the SQL Editor
8. Click **Run**
9. ✅ Wait for success message
10. Repeat steps 4-9 for files 00002, 00003, 00004 **IN ORDER**

### **Via Supabase CLI (Advanced)**

If you prefer command line:

```bash
cd "d:\R & U farming"

# Link to your Supabase project
supabase link --project-ref xhwcxtkiwxhkyywppkhv

# Push migrations
supabase db push
```

---

## 🔐 Security & Row-Level Security (RLS)

After migrations run, your database will have:
- ✅ **Row-Level Security** enabled on all tables
- ✅ Users can only see/modify their own data
- ✅ Authentication policies in place
- ✅ Real-time subscriptions filtered by user

---

## ✨ Features After Setup

Once migrations are complete, your app will have:

### **Real-Time Features**
- ✅ Live crop updates across devices
- ✅ Instant livestock changes
- ✅ Real-time inventory sync
- ✅ Equipment status updates
- ✅ Financial record sync

### **Storage Features**
- ✅ Plant image uploads
- ✅ Crop photo storage
- ✅ Document attachments
- ✅ Profile pictures

### **Database Features**
- ✅ 22 tables for farm management
- ✅ Automated timestamps (created_at, updated_at)
- ✅ Cascading deletes for data integrity
- ✅ Foreign key relationships
- ✅ Enums for type safety

---

## 🚀 After Setup is Complete

1. **Restart Development Server**
   ```bash
   pnpm exec vite
   ```

2. **Test Connection**
   - Go to http://localhost:5173/login
   - Register a new account (uses your Supabase auth)
   - Create a crop/livestock/equipment entry
   - Verify data saves to Supabase

3. **Check Supabase Dashboard**
   - Go to https://app.supabase.com
   - Click SmartFarm project
   - Click **Table Editor**
   - Verify tables have data

---

## 📞 Troubleshooting

### **Connection Issues?**

1. **Check Environment Variables**
   - Verify `.env` file exists in project root
   - Check values match exactly

2. **Verify SQL Migrations**
   - Run migrations in the correct order
   - No errors should appear

3. **Check Auth Setup**
   - Go to: https://app.supabase.com → SmartFarm → Authentication
   - Verify Auth is enabled

4. **Check RLS Policies**
   - Go to: SQL Editor
   - Run: `SELECT * FROM pg_policies;`
   - Should show policies on all tables

### **Still Having Issues?**

- Check browser console for errors (F12 → Console)
- Check Supabase logs: https://app.supabase.com → SmartFarm → Logs
- Verify internet connection to Supabase

---

## 📂 File Locations

```
d:\R & U farming\
├── .env                              (✅ Created with your credentials)
├── .env.example                      (Template file)
├── supabase/
│   └── migrations/
│       ├── 00001_create_initial_schema.sql
│       ├── 00002_insert_seed_data.sql
│       ├── 00003_enable_realtime_and_storage.sql
│       └── 00004_add_image_url_columns.sql
└── src/
    └── db/
        └── supabase.ts               (Configuration file)
```

---

## ✅ Verification Checklist

After completing setup:

- [ ] .env file created with credentials
- [ ] Ran migration 00001 successfully
- [ ] Ran migration 00002 successfully
- [ ] Ran migration 00003 successfully
- [ ] Ran migration 00004 successfully
- [ ] Development server restarted
- [ ] Can log in to the app
- [ ] Can create a crop entry
- [ ] Can see data in Supabase dashboard
- [ ] Real-time sync working

---

## 🎉 You're All Set!

Your SmartFarm database is now connected to Supabase and ready to use!

**Current Status**: ✅ Environment configured  
**Next**: Execute SQL migrations in Supabase Dashboard

