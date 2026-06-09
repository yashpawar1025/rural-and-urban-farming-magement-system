import { useCallback, useEffect, useMemo, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { GlassCard } from '@/components/common/GlassCard';
import { SeasonalHero } from '@/components/common/SeasonalHero';
import { useRealtime } from '@/hooks/useRealtime';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { getEquipment, createEquipment, updateEquipment, deleteEquipment } from '@/db/api';
import { isSupabaseConfigured } from '@/db/supabase';
import type { Equipment } from '@/types/types';
import { toast } from 'sonner';
import { Plus, Edit, Trash2, Wrench, Search, ArrowUpDown, LayoutGrid, List, AlertTriangle, Clock3, ShieldCheck, Activity, Download } from 'lucide-react';

type SortOption = 'latest' | 'oldest' | 'name-asc' | 'name-desc' | 'maintenance-nearest' | 'maintenance-farthest';
type MaintenanceFilter = 'all' | 'overdue' | 'due-soon' | 'scheduled' | 'unscheduled';

const conditionOptions = ['Excellent', 'Good', 'Fair', 'Needs Service', 'Out of Order'];

const getDaysUntil = (dateString: string | null) => {
  if (!dateString) return null;
  const target = new Date(dateString).getTime();
  if (Number.isNaN(target)) return null;
  return Math.ceil((target - Date.now()) / (1000 * 60 * 60 * 24));
};

const getMaintenanceStatus = (nextDate: string | null): Exclude<MaintenanceFilter, 'all'> => {
  const days = getDaysUntil(nextDate);
  if (days === null) return 'unscheduled';
  if (days < 0) return 'overdue';
  if (days <= 14) return 'due-soon';
  return 'scheduled';
};

const maintenanceBadgeClass: Record<Exclude<MaintenanceFilter, 'all'>, string> = {
  overdue: 'bg-red-100 text-red-800 border-red-200',
  'due-soon': 'bg-amber-100 text-amber-800 border-amber-200',
  scheduled: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  unscheduled: 'bg-slate-100 text-slate-800 border-slate-200',
};

export default function EquipmentManagement() {
  const { user } = useAuth();
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Equipment | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [maintenanceFilter, setMaintenanceFilter] = useState<MaintenanceFilter>('all');
  const [sortBy, setSortBy] = useState<SortOption>('latest');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [formData, setFormData] = useState({
    name: '',
    equipment_type: '',
    purchase_date: '',
    last_maintenance_date: '',
    next_maintenance_date: '',
    condition: '',
    notes: '',
  });

  const resetForm = () => {
    setFormData({
      name: '',
      equipment_type: '',
      purchase_date: '',
      last_maintenance_date: '',
      next_maintenance_date: '',
      condition: '',
      notes: '',
    });
  };

  const refreshEquipment = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const data = await getEquipment(user.id);
      setEquipment(data);
    } catch (error) {
      console.error('Failed to load equipment:', error);
      toast.error('Failed to load equipment');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    refreshEquipment();
  }, [refreshEquipment]);

  useRealtime({
    table: 'equipment',
    filter: user ? `owner_id=eq.${user.id}` : undefined,
    onInsert: (newItem) => {
      setEquipment((prev) => {
        if (prev.some((item) => item.id === newItem.id)) return prev;
        return [newItem, ...prev];
      });
    },
    onUpdate: (updatedItem) => {
      setEquipment((prev) => prev.map((item) => (item.id === updatedItem.id ? updatedItem : item)));
    },
    onDelete: (deletedItem) => {
      setEquipment((prev) => prev.filter((item) => item.id !== deletedItem.id));
    },
  });

  const equipmentTypes = useMemo(() => [...new Set(equipment.map((item) => item.equipment_type))], [equipment]);

  const upcomingMaintenance = useMemo(
    () => equipment.filter((item) => {
      const days = getDaysUntil(item.next_maintenance_date);
      return days !== null && days <= 14;
    }),
    [equipment]
  );

  const overdueMaintenance = useMemo(
    () => equipment.filter((item) => {
      const days = getDaysUntil(item.next_maintenance_date);
      return days !== null && days < 0;
    }),
    [equipment]
  );

  const filteredEquipment = useMemo(() => {
    let filtered = [...equipment];

    if (searchTerm.trim()) {
      const query = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (item) =>
          item.name.toLowerCase().includes(query) ||
          item.equipment_type.toLowerCase().includes(query) ||
          item.condition?.toLowerCase().includes(query) ||
          item.notes?.toLowerCase().includes(query)
      );
    }

    if (typeFilter !== 'all') {
      filtered = filtered.filter((item) => item.equipment_type === typeFilter);
    }

    if (maintenanceFilter !== 'all') {
      filtered = filtered.filter((item) => getMaintenanceStatus(item.next_maintenance_date) === maintenanceFilter);
    }

    if (sortBy === 'latest') {
      filtered.sort((a, b) => b.created_at.localeCompare(a.created_at));
    } else if (sortBy === 'oldest') {
      filtered.sort((a, b) => a.created_at.localeCompare(b.created_at));
    } else if (sortBy === 'name-asc') {
      filtered.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortBy === 'name-desc') {
      filtered.sort((a, b) => b.name.localeCompare(a.name));
    } else if (sortBy === 'maintenance-nearest') {
      filtered.sort((a, b) => {
        const left = getDaysUntil(a.next_maintenance_date);
        const right = getDaysUntil(b.next_maintenance_date);
        return (left ?? Number.MAX_SAFE_INTEGER) - (right ?? Number.MAX_SAFE_INTEGER);
      });
    } else if (sortBy === 'maintenance-farthest') {
      filtered.sort((a, b) => {
        const left = getDaysUntil(a.next_maintenance_date);
        const right = getDaysUntil(b.next_maintenance_date);
        return (right ?? Number.MIN_SAFE_INTEGER) - (left ?? Number.MIN_SAFE_INTEGER);
      });
    }

    return filtered;
  }, [equipment, searchTerm, typeFilter, maintenanceFilter, sortBy]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      if (editingItem) {
        await updateEquipment(editingItem.id, formData);
        toast.success('Equipment updated successfully');
      } else {
        await createEquipment({
          owner_id: user.id,
          ...formData,
        });
        toast.success('Equipment added successfully');
      }
      setOpen(false);
      setEditingItem(null);
      resetForm();
      refreshEquipment();
    } catch (error) {
      console.error('Equipment save failed:', error);
      toast.error('Operation failed');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteEquipment(id);
      toast.success('Equipment deleted');
      refreshEquipment();
    } catch (error) {
      console.error('Equipment delete failed:', error);
      toast.error('Delete failed');
    }
  };

  const clearFilters = () => {
    setSearchTerm('');
    setTypeFilter('all');
    setMaintenanceFilter('all');
    setSortBy('latest');
  };

  const handleExport = () => {
    if (filteredEquipment.length === 0) {
      toast.error('No equipment to export');
      return;
    }
    try {
      const csv = [
        ['Name', 'Type', 'Condition', 'Purchase Date', 'Last Maintenance', 'Next Maintenance', 'Notes'].join(','),
        ...filteredEquipment.map((item) =>
          [item.name, item.equipment_type, item.condition || '', item.purchase_date || '', item.last_maintenance_date || '', item.next_maintenance_date || '', item.notes || ''].map((v) => `"${v}"`).join(',')
        ),
      ].join('\n');
      
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `equipment-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      toast.success(`Exported ${filteredEquipment.length} equipment records to CSV`);
    } catch (error) {
      toast.error('Export failed');
    }
  };

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <Skeleton className="h-36 w-full rounded-3xl" />
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((item) => (
            <Skeleton key={item} className="h-24 rounded-2xl" />
          ))}
        </div>
        <Skeleton className="h-64 w-full rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      <SeasonalHero
        pageKey="equipment"
        title="Equipment Management"
        description="Track machinery health and maintenance readiness"
      />

      {!isSupabaseConfigured && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          Live backend is unavailable. Equipment management is running in demo mode.
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <GlassCard>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Equipment</p>
              <p className="text-2xl font-semibold">{equipment.length}</p>
            </div>
            <Activity className="h-5 w-5 text-sky-600" />
          </div>
        </GlassCard>
        <GlassCard>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Due In 14 Days</p>
              <p className="text-2xl font-semibold text-amber-600">{upcomingMaintenance.length}</p>
            </div>
            <Clock3 className="h-5 w-5 text-amber-600" />
          </div>
        </GlassCard>
        <GlassCard>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Overdue</p>
              <p className="text-2xl font-semibold text-red-600">{overdueMaintenance.length}</p>
            </div>
            <AlertTriangle className="h-5 w-5 text-red-600" />
          </div>
        </GlassCard>
        <GlassCard>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Equipment Types</p>
              <p className="text-2xl font-semibold text-emerald-600">{equipmentTypes.length}</p>
            </div>
            <ShieldCheck className="h-5 w-5 text-emerald-600" />
          </div>
        </GlassCard>
      </div>

      {upcomingMaintenance.length > 0 && (
        <GlassCard className="border-l-4 border-l-destructive">
          <div className="flex items-start gap-3">
            <Wrench className="h-5 w-5 text-destructive mt-0.5" />
            <div>
              <h3 className="font-semibold mb-2">Upcoming Maintenance</h3>
              <div className="space-y-1">
                {upcomingMaintenance.map((item) => {
                  const daysUntil = getDaysUntil(item.next_maintenance_date);
                  return (
                  <p key={item.id} className="text-sm">
                    {item.name} - Due: {item.next_maintenance_date}
                    {daysUntil !== null ? ` (${daysUntil} days)` : ''}
                  </p>
                  );
                })}
              </div>
            </div>
          </div>
        </GlassCard>
      )}

      <GlassCard>
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-[220px]">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search name, type, condition, or notes..."
                className="pl-10"
              />
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {equipmentTypes.map((type) => (
                  <SelectItem key={type} value={type}>{type}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={maintenanceFilter} onValueChange={(value) => setMaintenanceFilter(value as MaintenanceFilter)}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Maintenance" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="overdue">Overdue</SelectItem>
                <SelectItem value="due-soon">Due Soon</SelectItem>
                <SelectItem value="scheduled">Scheduled</SelectItem>
                <SelectItem value="unscheduled">Unscheduled</SelectItem>
              </SelectContent>
            </Select>
            <Select value={sortBy} onValueChange={(value) => setSortBy(value as SortOption)}>
              <SelectTrigger className="w-[200px]">
                <ArrowUpDown className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Sort equipment" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="latest">Latest Added</SelectItem>
                <SelectItem value="oldest">Oldest Added</SelectItem>
                <SelectItem value="name-asc">Name A-Z</SelectItem>
                <SelectItem value="name-desc">Name Z-A</SelectItem>
                <SelectItem value="maintenance-nearest">Maintenance Nearest</SelectItem>
                <SelectItem value="maintenance-farthest">Maintenance Farthest</SelectItem>
              </SelectContent>
            </Select>
            <div className="flex items-center gap-2">
              <Button variant={viewMode === 'grid' ? 'default' : 'outline'} size="icon" onClick={() => setViewMode('grid')}>
                <LayoutGrid className="h-4 w-4" />
              </Button>
              <Button variant={viewMode === 'list' ? 'default' : 'outline'} size="icon" onClick={() => setViewMode('list')}>
                <List className="h-4 w-4" />
              </Button>
            </div>
            <Button variant="outline" onClick={clearFilters}>Reset</Button>
            <Button variant="outline" onClick={handleExport}>
              <Download className="mr-2 h-4 w-4" /> Export CSV
            </Button>
          </div>

          <div className="flex items-center justify-between gap-3">
            <h2 className="text-2xl font-semibold">Equipment List</h2>
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => { setEditingItem(null); resetForm(); }}>
                  <Plus className="mr-2 h-4 w-4" /> Add Equipment
                </Button>
              </DialogTrigger>
              <DialogContent className="max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>{editingItem ? 'Edit Equipment' : 'Add New Equipment'}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label>Equipment Name</Label>
                    <Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required placeholder="e.g., Main Field Tractor" />
                  </div>
                  <div>
                    <Label>Type</Label>
                    <Input value={formData.equipment_type} onChange={(e) => setFormData({ ...formData, equipment_type: e.target.value })} required placeholder="Tractor, Harvester, Sprayer" />
                  </div>
                  <div>
                    <Label>Condition</Label>
                    <Select value={formData.condition || ''} onValueChange={(value) => setFormData({ ...formData, condition: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select condition" />
                      </SelectTrigger>
                      <SelectContent>
                        {conditionOptions.map((condition) => (
                          <SelectItem key={condition} value={condition}>{condition}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div>
                      <Label>Purchase Date</Label>
                      <Input type="date" value={formData.purchase_date} onChange={(e) => setFormData({ ...formData, purchase_date: e.target.value })} />
                    </div>
                    <div>
                      <Label>Last Maintenance Date</Label>
                      <Input type="date" value={formData.last_maintenance_date} onChange={(e) => setFormData({ ...formData, last_maintenance_date: e.target.value })} />
                    </div>
                  </div>
                  <div>
                    <Label>Next Maintenance Date</Label>
                    <Input type="date" value={formData.next_maintenance_date} onChange={(e) => setFormData({ ...formData, next_maintenance_date: e.target.value })} />
                  </div>
                  <div>
                    <Label>Notes</Label>
                    <Textarea
                      rows={3}
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      placeholder="Service history, part replacements, operator notes..."
                    />
                  </div>
                  <Button type="submit" className="w-full">{editingItem ? 'Update' : 'Add'} Equipment</Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </GlassCard>

      <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
        {filteredEquipment.map((item) => {
          const maintenanceStatus = getMaintenanceStatus(item.next_maintenance_date);
          const daysUntil = getDaysUntil(item.next_maintenance_date);

          return (
            <GlassCard key={item.id}>
              <div className={viewMode === 'grid' ? 'space-y-3' : 'flex flex-col gap-4 md:flex-row md:items-start md:justify-between'}>
                <div className="flex-1 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="text-lg font-semibold">{item.name}</h3>
                      <div className="mt-1 flex flex-wrap gap-2">
                        <Badge variant="outline">{item.equipment_type}</Badge>
                        <Badge variant="outline" className={maintenanceBadgeClass[maintenanceStatus]}>{maintenanceStatus.replace('-', ' ')}</Badge>
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 gap-2 text-sm sm:grid-cols-2">
                    {item.purchase_date && <p><span className="text-muted-foreground">Purchased:</span> {item.purchase_date}</p>}
                    {item.last_maintenance_date && <p><span className="text-muted-foreground">Last Maintenance:</span> {item.last_maintenance_date}</p>}
                  </div>
                  <div className="rounded-xl border border-border bg-slate-50 px-3 py-2">
                    <p className="text-xs text-muted-foreground">Maintenance Window</p>
                    {item.next_maintenance_date ? (
                      <p className={daysUntil !== null && daysUntil <= 7 ? 'text-sm font-semibold text-destructive' : 'text-sm font-medium'}>
                        Next: {item.next_maintenance_date}
                        {daysUntil !== null ? ` (${daysUntil} days)` : ''}
                      </p>
                    ) : (
                      <p className="text-sm font-medium text-muted-foreground">No next maintenance date scheduled</p>
                    )}
                  </div>
                  {item.condition && (
                    <p className="text-sm"><span className="text-muted-foreground">Condition:</span> {item.condition}</p>
                  )}
                  {item.notes && (
                    <p className="rounded-xl bg-accent/70 p-3 text-xs leading-relaxed">{item.notes}</p>
                  )}
                </div>
                <div className="flex gap-2 pt-1 md:flex-col">
                  <Button size="sm" variant="outline" onClick={() => { setEditingItem(item); setFormData({ name: item.name, equipment_type: item.equipment_type, purchase_date: item.purchase_date || '', last_maintenance_date: item.last_maintenance_date || '', next_maintenance_date: item.next_maintenance_date || '', condition: item.condition || '', notes: item.notes || '' }); setOpen(true); }}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="destructive" onClick={() => handleDelete(item.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </GlassCard>
          );
        })}
      </div>

      {filteredEquipment.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <p>No equipment found. Add your first item or clear filters to see all records.</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <GlassCard title="Total Equipment" description="All items">
          <p className="text-3xl font-bold text-primary">{equipment.length}</p>
        </GlassCard>
        <GlassCard title="Upcoming Maintenance" description="Next 14 days">
          <p className="text-3xl font-bold text-amber-600">{upcomingMaintenance.length}</p>
        </GlassCard>
        <GlassCard title="Overdue Items" description="Need action">
          <p className="text-3xl font-bold text-red-600">{overdueMaintenance.length}</p>
        </GlassCard>
      </div>
    </div>
  );
}