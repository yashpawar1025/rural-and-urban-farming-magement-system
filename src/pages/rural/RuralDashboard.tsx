import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { GlassCard } from '@/components/common/GlassCard';
import { SeasonalHero } from '@/components/common/SeasonalHero';
import { AlertPanel } from '@/components/common/AlertPanel';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { getDashboardStats, getCrops, getFinancialRecords, getInventory, getEquipment, getUnreadAlertCount } from '@/db/api';
import type { DashboardStats, Crop, FinancialRecord, Equipment, Inventory } from '@/types/types';
import { Skeleton } from '@/components/ui/skeleton';
import { TrendingUp, DollarSign, Droplet, Sprout, Plus, Calendar, Cloud, Sun, CloudRain, Wind, Activity, ShieldAlert, Wrench, Package, AlertTriangle, Target, TimerReset, BarChart3 } from 'lucide-react';
import { Bar, Line } from 'react-chartjs-2';
import { useNavigate } from 'react-router-dom';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

export default function RuralDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [inventory, setInventory] = useState<Inventory[]>([]);
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [alertCount, setAlertCount] = useState(0);
  const [weather, setWeather] = useState({
    temp: 24,
    condition: 'Sunny',
    humidity: 65,
    wind: 12,
    forecast: [
      { day: 'Today', temp: 24, icon: 'sun' },
      { day: 'Tomorrow', temp: 26, icon: 'cloud' },
      { day: 'Wed', temp: 22, icon: 'rain' },
    ]
  });

  const fetchData = async () => {
    if (!user) return;
    try {
      const [data, cropData, financialRecords, inventoryData, equipmentData, unreadAlerts] = await Promise.all([
        getDashboardStats(user.id, 'rural'),
        getCrops(user.id),
        getFinancialRecords(user.id),
        getInventory(user.id),
        getEquipment(user.id),
        getUnreadAlertCount(user.id),
      ]);

      setStats(data);
      setInventory(inventoryData);
      setEquipment(equipmentData);
      setAlertCount(unreadAlerts);
      
      // Fetch recent activity
      const activities: any[] = [];
      
      // Add recent crops
      cropData.slice(0, 3).forEach((crop: Crop) => {
        activities.push({
          type: 'crop',
          action: 'Added crop',
          description: crop.name,
          time: new Date(crop.created_at).toLocaleDateString(),
          icon: Sprout,
          color: 'text-green-600'
        });
      });
      
      // Add recent financial records
      financialRecords.slice(0, 3).forEach((record: FinancialRecord) => {
        activities.push({
          type: 'financial',
          action: record.record_type === 'income' ? 'Income recorded' : 'Expense recorded',
          description: `$${Number(record.amount).toFixed(2)} - ${record.category || 'General'}`,
          time: record.record_date,
          icon: DollarSign,
          color: record.record_type === 'income' ? 'text-green-600' : 'text-red-600'
        });
      });
      
      // Sort by time and take latest 5
      setRecentActivity(activities.slice(0, 5));
      
    } catch (error) {
      console.error('Failed to fetch dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 60000);
    return () => clearInterval(interval);
  }, [user]);

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <Skeleton className="h-32 w-full bg-muted" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-32 bg-muted" />
          ))}
        </div>
      </div>
    );
  }

  const revenueExpenseData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Revenue',
        data: [12000, 15000, 13000, 17000, 16000, stats?.total_revenue || 19000],
        backgroundColor: 'hsl(var(--primary))',
      },
      {
        label: 'Expenses',
        data: [8000, 9000, 8500, 10000, 9500, stats?.total_expenses || 11000],
        backgroundColor: 'hsl(var(--secondary))',
      },
    ],
  };

  const cropPerformanceData = {
    labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
    datasets: [
      {
        label: 'Crop Growth Index',
        data: [65, 72, 78, stats?.active_crops ? 85 + stats.active_crops : 85],
        borderColor: 'hsl(var(--primary))',
        backgroundColor: 'hsla(var(--primary), 0.1)',
        tension: 0.4,
      },
    ],
  };

  const waterUsageData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
      {
        label: 'Water Usage (L)',
        data: [450, 520, 480, 510, 490, 530, 500],
        borderColor: 'hsl(var(--chart-3))',
        backgroundColor: 'hsla(var(--chart-3), 0.1)',
        fill: true,
        tension: 0.4,
      },
    ],
  };

  const netProfit = (stats?.total_revenue || 0) - (stats?.total_expenses || 0);
  const profitMargin = stats?.total_revenue ? Math.max(0, Math.round((netProfit / stats.total_revenue) * 100)) : 0;
  const lowStockItems = inventory.filter((item) => item.quantity <= item.reorder_threshold);

  const maintenanceDue = equipment.filter((item) => {
    if (!item.next_maintenance_date) return false;
    const dueDate = new Date(item.next_maintenance_date);
    const diffDays = (dueDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24);
    return diffDays <= 14;
  });

  const operationalReadiness = Math.max(
    35,
    Math.min(
      98,
      60 + (stats?.active_crops || 0) * 2 - lowStockItems.length * 6 - maintenanceDue.length * 4
    )
  );

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      <SeasonalHero
        pageKey="ruralDashboard"
        title="Rural Farming Dashboard"
        description="Monitor your farm operations in real-time"
      />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <GlassCard>
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Net Profit</p>
              <p className="text-3xl font-semibold">${netProfit.toFixed(0)}</p>
              <p className="mt-1 text-xs text-muted-foreground">Margin {profitMargin}% this season</p>
            </div>
            <div className="rounded-2xl bg-emerald-100 p-3 text-emerald-700">
              <BarChart3 className="h-6 w-6" />
            </div>
          </div>
        </GlassCard>

        <GlassCard>
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Farm Readiness</p>
              <p className="text-3xl font-semibold">{operationalReadiness}%</p>
              <Progress value={operationalReadiness} className="mt-3 h-2" />
            </div>
            <div className="rounded-2xl bg-sky-100 p-3 text-sky-700">
              <Target className="h-6 w-6" />
            </div>
          </div>
        </GlassCard>

        <GlassCard>
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Low Stock Alerts</p>
              <p className="text-3xl font-semibold">{lowStockItems.length}</p>
              <p className="mt-1 text-xs text-muted-foreground">Items below reorder threshold</p>
            </div>
            <div className="rounded-2xl bg-amber-100 p-3 text-amber-700">
              <Package className="h-6 w-6" />
            </div>
          </div>
        </GlassCard>

        <GlassCard>
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Pending Alerts</p>
              <p className="text-3xl font-semibold">{alertCount}</p>
              <p className="mt-1 text-xs text-muted-foreground">Unread notifications from the farm</p>
            </div>
            <div className="rounded-2xl bg-rose-100 p-3 text-rose-700">
              <ShieldAlert className="h-6 w-6" />
            </div>
          </div>
        </GlassCard>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <GlassCard>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Crop Area</p>
              <p className="text-2xl font-bold">{stats?.total_crop_area?.toFixed(1)} ha</p>
            </div>
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Sprout className="h-6 w-6 text-primary" />
            </div>
          </div>
        </GlassCard>

        <GlassCard>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Active Crops</p>
              <p className="text-2xl font-bold">{stats?.active_crops || 0}</p>
            </div>
            <div className="h-12 w-12 rounded-full bg-secondary/10 flex items-center justify-center">
              <TrendingUp className="h-6 w-6 text-secondary" />
            </div>
          </div>
        </GlassCard>

        <GlassCard>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Revenue</p>
              <p className="text-2xl font-bold">${stats?.total_revenue?.toFixed(0) || 0}</p>
            </div>
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
              <DollarSign className="h-6 w-6 text-primary" />
            </div>
          </div>
        </GlassCard>

        <GlassCard>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Expenses</p>
              <p className="text-2xl font-bold">${stats?.total_expenses?.toFixed(0) || 0}</p>
            </div>
            <div className="h-12 w-12 rounded-full bg-destructive/10 flex items-center justify-center">
              <Droplet className="h-6 w-6 text-destructive" />
            </div>
          </div>
        </GlassCard>
      </div>

      {/* Charts and Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <GlassCard title="Revenue vs Expenses" description="Monthly financial overview">
            <Bar data={revenueExpenseData} options={{ responsive: true, maintainAspectRatio: true }} />
          </GlassCard>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <GlassCard title="Crop Performance" description="Weekly growth tracking">
              <Line data={cropPerformanceData} options={{ responsive: true, maintainAspectRatio: true }} />
            </GlassCard>

            <GlassCard title="Water Usage" description="Daily consumption">
              <Line data={waterUsageData} options={{ responsive: true, maintainAspectRatio: true }} />
            </GlassCard>
          </div>

          <GlassCard title="Quick Actions" description="Common tasks">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <a href="/rural/crops" className="p-4 bg-accent rounded-lg hover:bg-accent/80 transition-smooth text-center">
                <Sprout className="h-8 w-8 mx-auto mb-2 text-primary" />
                <p className="text-sm font-medium">Add Crop</p>
              </a>
              <a href="/rural/financial" className="p-4 bg-accent rounded-lg hover:bg-accent/80 transition-smooth text-center">
                <DollarSign className="h-8 w-8 mx-auto mb-2 text-primary" />
                <p className="text-sm font-medium">Record Transaction</p>
              </a>
              <a href="/rural/diagnosis" className="p-4 bg-accent rounded-lg hover:bg-accent/80 transition-smooth text-center">
                <TrendingUp className="h-8 w-8 mx-auto mb-2 text-primary" />
                <p className="text-sm font-medium">Diagnose Plant</p>
              </a>
              <a href="/rural/orders" className="p-4 bg-accent rounded-lg hover:bg-accent/80 transition-smooth text-center">
                <Droplet className="h-8 w-8 mx-auto mb-2 text-primary" />
                <p className="text-sm font-medium">View Orders</p>
              </a>
            </div>
          </GlassCard>

          <GlassCard title="Farm Insights" description="Quick operational signals">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="rounded-2xl bg-slate-50 p-4">
                <div className="flex items-center gap-2 text-slate-700">
                  <Droplet className="h-4 w-4 text-sky-600" />
                  <span className="text-sm font-medium">Water Trend</span>
                </div>
                <p className="mt-2 text-2xl font-semibold">Stable</p>
                <p className="mt-1 text-xs text-muted-foreground">Usage is within safe range for the week.</p>
              </div>
              <div className="rounded-2xl bg-slate-50 p-4">
                <div className="flex items-center gap-2 text-slate-700">
                  <TimerReset className="h-4 w-4 text-emerald-600" />
                  <span className="text-sm font-medium">Maintenance</span>
                </div>
                <p className="mt-2 text-2xl font-semibold">{maintenanceDue.length}</p>
                <p className="mt-1 text-xs text-muted-foreground">Machines due within 14 days.</p>
              </div>
              <div className="rounded-2xl bg-slate-50 p-4">
                <div className="flex items-center gap-2 text-slate-700">
                  <Activity className="h-4 w-4 text-violet-600" />
                  <span className="text-sm font-medium">Activity</span>
                </div>
                <p className="mt-2 text-2xl font-semibold">{recentActivity.length}</p>
                <p className="mt-1 text-xs text-muted-foreground">Latest actions tracked automatically.</p>
              </div>
            </div>
          </GlassCard>
        </div>

        <div className="space-y-6">
          <GlassCard title="Smart Alerts" description="Recent notifications">
            {user && <AlertPanel userId={user.id} maxHeight="400px" />}
          </GlassCard>

          <GlassCard title="Inventory Watch" description="Items needing attention">
            <div className="space-y-3">
              {lowStockItems.length === 0 ? (
                <p className="py-4 text-center text-sm text-muted-foreground">All inventory items are above reorder levels.</p>
              ) : (
                lowStockItems.slice(0, 4).map((item) => (
                  <div key={item.id} className="flex items-center justify-between rounded-xl bg-amber-50 px-3 py-2">
                    <div>
                      <p className="text-sm font-medium">{item.item_name}</p>
                      <p className="text-xs text-muted-foreground">{item.category}</p>
                    </div>
                    <Badge variant="outline">{item.quantity}/{item.reorder_threshold}</Badge>
                  </div>
                ))
              )}
            </div>
          </GlassCard>

          <GlassCard title="Maintenance Queue" description="Upcoming equipment checks">
            <div className="space-y-3">
              {maintenanceDue.length === 0 ? (
                <p className="py-4 text-center text-sm text-muted-foreground">No equipment is due soon.</p>
              ) : (
                maintenanceDue.slice(0, 4).map((item) => (
                  <div key={item.id} className="flex items-center justify-between rounded-xl bg-sky-50 px-3 py-2">
                    <div>
                      <p className="text-sm font-medium">{item.name}</p>
                      <p className="text-xs text-muted-foreground">{item.equipment_type}</p>
                    </div>
                    <Badge variant="outline"><Wrench className="mr-1 h-3 w-3" /> Soon</Badge>
                  </div>
                ))
              )}
            </div>
          </GlassCard>

          {/* Weather Widget */}
          <GlassCard title="Weather" description="Current conditions">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-3xl font-bold">{weather.temp}°C</p>
                  <p className="text-sm text-muted-foreground">{weather.condition}</p>
                </div>
                <Sun className="h-12 w-12 text-yellow-500" />
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <Droplet className="h-4 w-4 text-blue-500" />
                  <span>Humidity: {weather.humidity}%</span>
                </div>
                <div className="flex items-center gap-2">
                  <Wind className="h-4 w-4 text-gray-500" />
                  <span>Wind: {weather.wind} km/h</span>
                </div>
              </div>
              <div className="border-t pt-3">
                <p className="text-xs text-muted-foreground mb-2">3-Day Forecast</p>
                <div className="grid grid-cols-3 gap-2">
                  {weather.forecast.map((day, idx) => (
                    <div key={idx} className="text-center p-2 bg-accent rounded">
                      {day.icon === 'sun' && <Sun className="h-5 w-5 mx-auto text-yellow-500" />}
                      {day.icon === 'cloud' && <Cloud className="h-5 w-5 mx-auto text-gray-500" />}
                      {day.icon === 'rain' && <CloudRain className="h-5 w-5 mx-auto text-blue-500" />}
                      <p className="text-xs mt-1">{day.day}</p>
                      <p className="text-sm font-semibold">{day.temp}°C</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </GlassCard>

          {/* Recent Activity */}
          <GlassCard title="Recent Activity" description="Latest updates">
            <div className="space-y-3">
              {recentActivity.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">No recent activity</p>
              ) : (
                recentActivity.map((activity, idx) => {
                  const Icon = activity.icon;
                  return (
                    <div key={idx} className="flex items-start gap-3 p-2 hover:bg-accent rounded transition-smooth">
                      <div className={`h-8 w-8 rounded-full bg-accent flex items-center justify-center ${activity.color}`}>
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium">{activity.action}</p>
                        <p className="text-xs text-muted-foreground truncate">{activity.description}</p>
                        <p className="text-xs text-muted-foreground">{activity.time}</p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </GlassCard>

          {/* Upcoming Tasks */}
          <GlassCard title="Upcoming Tasks" description="This week">
            <div className="space-y-2">
              <div className="flex items-center gap-2 p-2 bg-accent rounded">
                <Calendar className="h-4 w-4 text-primary" />
                <div className="flex-1">
                  <p className="text-sm font-medium">Harvest wheat field</p>
                  <p className="text-xs text-muted-foreground">Due in 2 days</p>
                </div>
                <Badge variant="outline">High</Badge>
              </div>
              <div className="flex items-center gap-2 p-2 bg-accent rounded">
                <Calendar className="h-4 w-4 text-primary" />
                <div className="flex-1">
                  <p className="text-sm font-medium">Livestock vaccination</p>
                  <p className="text-xs text-muted-foreground">Due in 4 days</p>
                </div>
                <Badge variant="outline">Medium</Badge>
              </div>
              <div className="flex items-center gap-2 p-2 bg-accent rounded">
                <Calendar className="h-4 w-4 text-primary" />
                <div className="flex-1">
                  <p className="text-sm font-medium">Equipment maintenance</p>
                  <p className="text-xs text-muted-foreground">Due in 6 days</p>
                </div>
                <Badge variant="outline">Low</Badge>
              </div>
            </div>
          </GlassCard>

          <GlassCard title="Risk Radar" description="Operational issues to watch">
            <div className="space-y-3">
              <div className="flex items-center justify-between rounded-xl border border-border px-3 py-2">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-amber-600" />
                  <span className="text-sm font-medium">Low stock items</span>
                </div>
                <span className="text-sm text-muted-foreground">{lowStockItems.length}</span>
              </div>
              <div className="flex items-center justify-between rounded-xl border border-border px-3 py-2">
                <div className="flex items-center gap-2">
                  <TimerReset className="h-4 w-4 text-sky-600" />
                  <span className="text-sm font-medium">Maintenance due</span>
                </div>
                <span className="text-sm text-muted-foreground">{maintenanceDue.length}</span>
              </div>
              <div className="flex items-center justify-between rounded-xl border border-border px-3 py-2">
                <div className="flex items-center gap-2">
                  <Activity className="h-4 w-4 text-emerald-600" />
                  <span className="text-sm font-medium">Farm readiness</span>
                </div>
                <span className="text-sm text-muted-foreground">{operationalReadiness}%</span>
              </div>
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}
