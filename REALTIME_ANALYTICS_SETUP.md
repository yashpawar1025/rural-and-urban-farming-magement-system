# Real-Time Analytics Dashboard Setup Guide

## 🎯 Overview
The Analytics dashboards (Rural & Urban) now display **live, real-time data** that updates instantly as users add or modify data through forms.

## ✨ What's New

### Real-Time Features
- 🔴 **Live Connection Indicator**: Shows "🔴 Live" (red pulsing dot) when connected to database
- ⚪ **Demo Mode**: Shows "⚪ Demo" when using sample data
- ⏰ **Last Update Timestamp**: Displays the exact time of the last data change
- 📊 **Instant Calculations**: All metrics update within milliseconds of form submissions

### How It Works

```
User fills form → Submits → Database receives data
                              ↓
                    Real-time subscription triggered
                              ↓
                    Analytics state updates
                              ↓
                    Charts & metrics recalculate
                              ↓
                    UI updates instantly (no page refresh needed!)
```

## 🚀 Quick Start

### 1. **Login/Register**
Navigate to http://localhost:5173/login or /register
- Use any credentials (demo mode works)
- Or use real Supabase credentials if configured

### 2. **View Real-Time Analytics**

#### Rural Farm Dashboard
```
http://localhost:5173/rural/analytics
```
Shows live data from:
- Crop yields and performance
- Financial records (income/expenses)
- Inventory stock levels
- Livestock counts

#### Urban Garden Dashboard
```
http://localhost:5173/urban/analytics
```
Shows live data from:
- Plant growth tracking
- Profit trends (revenue vs costs)
- Water efficiency
- Best crop performance

### 3. **Add Data & Watch Dashboard Update**

#### Rural Farm Example
1. Go to http://localhost:5173/rural/crops-management
2. Click "Add Crop" and fill the form
3. Submit the form
4. **Watch** → Go back to Analytics tab
5. **See** → New crop appears instantly in charts

#### Urban Garden Example
1. Go to http://localhost:5173/urban/inventory
2. Add a new plant item
3. Go to http://localhost:5173/urban/analytics
4. **Observe** → Metrics update in real-time

## 📊 Analytics Dashboards

### Rural Analytics Dashboard
**Location**: `/rural/analytics`

**Real-Time Metrics:**
```
┌─────────────────────────────────────────────────────┐
│ 💰 Total Revenue          💸 Total Expenses         │
│ Sums all income records   Sums all expense records  │
│                                                     │
│ 📈 Net Profit             📊 Profit Margin          │
│ Income - Expenses         (Profit/Income) × 100     │
│                                                     │
│ 🌾 Active Crops           🐄 Livestock              │
│ Count of crops            Sum of animal counts      │
│                                                     │
│ 📦 Resource Efficiency    ⏰ Last Update Time       │
│ Inventory optimization    When data was last added  │
└─────────────────────────────────────────────────────┘
```

**Live Charts:**
1. **Financial Growth Line Chart**
   - Last 6 months profit trend
   - Updates when financial records change

2. **Crop Yield Bar Chart**
   - Top 5 crops by actual_yield
   - Updates when crop data changes

3. **Inventory Status Pie Chart**
   - Distribution: Low Stock / Adequate / Overstocked
   - Updates when inventory changes

4. **Monthly Breakdown Table**
   - Income, expense, profit per month
   - Recalculates on each financial record change

### Urban Analytics Dashboard
**Location**: `/urban/analytics`

**Real-Time Metrics:**
```
┌──────────────────────────────────────────┐
│ 🌱 Total Plants                          │
│ Count of active crops                    │
│                                          │
│ 💰 Monthly Profit                        │
│ Average profit over 6 months              │
│                                          │
│ 💧 Water Efficiency                      │
│ Calculated from irrigation schedules     │
└──────────────────────────────────────────┘
```

