import { useCallback, useEffect, useMemo, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { GlassCard } from '@/components/common/GlassCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { getFarmLogs, createFarmLog, updateFarmLog, deleteFarmLog } from '@/db/api';
import { isSupabaseConfigured } from '@/db/supabase';
import { useRealtime } from '@/hooks/useRealtime';
import { exportToCSV } from '@/lib/csvExport';
import type { FarmLog } from '@/types/types';
import { toast } from 'sonner';
import { Plus, Edit, Trash2, Download, Filter, Search, Sparkles, CalendarDays, ArrowUpDown, Activity, CircleDollarSign, BarChart3, RefreshCcw } from 'lucide-react';

export default function FarmRecords() {
  const { user } = useAuth();
  const [logs, setLogs] = useState<FarmLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editingLog, setEditingLog] = useState<FarmLog | null>(null);
  const [activityFilter, setActivityFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'latest' | 'oldest' | 'cost-high' | 'cost-low'>('latest');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [formData, setFormData] = useState({
    log_date: new Date().toISOString().split('T')[0],
    activity_type: '',
    description: '',
    cost: '',
  });

  const refreshLogs = useCallback(async () => {
    if (!user) return;

    setLoading(true);
    try {
      const data = await getFarmLogs(user.id);
      setLogs(data);
    } catch (error) {
      console.error('Failed to fetch logs:', error);
      toast.error('Failed to load farm records');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    refreshLogs();
  }, [refreshLogs]);

  useRealtime({
    table: 'farm_logs',
    event: '*',
    filter: `owner_id=eq.${user?.id || '00000000-0000-0000-0000-000000000000'}`,
    onInsert: useCallback((newLog: FarmLog) => {
      setLogs((prev) => {
        if (prev.some((item) => item.id === newLog.id)) {
          return prev;
        }
        return [newLog, ...prev];
      });
    }, []),
    onUpdate: useCallback((updatedLog: FarmLog) => {
      setLogs((prev) => prev.map((item) => (item.id === updatedLog.id ? updatedLog : item)));
    }, []),
    onDelete: useCallback((deletedLog: FarmLog) => {
      setLogs((prev) => prev.filter((item) => item.id !== deletedLog.id));
    }, []),
  });

  const filteredLogs = useMemo(() => {
    let list = [...logs];

    if (activityFilter !== 'all') {
      list = list.filter((log) => log.activity_type === activityFilter);
    }

    if (searchTerm.trim()) {
      const query = searchTerm.toLowerCase();
      list = list.filter((log) =>
        log.description.toLowerCase().includes(query) ||
        log.activity_type.toLowerCase().includes(query)
      );
    }

    if (startDate) {
      list = list.filter((log) => log.log_date >= startDate);
    }

    if (endDate) {
      list = list.filter((log) => log.log_date <= endDate);
    }

    if (sortBy === 'latest') {
      list.sort((a, b) => b.log_date.localeCompare(a.log_date));
    } else if (sortBy === 'oldest') {
      list.sort((a, b) => a.log_date.localeCompare(b.log_date));
    } else if (sortBy === 'cost-high') {
      list.sort((a, b) => Number(b.cost) - Number(a.cost));
    } else {
      list.sort((a, b) => Number(a.cost) - Number(b.cost));
    }

    return list;
  }, [logs, activityFilter, searchTerm, startDate, endDate, sortBy]);

  const totalCost = useMemo(() => logs.reduce((sum, log) => sum + Number(log.cost), 0), [logs]);
  const filteredCost = useMemo(() => filteredLogs.reduce((sum, log) => sum + Number(log.cost), 0), [filteredLogs]);
  const avgCost = useMemo(() => (filteredLogs.length ? filteredCost / filteredLogs.length : 0), [filteredLogs.length, filteredCost]);

  const thisMonthCount = useMemo(() => {
    const now = new Date();
    const month = now.getMonth();
    const year = now.getFullYear();
    return logs.filter((log) => {
      const date = new Date(log.log_date);
      return date.getMonth() === month && date.getFullYear() === year;
    }).length;
  }, [logs]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (!formData.activity_type) {
      toast.error('Please select an activity type');
      return;
    }

    try {
      if (editingLog) {
        await updateFarmLog(editingLog.id, {
          ...formData,
          cost: Number(formData.cost),
        });
        toast.success('Log updated successfully');
      } else {
        await createFarmLog({
          owner_id: user.id,
          ...formData,
          cost: Number(formData.cost),
        });
        toast.success('Log added successfully');
      }
      setOpen(false);
      setEditingLog(null);
      setFormData({ log_date: new Date().toISOString().split('T')[0], activity_type: '', description: '', cost: '' });
      refreshLogs();
    } catch (error) {
      console.error('Failed to save log:', error);
      toast.error('Operation failed');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteFarmLog(id);
      toast.success('Log deleted');
      refreshLogs();
    } catch (error) {
      console.error('Failed to delete log:', error);
      toast.error('Delete failed');
    }
  };

  const exportToCSV = () => {
    if (!filteredLogs.length) {
      toast.error('No logs available for export');
      return;
    }

    try {
      exportToCSV(
        filteredLogs.map((log) => ({
          date: log.log_date,
          activity_type: log.activity_type,
          description: log.description,
          cost: Number(log.cost).toFixed(2),
        })),
        'farm_logs_export',
        ['date', 'activity_type', 'description', 'cost']
      );
      toast.success('CSV exported successfully');
    } catch (error) {
      console.error('Export failed:', error);
      toast.error('CSV export failed');
    }
  };

  const clearFilters = () => {
    setActivityFilter('all');
    setSearchTerm('');
    setSortBy('latest');
    setStartDate('');
    setEndDate('');
  };

  const activityTypes = ['Planting', 'Harvesting', 'Irrigation', 'Fertilizing', 'Pest Control', 'Maintenance', 'Other'];
  const uniqueActivityTypes = Array.from(new Set(logs.map(log => log.activity_type)));

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <Skeleton className="h-44 w-full rounded-3xl" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((item) => (
            <Skeleton key={item} className="h-28 rounded-2xl" />
          ))}
        </div>
        <Skeleton className="h-80 w-full rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-700 via-emerald-600 to-lime-500 p-8 text-white shadow-xl shadow-emerald-700/20">
        <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
        <div className="absolute -bottom-12 left-1/3 h-40 w-40 rounded-full bg-lime-200/20 blur-2xl" />
        <div className="relative z-10 grid gap-4 md:grid-cols-[1fr_auto] md:items-end">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs uppercase tracking-[0.16em]">
              <Sparkles className="h-3.5 w-3.5" />
              Operations Ledger
            </div>
            <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">Farm Records</h1>
            <p className="mt-2 max-w-2xl text-sm text-white/90 md:text-base">Track daily farm activities, monitor expenses, and get real-time updates when logs change.</p>
          </div>
          <div className="grid grid-cols-3 gap-3 text-center text-sm">
            <div className="rounded-2xl bg-white/15 px-4 py-3 backdrop-blur-md">
              <p className="text-xl font-semibold">{logs.length}</p>
              <p className="text-xs text-white/80">Total Logs</p>
            </div>
            <div className="rounded-2xl bg-white/15 px-4 py-3 backdrop-blur-md">
              <p className="text-xl font-semibold">${totalCost.toFixed(0)}</p>
              <p className="text-xs text-white/80">Total Cost</p>
            </div>
            <div className="rounded-2xl bg-white/15 px-4 py-3 backdrop-blur-md">
              <p className="text-xl font-semibold">{thisMonthCount}</p>
              <p className="text-xs text-white/80">This Month</p>
            </div>
          </div>
        </div>
      </div>

      {!isSupabaseConfigured && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          Live backend is unavailable, but you can still manage records in demo mode.
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <GlassCard>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Filtered Logs</p>
              <p className="text-2xl font-semibold">{filteredLogs.length}</p>
            </div>
            <Activity className="h-5 w-5 text-emerald-600" />
          </div>
        </GlassCard>
        <GlassCard>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Filtered Cost</p>
              <p className="text-2xl font-semibold">${filteredCost.toFixed(2)}</p>
            </div>
            <CircleDollarSign className="h-5 w-5 text-sky-600" />
          </div>
        </GlassCard>
        <GlassCard>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Avg Cost / Entry</p>
              <p className="text-2xl font-semibold">${avgCost.toFixed(2)}</p>
            </div>
            <BarChart3 className="h-5 w-5 text-violet-600" />
          </div>
        </GlassCard>
        <GlassCard>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Realtime Status</p>
              <p className="text-lg font-semibold">{isSupabaseConfigured ? 'Live Sync' : 'Demo Mode'}</p>
            </div>
            <RefreshCcw className="h-5 w-5 text-amber-600" />
          </div>
        </GlassCard>
      </div>

      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3 w-full">
          <div className="relative lg:col-span-2">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              className="pl-9"
              placeholder="Search description or activity"
            />
          </div>

          <Select value={activityFilter} onValueChange={setActivityFilter}>
            <SelectTrigger>
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Filter by activity" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Activities</SelectItem>
              {uniqueActivityTypes.map((type) => (
                <SelectItem key={type} value={type}>{type}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={sortBy} onValueChange={(value) => setSortBy(value as typeof sortBy)}>
            <SelectTrigger>
              <ArrowUpDown className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Sort logs" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="latest">Latest first</SelectItem>
              <SelectItem value="oldest">Oldest first</SelectItem>
              <SelectItem value="cost-high">Highest cost</SelectItem>
              <SelectItem value="cost-low">Lowest cost</SelectItem>
            </SelectContent>
          </Select>

          <div className="flex items-center gap-2">
            <Input type="date" value={startDate} onChange={(event) => setStartDate(event.target.value)} />
            <Input type="date" value={endDate} onChange={(event) => setEndDate(event.target.value)} />
          </div>

          <div className="flex items-center gap-2 lg:justify-end">
            <Button variant="outline" onClick={clearFilters}>Reset</Button>
            <Button variant="outline" onClick={exportToCSV}>
              <Download className="mr-2 h-4 w-4" /> Export CSV
            </Button>
          </div>
        </div>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => { setEditingLog(null); setFormData({ log_date: new Date().toISOString().split('T')[0], activity_type: '', description: '', cost: '' }); }} className="shrink-0">
              <Plus className="mr-2 h-4 w-4" /> Add Log Entry
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingLog ? 'Edit Log Entry' : 'Add New Log Entry'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label>Date</Label>
                <Input type="date" value={formData.log_date} onChange={(e) => setFormData({ ...formData, log_date: e.target.value })} required />
              </div>
              <div>
                <Label>Activity Type</Label>
                <Select value={formData.activity_type} onValueChange={(value) => setFormData({ ...formData, activity_type: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select activity type" />
                  </SelectTrigger>
                  <SelectContent>
                    {activityTypes.map((type) => (
                      <SelectItem key={type} value={type}>{type}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Description</Label>
                <Textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} required rows={3} />
              </div>
              <div>
                <Label>Cost ($)</Label>
                <Input type="number" min="0" step="0.01" value={formData.cost} onChange={(e) => setFormData({ ...formData, cost: e.target.value })} required />
              </div>
              <Button type="submit" className="w-full">{editingLog ? 'Update' : 'Add'} Log Entry</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <GlassCard title={`Farm Activity Logs (${filteredLogs.length})`} description="Daily farm operations and expenses">
        <div className="space-y-3">
          {filteredLogs.map((log) => (
            <div key={log.id} className="rounded-xl border border-border bg-white p-4 shadow-sm transition-all duration-200 hover:shadow-md">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <Badge variant="outline">{log.activity_type}</Badge>
                    <span className="flex items-center gap-1 text-sm text-muted-foreground">
                      <CalendarDays className="h-3.5 w-3.5" />
                      {log.log_date}
                    </span>
                  </div>
                  <p className="text-sm mb-2">{log.description}</p>
                  <p className="text-sm font-semibold text-primary">Cost: ${Number(log.cost).toFixed(2)}</p>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => { setEditingLog(log); setFormData({ log_date: log.log_date, activity_type: log.activity_type, description: log.description, cost: log.cost.toString() }); setOpen(true); }}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="destructive" onClick={() => handleDelete(log.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredLogs.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <p>No farm logs yet. Add your first entry to start tracking!</p>
          </div>
        )}
      </GlassCard>
    </div>
  );
}
