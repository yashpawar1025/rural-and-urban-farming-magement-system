import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { GlassCard } from '@/components/common/GlassCard';
import { SeasonalHero } from '@/components/common/SeasonalHero';
import { AlertPanel } from '@/components/common/AlertPanel';
import { Progress } from '@/components/ui/progress';
import { getDashboardStats, getIrrigationSchedules, getCropPlans, getUnreadAlertCount } from '@/db/api';
import type { DashboardStats, IrrigationSchedule, CropPlan } from '@/types/types';
import { Skeleton } from '@/components/ui/skeleton';
import { Sprout, Droplet, ShoppingBag, Bell, Waves, Sparkles, CalendarClock, ThermometerSun, Target, ArrowUpRight, ShieldCheck } from 'lucide-react';

export default function UrbanDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [schedules, setSchedules] = useState<IrrigationSchedule[]>([]);
  const [plans, setPlans] = useState<CropPlan[]>([]);
  const [alertCount, setAlertCount] = useState(0);

  const fetchData = async () => {
    if (!user) return;
    try {
      const [data, irrigationSchedules, cropPlans, unreadAlerts] = await Promise.all([
        getDashboardStats(user.id, 'urban'),
        getIrrigationSchedules(user.id),
        getCropPlans(user.id),
        getUnreadAlertCount(user.id),
      ]);

      setStats(data);
      setSchedules(irrigationSchedules);
      setPlans(cropPlans);
      setAlertCount(unreadAlerts);
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

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      <SeasonalHero
        pageKey="urbanDashboard"
        title="Urban Farming Dashboard"
        description="Manage your urban garden efficiently"
      />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <GlassCard>
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Irrigation Health</p>
              <p className="text-3xl font-semibold">{Math.min(100, 72 + (stats?.active_plants || 0))}%</p>
              <Progress value={Math.min(100, 72 + (stats?.active_plants || 0))} className="mt-3 h-2" />
            </div>
            <div className="rounded-2xl bg-sky-100 p-3 text-sky-700">
              <Waves className="h-6 w-6" />
            </div>
          </div>
        </GlassCard>

        <GlassCard>
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Planning Boards</p>
              <p className="text-3xl font-semibold">{plans.length}</p>
              <p className="mt-1 text-xs text-muted-foreground">Active crop planning entries</p>
            </div>
            <div className="rounded-2xl bg-emerald-100 p-3 text-emerald-700">
              <Sparkles className="h-6 w-6" />
            </div>
          </div>
        </GlassCard>

        <GlassCard>
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Irrigation Runs</p>
              <p className="text-3xl font-semibold">{schedules.length}</p>
              <p className="mt-1 text-xs text-muted-foreground">Scheduled watering plans</p>
            </div>
            <div className="rounded-2xl bg-violet-100 p-3 text-violet-700">
              <CalendarClock className="h-6 w-6" />
            </div>
          </div>
        </GlassCard>

        <GlassCard>
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Pending Alerts</p>
              <p className="text-3xl font-semibold">{alertCount}</p>
              <p className="mt-1 text-xs text-muted-foreground">Unread tasks and warnings</p>
            </div>
            <div className="rounded-2xl bg-rose-100 p-3 text-rose-700">
              <Bell className="h-6 w-6" />
            </div>
          </div>
        </GlassCard>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <GlassCard>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Active Plants</p>
              <p className="text-2xl font-bold">{stats?.active_plants || 0}</p>
            </div>
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Sprout className="h-6 w-6 text-primary" />
            </div>
          </div>
        </GlassCard>

        <GlassCard>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Water Used Today</p>
              <p className="text-2xl font-bold">{stats?.water_usage?.toFixed(1) || 0}L</p>
            </div>
            <div className="h-12 w-12 rounded-full bg-secondary/10 flex items-center justify-center">
              <Droplet className="h-6 w-6 text-secondary" />
            </div>
          </div>
        </GlassCard>

        <GlassCard>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Pending Orders</p>
              <p className="text-2xl font-bold">{stats?.pending_orders || 0}</p>
            </div>
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
              <ShoppingBag className="h-6 w-6 text-primary" />
            </div>
          </div>
        </GlassCard>

        <GlassCard>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Alerts</p>
              <p className="text-2xl font-bold">3</p>
            </div>
            <div className="h-12 w-12 rounded-full bg-destructive/10 flex items-center justify-center">
              <Bell className="h-6 w-6 text-destructive" />
            </div>
          </div>
        </GlassCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <GlassCard title="Crop Suggestions" description="AI-powered recommendations for your space">
            <div className="space-y-3">
              {['Lettuce', 'Spinach', 'Cherry Tomatoes', 'Herbs (Basil, Mint)'].map((crop, i) => (
                <div key={i} className="p-3 bg-accent rounded-lg flex items-center justify-between">
                  <div>
                    <p className="font-medium">{crop}</p>
                    <p className="text-sm text-muted-foreground">Easy to grow, high yield</p>
                  </div>
                  <Sprout className="h-5 w-5 text-primary" />
                </div>
              ))}
            </div>
          </GlassCard>

          <GlassCard title="Urban Growth Snapshot" description="What to focus on this week">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <div className="rounded-2xl bg-slate-50 p-4">
                <div className="flex items-center gap-2 text-slate-700">
                  <Droplet className="h-4 w-4 text-sky-600" />
                  <span className="text-sm font-medium">Water Balance</span>
                </div>
                <p className="mt-2 text-2xl font-semibold">Optimal</p>
                <p className="mt-1 text-xs text-muted-foreground">Current irrigation is aligned with plant count.</p>
              </div>
              <div className="rounded-2xl bg-slate-50 p-4">
                <div className="flex items-center gap-2 text-slate-700">
                  <ThermometerSun className="h-4 w-4 text-amber-600" />
                  <span className="text-sm font-medium">Climate</span>
                </div>
                <p className="mt-2 text-2xl font-semibold">Stable</p>
                <p className="mt-1 text-xs text-muted-foreground">Indoor/garden temperature is within range.</p>
              </div>
              <div className="rounded-2xl bg-slate-50 p-4">
                <div className="flex items-center gap-2 text-slate-700">
                  <Target className="h-4 w-4 text-emerald-600" />
                  <span className="text-sm font-medium">Focus</span>
                </div>
                <p className="mt-2 text-2xl font-semibold">{plans.length > 0 ? 'Plan' : 'Plant'}</p>
                <p className="mt-1 text-xs text-muted-foreground">Review upcoming crop plans and irrigation windows.</p>
              </div>
            </div>
          </GlassCard>
        </div>

        <div>
          <GlassCard title="Smart Alerts" description="Recent notifications">
            {user && <AlertPanel userId={user.id} maxHeight="400px" />}
          </GlassCard>

          <GlassCard title="Recommended Actions" description="Fast next steps">
            <div className="space-y-3">
              <div className="flex items-center justify-between rounded-xl bg-emerald-50 px-3 py-2">
                <div>
                  <p className="text-sm font-medium">Review irrigation schedule</p>
                  <p className="text-xs text-muted-foreground">Optimize watering by zone</p>
                </div>
                <ArrowUpRight className="h-4 w-4 text-emerald-700" />
              </div>
              <div className="flex items-center justify-between rounded-xl bg-sky-50 px-3 py-2">
                <div>
                  <p className="text-sm font-medium">Check crop plan</p>
                  <p className="text-xs text-muted-foreground">Align space with seasonal crops</p>
                </div>
                <ArrowUpRight className="h-4 w-4 text-sky-700" />
              </div>
              <div className="flex items-center justify-between rounded-xl bg-amber-50 px-3 py-2">
                <div>
                  <p className="text-sm font-medium">Audit alert queue</p>
                  <p className="text-xs text-muted-foreground">Stay ahead of plant stress signals</p>
                </div>
                <ArrowUpRight className="h-4 w-4 text-amber-700" />
              </div>
              <div className="flex items-center justify-between rounded-xl bg-violet-50 px-3 py-2">
                <div>
                  <p className="text-sm font-medium">Prepare next harvest</p>
                  <p className="text-xs text-muted-foreground">Estimate yield and delivery timing</p>
                </div>
                <ArrowUpRight className="h-4 w-4 text-violet-700" />
              </div>
            </div>
          </GlassCard>

          <GlassCard title="Planting Focus" description="Active crop plans">
            <div className="space-y-3">
              {plans.length === 0 ? (
                <p className="py-4 text-center text-sm text-muted-foreground">No crop plans saved yet.</p>
              ) : (
                plans.slice(0, 4).map((plan) => (
                  <div key={plan.id} className="rounded-xl border border-border bg-white px-3 py-2">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-sm font-medium">{plan.season}</p>
                        <p className="text-xs text-muted-foreground">{plan.location} • {plan.soil_type}</p>
                      </div>
                      <Badge variant="outline">{plan.available_space} sqm</Badge>
                    </div>
                  </div>
                ))
              )}
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}

