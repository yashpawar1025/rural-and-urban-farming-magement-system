# 🚀 QUICK START: Supabase Connection

## ✅ Your Credentials (Already Configured!)

```
Project Name: SmartFarm
Project ID: xhwcxtkiwxhkyywppkhv
Project URL: https://xhwcxtkiwxhkyywppkhv.supabase.co
Public Key: sb_publishable_4QnLoKpmZZ2PrUKU1U0D6Q_yXUHQbsX
```

---

## 📋 3-Step Setup

### **Step 1: Execute SQL Migrations**

1. Open: https://app.supabase.com
2. Go to: **SmartFarm** project → **SQL Editor**
3. Create **New Query**
4. Copy-paste each file **IN ORDER**:
   - `/supabase/migrations/00001_create_initial_schema.sql`
   - `/supabase/migrations/00002_insert_seed_data.sql`
   - `/supabase/migrations/00003_enable_realtime_and_storage.sql`
   - `/supabase/migrations/00004_add_image_url_columns.sql`
5. Click **Run** for each

### **Step 2: Restart Dev Server**

```bash
cd "d:\R & U farming"
pnpm exec vite
```

### **Step 3: Test Connection**

1. Go to http://localhost:5173
2. Register new account
3. Create a crop/equipment entry
4. ✅ Verify data appears in Supabase dashboard

---

## 🔗 Useful Links

- **Supabase Dashboard**: https://app.supabase.com
- **SQL Editor**: https://app.supabase.com → SmartFarm → SQL Editor
- **Table Editor**: https://app.supabase.com → SmartFarm → Table Editor
- **Authentication**: https://app.supabase.com → SmartFarm → Authentication
- **App**: http://localhost:5173

---

## ✨ What's Included

✅ 22 database tables  
✅ Real-time subscriptions  
✅ Image storage buckets  
✅ Row-level security  
✅ 50+ seed crop entries  
✅ Government schemes data  

---

## 📞 Need Help?

See full guide: `SUPABASE_SETUP_GUIDE.md`