**Live Charts:**
1. **Plant Growth Line Chart**
   - Weekly height progression
   - Updates when crop growth data changes

2. **Profit Comparison Bar Chart**
   - Revenue vs Costs over 6 months
   - Updates when financial records change

3. **Performance Summary Cards**
   - Best crop, water efficiency, harvest, cost savings
   - Recalculates instantly

## 🔌 Real-Time Data Flow

### For Crops
```javascript
// User adds a crop via form
await createCrop({ name: "Wheat", ... })
  ↓
// Database records it with owner_id
{
  id: "uuid",
  owner_id: "user-id",
  name: "Wheat",
  actual_yield: 45,
  created_at: "2026-04-28T10:30:00Z"
}
  ↓
// Real-time subscription fires INSERT event
useRealtime({
  table: 'crops',
  filter: `owner_id=eq.${user.id}`,  // Only this user's data
  onInsert: (crop) => {
    setCrops(prev => [crop, ...prev])  // Add to state
    setLastUpdate(new Date().toLocaleTimeString())
  }
})
  ↓
// useMemo recalculates
const metrics = useMemo(() => {
  const totalYield = crops.reduce((sum, c) => sum + c.actual_yield, 0)
  // ...other calculations
}, [crops])  // Recalc whenever crops array changes
  ↓
// Charts re-render with new data
// UI updates instantly!
```

### For Financial Records
```javascript
// User adds income/expense
await createFinancialRecord({
  record_type: "income",
  amount: 5000,
  record_date: "2026-04-28",
  ...
})
  ↓
// Real-time INSERT event
onInsert: (record) => {
  setFinancialRecords(prev => [record, ...prev])
}
  ↓
// Metrics recalculate:
const income = financialRecords
  .filter(r => r.record_type === 'income')
  .reduce((sum, r) => sum + Number(r.amount), 0)

const profit = income - expenses  // Updates instantly
  ↓
// Financial Growth chart re-renders
// Profit card updates
// Monthly breakdown recalculates
```

### For Inventory
```javascript
// User updates stock level
await updateInventoryItem(id, { quantity: 50 })
  ↓
// Real-time UPDATE event
onUpdate: (item) => {
  setInventory(prev => 
    prev.map(i => i.id === item.id ? item : i)
  )
}
  ↓
// Efficiency metric recalculates:
const resourceEfficiency = 
  (adequateItems / totalItems) * 100
  ↓
// Pie chart updates
// Efficiency card updates
```

## ⚙️ Configuration

### Enable Live Database (Optional)
If you want to use real Supabase instead of demo data:

1. **Set Environment Variables** (`.env` or `.env.local`)
```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_PROJECT_NAME=SmartFarm
VITE_PROJECT_ID=your-project-id
```

2. **Execute Migrations** in Supabase Dashboard
   - SQL Editor → Run migrations from `supabase/migrations/`
   - OR use: `supabase migration up`

3. **Enable Real-Time on Tables**
   ```sql
   ALTER TABLE crops REPLICA IDENTITY FULL;
   ALTER TABLE livestock REPLICA IDENTITY FULL;
   ALTER TABLE financial_records REPLICA IDENTITY FULL;
   ALTER TABLE inventory REPLICA IDENTITY FULL;
   ALTER TABLE irrigation_schedules REPLICA IDENTITY FULL;
   ```

4. **Restart Dev Server**
   ```bash
   pnpm exec vite
   ```

### Demo Mode (Default)
- No configuration needed
- Uses sample data from `src/lib/demoInventoryData.ts`
- Real-time subscriptions still work with local state
- Shows "⚪ Demo" status indicator

## 📋 Supported Data Types

### Rural Farm
- **Crops**: Name, growth_stage, expected_yield, actual_yield
- **Livestock**: Type, count, breed, health_status
- **Financial Records**: record_type (income/expense), amount, record_date
- **Inventory**: item_name, category, quantity, unit, reorder_threshold

