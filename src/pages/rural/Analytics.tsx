import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { GlassCard } from '@/components/common/GlassCard';
import { Skeleton } from '@/components/ui/skeleton';
import { Bar, Line, Pie } from 'react-chartjs-2';
import { getCrops, getFinancialRecords, getInventory, getLivestock } from '@/db/api';
import { useRealtime } from '@/hooks/useRealtime';
import { isSupabaseConfigured } from '@/db/supabase';
import { DEMO_RURAL_INVENTORY } from '@/lib/demoInventoryData';
import type { Crop, FinancialRecord, Inventory, Livestock } from '@/types/types';
import { TrendingUp, TrendingDown, DollarSign, Leaf, Package, Zap, Activity } from 'lucide-react';
import { toast } from 'sonner';

export default function Analytics() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [realtimeConnected, setRealtimeConnected] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<string>('Loading...');
  
  // Data state
  const [crops, setCrops] = useState<Crop[]>([]);
  const [livestock, setLivestock] = useState<Livestock[]>([]);
  const [financialRecords, setFinancialRecords] = useState<FinancialRecord[]>([]);
  const [inventory, setInventory] = useState<Inventory[]>([]);

  // Fetch all data
  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }
    
    const fetchData = async () => {
      try {
        setLoading(true);
        const [cropsData, livestockData, financialData, inventoryData] = await Promise.all([
          getCrops(user.id),
          getLivestock(user.id),
          getFinancialRecords(user.id),
          isSupabaseConfigured ? getInventory(user.id) : Promise.resolve(DEMO_RURAL_INVENTORY),
        ]);
        
        setCrops(cropsData);
        setLivestock(livestockData);
        setFinancialRecords(financialData);
        setInventory(inventoryData);
      } catch (error) {
        console.error('Failed to fetch analytics data:', error);
        toast.error('Failed to load analytics data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  // Real-time subscriptions with connection status
  useRealtime({
    table: 'crops',
    filter: user ? `owner_id=eq.${user.id}` : undefined,
    onInsert: (crop) => {
      setCrops(prev => [crop, ...prev]);
      setLastUpdate(new Date().toLocaleTimeString());
      setRealtimeConnected(true);
      console.log('✅ Real-time crop added:', crop);
    },
    onUpdate: (crop) => {
      setCrops(prev => prev.map(c => c.id === crop.id ? crop : c));
      setLastUpdate(new Date().toLocaleTimeString());
      setRealtimeConnected(true);
      console.log('✅ Real-time crop updated:', crop);
    },
    onDelete: (crop) => {
      setCrops(prev => prev.filter(c => c.id !== crop.id));
      setLastUpdate(new Date().toLocaleTimeString());
      setRealtimeConnected(true);
      console.log('✅ Real-time crop deleted:', crop.id);
    },
  });

  useRealtime({
    table: 'livestock',
    filter: user ? `owner_id=eq.${user.id}` : undefined,
    onInsert: (animal) => {
      setLivestock(prev => [animal, ...prev]);
      setLastUpdate(new Date().toLocaleTimeString());
      setRealtimeConnected(true);
    },
    onUpdate: (animal) => {
      setLivestock(prev => prev.map(a => a.id === animal.id ? animal : a));
      setLastUpdate(new Date().toLocaleTimeString());
      setRealtimeConnected(true);
    },
    onDelete: (animal) => {
      setLivestock(prev => prev.filter(a => a.id !== animal.id));
      setLastUpdate(new Date().toLocaleTimeString());
      setRealtimeConnected(true);
    },
  });

  useRealtime({
    table: 'financial_records',
    filter: user ? `owner_id=eq.${user.id}` : undefined,
    onInsert: (record) => {
      setFinancialRecords(prev => [record, ...prev]);
      setLastUpdate(new Date().toLocaleTimeString());
      setRealtimeConnected(true);
      console.log('✅ Real-time financial record added:', record);
    },
    onUpdate: (record) => {
      setFinancialRecords(prev => prev.map(r => r.id === record.id ? record : r));
      setLastUpdate(new Date().toLocaleTimeString());
      setRealtimeConnected(true);
    },
    onDelete: (record) => {
      setFinancialRecords(prev => prev.filter(r => r.id !== record.id));
      setLastUpdate(new Date().toLocaleTimeString());
      setRealtimeConnected(true);
    },
  });

  // Calculate metrics in real-time
  const metrics = useMemo(() => {
    const income = financialRecords
      .filter(r => r.record_type === 'income')
      .reduce((sum, r) => sum + Number(r.amount), 0);
    
    const expenses = financialRecords
      .filter(r => r.record_type === 'expense')
      .reduce((sum, r) => sum + Number(r.amount), 0);
    
    const profit = income - expenses;
    const profitMargin = income > 0 ? (profit / income * 100).toFixed(1) : 0;
    
    const totalYield = crops.reduce((sum, c) => sum + (c.actual_yield || 0), 0);
    const avgYieldPerCrop = crops.length > 0 ? (totalYield / crops.length).toFixed(2) : 0;
    
    const lowStockItems = inventory.filter(i => i.quantity <= i.reorder_threshold).length;
    const resourceEfficiency = inventory.length > 0 ? (((inventory.length - lowStockItems) / inventory.length) * 100).toFixed(0) : 0;
    
    const totalAnimals = livestock.reduce((sum, a) => sum + a.count, 0);
    
    // Last 6 months financial data
    const last6Months = Array.from({ length: 6 }, (_, i) => {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const monthStr = date.toLocaleString('default', { month: 'short' });
      
      const monthRecords = financialRecords.filter(r => {
        const recordDate = new Date(r.record_date);
        return recordDate.getMonth() === date.getMonth() && recordDate.getFullYear() === date.getFullYear();
      });
      
      const monthIncome = monthRecords
        .filter(r => r.record_type === 'income')
        .reduce((sum, r) => sum + Number(r.amount), 0);
      
      const monthExpense = monthRecords
        .filter(r => r.record_type === 'expense')
        .reduce((sum, r) => sum + Number(r.amount), 0);
      
      return { month: monthStr, income: monthIncome, expense: monthExpense };
    }).reverse();
    
    return {
      income,
      expenses,
      profit,
      profitMargin,
      avgYieldPerCrop,
      totalYield,
      resourceEfficiency,
      lowStockItems,
      totalCrops: crops.length,
      totalAnimals,
      last6Months,
    };
  }, [crops, livestock, financialRecords, inventory]);

  // Chart data from real data
  const cropYieldData = {
    labels: crops.slice(0, 5).map(c => c.name),
    datasets: [{
      label: 'Actual Yield (tons)',
      data: crops.slice(0, 5).map(c => c.actual_yield || 0),
      backgroundColor: ['hsl(var(--chart-1))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))', 'hsl(var(--chart-5))'],
    }],
  };

  const financialGrowthData = {
    labels: metrics.last6Months.map(m => m.month),
    datasets: [{
      label: 'Profit ($)',
      data: metrics.last6Months.map(m => m.income - m.expense),
      borderColor: 'hsl(var(--primary))',
      backgroundColor: 'hsla(var(--primary), 0.1)',
      tension: 0.4,
      fill: true,
    }],
  };

  const resourceUsageData = {
    labels: ['Low Stock', 'Adequate Stock', 'Overstocked'],
    datasets: [{
      data: [
        metrics.lowStockItems,
        inventory.filter(i => i.quantity > i.reorder_threshold && i.quantity <= i.reorder_threshold * 1.5).length,
        inventory.filter(i => i.quantity > i.reorder_threshold * 1.5).length,
      ],
      backgroundColor: ['hsl(var(--destructive))', 'hsl(var(--primary))', 'hsl(var(--chart-4))'],
    }],
  };

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <Skeleton className="h-32 w-full rounded-xl" />
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {[1, 2, 3, 4, 5, 6].map(i => <Skeleton key={i} className="h-24 rounded-lg" />)}
        </div>
        <Skeleton className="h-80 w-full rounded-xl" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      <div className="gradient-animate rounded-lg p-8 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Analytics Dashboard</h1>
            <p className="text-white/90">Real-time farm performance insights</p>
          </div>
          <div className="flex items-center gap-2">
            <Activity className={`h-5 w-5 ${isSupabaseConfigured && realtimeConnected ? 'text-green-400 animate-pulse' : 'text-gray-400'}`} />
            <span className="text-sm">{isSupabaseConfigured && realtimeConnected ? '🔴 Live' : '⚪ Demo'}</span>
          </div>
        </div>
      </div>

      {!isSupabaseConfigured && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          ℹ️ Demo Mode: Using sample data. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to enable live database updates.
          <br />
          <span className="text-xs mt-2 block">Last update: {lastUpdate}</span>
        </div>
      )}
      
      {isSupabaseConfigured && (
        <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
          ✅ Real-time connected. Dashboard updates as you add data via forms.
          <br />
          <span className="text-xs mt-2 block">Last update: {lastUpdate}</span>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <GlassCard>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Total Revenue</p>
              <p className="text-3xl font-bold text-primary">${metrics.income.toFixed(2)}</p>
              <p className="text-xs text-muted-foreground mt-2">All income sources</p>
            </div>
            <DollarSign className="h-8 w-8 text-emerald-600 opacity-20" />
          </div>
        </GlassCard>

        <GlassCard>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Total Expenses</p>
              <p className="text-3xl font-bold text-destructive">${metrics.expenses.toFixed(2)}</p>
              <p className="text-xs text-muted-foreground mt-2">Operational costs</p>
            </div>
            <TrendingDown className="h-8 w-8 text-destructive opacity-20" />
          </div>
        </GlassCard>

        <GlassCard>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Net Profit</p>
              <p className={`text-3xl font-bold ${metrics.profit >= 0 ? 'text-emerald-600' : 'text-destructive'}`}>
                ${metrics.profit.toFixed(2)}
              </p>
              <p className="text-xs text-muted-foreground mt-2">{metrics.profitMargin}% margin</p>
            </div>
            <TrendingUp className={`h-8 w-8 ${metrics.profit >= 0 ? 'text-emerald-600' : 'text-destructive'} opacity-20`} />
          </div>
        </GlassCard>

        <GlassCard>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Active Crops</p>
              <p className="text-3xl font-bold text-primary">{metrics.totalCrops}</p>
              <p className="text-xs text-muted-foreground mt-2">Total yield: {metrics.totalYield.toFixed(1)} tons</p>
            </div>
            <Leaf className="h-8 w-8 text-primary opacity-20" />
          </div>
        </GlassCard>

        <GlassCard>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Livestock</p>
              <p className="text-3xl font-bold text-primary">{metrics.totalAnimals}</p>
              <p className="text-xs text-muted-foreground mt-2">{livestock.length} animal types</p>
            </div>
            <Zap className="h-8 w-8 text-primary opacity-20" />
          </div>
        </GlassCard>

        <GlassCard>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Resource Efficiency</p>
              <p className="text-3xl font-bold text-primary">{metrics.resourceEfficiency}%</p>
              <p className="text-xs text-muted-foreground mt-2">{metrics.lowStockItems} items low stock</p>
            </div>
            <Package className="h-8 w-8 text-primary opacity-20" />
          </div>
        </GlassCard>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <GlassCard title="Financial Growth" description="Monthly profit trend">
          {metrics.last6Months.length > 0 ? (
            <Line data={financialGrowthData} options={{ responsive: true, maintainAspectRatio: true, plugins: { legend: { display: true } } }} />
          ) : (
            <p className="text-center py-8 text-muted-foreground">No financial data yet</p>
          )}
        </GlassCard>

        <GlassCard title="Crop Yield" description="Top 5 crops by yield">
          {crops.length > 0 ? (
            <Bar data={cropYieldData} options={{ responsive: true, maintainAspectRatio: true, plugins: { legend: { display: true } } }} />
          ) : (
            <p className="text-center py-8 text-muted-foreground">No crop data yet</p>
          )}
        </GlassCard>

        <GlassCard title="Inventory Status" description="Stock level distribution">
          <Pie data={resourceUsageData} options={{ responsive: true, maintainAspectRatio: true, plugins: { legend: { display: true } } }} />
        </GlassCard>

        <GlassCard title="Monthly Breakdown" description="Last 6 months performance">
          <div className="space-y-3 max-h-80 overflow-y-auto">
            {metrics.last6Months.map((month, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 bg-accent rounded-lg">
                <span className="text-sm font-medium">{month.month}</span>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-emerald-600">Income: ${month.income.toFixed(0)}</span>
                  <span className="text-xs text-destructive">Expense: ${month.expense.toFixed(0)}</span>
                  <span className={`text-xs font-semibold ${month.income - month.expense >= 0 ? 'text-emerald-600' : 'text-destructive'}`}>
                    ${(month.income - month.expense).toFixed(0)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <GlassCard title="Average Yield" description="Per crop type">
          <p className="text-3xl font-bold text-primary">{metrics.avgYieldPerCrop} tons</p>
          <p className="text-xs text-muted-foreground mt-2">Across {metrics.totalCrops} active crops</p>
        </GlassCard>

        <GlassCard title="Profit Margin" description="Revenue efficiency">
          <p className="text-3xl font-bold text-primary">{metrics.profitMargin}%</p>
          <p className="text-xs text-muted-foreground mt-2">Return on investment</p>
        </GlassCard>

        <GlassCard title="Inventory Health" description="Reorder status">
          <p className="text-3xl font-bold text-primary">{metrics.resourceEfficiency}%</p>
          <p className="text-xs text-muted-foreground mt-2">Optimal stock levels</p>
        </GlassCard>
      </div>
    </div>
  );
}