### Urban Garden
- **Crops**: Plant type, growth_stage, expected_yield, actual_yield
- **Financial Records**: Revenue (income) and Costs (expense)
- **Irrigation Schedules**: daily_water_usage, frequency
- **Inventory**: Plant supplies, seeds, tools

## 🐛 Troubleshooting

### Dashboard Shows No Data
**Cause**: No data has been added yet via forms
**Solution**: 
1. Add crops, financial records, or inventory items
2. Watch the "Last Update" timestamp change
3. Charts will populate once data exists

### Status Shows "⚪ Demo" Instead of "🔴 Live"
**Cause**: Supabase environment variables not configured
**Solution**:
1. Set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in `.env`
2. Ensure migrations are executed in Supabase Dashboard
3. Restart dev server: `pnpm exec vite`

### Charts Not Updating
**Cause**: Real-time subscription hasn't triggered
**Solution**:
1. Open browser DevTools (F12)
2. Go to Console tab
3. Look for "✅ Real-time X added:" messages
4. If no messages, check:
   - Are you logged in?
   - Is the form submission working?
   - Is Supabase configured?

### Stale Data in Charts
**Solution**: Add a manual refresh
```typescript
// In Analytics page useEffect
const refetchData = useCallback(() => {
  // Refetch all data
  Promise.all([...]).then(/* update state */)
}, [])

// Call periodically or on manual refresh
```

## 📈 Example Workflows

### Workflow 1: Farmer Tracks Daily Progress
1. **9:00 AM**: Farmer opens Rural Analytics Dashboard
2. **9:30 AM**: Farmer adds crop yields for the day in Crops Management
3. **9:35 AM**: ✨ Crop Yield chart updates automatically
4. **10:00 AM**: Farmer records expenses in Financial Records
5. **10:05 AM**: ✨ Profit metrics and Financial Growth chart update instantly
6. **Result**: No page refresh needed, real-time insights

### Workflow 2: Urban Gardener Monitors Growth
1. **Morning**: Urban gardener checks Analytics
2. **Updates plant heights** in Crop Management
3. **Plant Growth chart updates in real-time**
4. **Adds harvest data** to Financial Records (income)
5. **Profit and Harvest metrics update instantly**
6. **Result**: Live performance tracking as gardening happens

## 🎓 Technical Details

### Real-Time Subscription Pattern
```typescript
// Every Analytics page uses this pattern:
useRealtime({
  table: 'crops',                      // Watch this table
  filter: `owner_id=eq.${user.id}`,   // Only this user's data
  onInsert: (crop) => {
    setCrops(prev => [crop, ...prev]) // Add to state
    setLastUpdate(new Date().toLocaleTimeString())
    setRealtimeConnected(true)         // Show live indicator
  },
  // onUpdate and onDelete handlers follow same pattern
})
```

### Dependency Management
```typescript
// useMemo ensures calculations update when data changes
const metrics = useMemo(() => {
  // Calculate everything from current state
  const profit = income - expenses
  const avgYield = totalYield / cropCount
  // etc.
}, [crops, livestock, financialRecords, inventory])
// Recalculates whenever any data array changes
```

### Performance Optimization
- Updates are batched per table (not per item)
- Charts use `memoization` to prevent unnecessary re-renders
- Large datasets are sliced (showing top 5-10 items)
- Calculations run in `useMemo` and `useCallback` hooks

## 🔐 Security Notes
- Each user only sees their own data (`owner_id=eq.${user.id}` filter)
- Real-time subscriptions are user-specific
- No data leakage between users
- Supabase Row-Level Security (RLS) enforces permissions

## 📞 Support
For issues or questions:
1. Check Browser Console (F12) for error messages
2. Look for "✅ Real-time" log messages confirming updates
3. Verify Supabase credentials in `.env`
4. Ensure migrations are executed if using live database

---

**Status**: ✅ Ready for real-time analytics!  
Last Updated: April 28, 2026
