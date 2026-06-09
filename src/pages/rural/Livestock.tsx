import { useCallback, useEffect, useMemo, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { GlassCard } from '@/components/common/GlassCard';
import { SeasonalHero } from '@/components/common/SeasonalHero';
import { ImageUpload } from '@/components/common/ImageUpload';
import { useRealtime } from '@/hooks/useRealtime';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { getLivestock, createLivestock, updateLivestock, deleteLivestock } from '@/db/api';
import { isSupabaseConfigured } from '@/db/supabase';
import type { Livestock } from '@/types/types';
import { toast } from 'sonner';
import { Plus, Edit, Trash2, AlertCircle, Search, ArrowUpDown, LayoutGrid, List, HeartPulse, ShieldAlert, CalendarDays, Scale, Sparkles, Download } from 'lucide-react';

type SortOption = 'latest' | 'oldest' | 'type-asc' | 'type-desc' | 'count-high' | 'count-low' | 'weight-high' | 'weight-low';

const getDaysUntil = (dateString: string | null) => {
  if (!dateString) return null;
  const target = new Date(dateString).getTime();
  if (Number.isNaN(target)) return null;
  return Math.ceil((target - Date.now()) / (1000 * 60 * 60 * 24));
};

const getHealthTone = (daysUntilVaccination: number | null, daysSinceVet: number | null) => {
  if (daysUntilVaccination !== null && daysUntilVaccination <= 7) {
    return 'text-destructive border-destructive/30 bg-destructive/5';
  }
  if (daysSinceVet !== null && daysSinceVet >= 180) {
    return 'text-amber-700 border-amber-200 bg-amber-50';
  }
  return 'text-emerald-700 border-emerald-200 bg-emerald-50';
};

export default function LivestockManagement() {
  const { user } = useAuth();
  const [livestock, setLivestock] = useState<Livestock[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Livestock | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [animalFilter, setAnimalFilter] = useState('all');
  const [sortBy, setSortBy] = useState<SortOption>('latest');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [formData, setFormData] = useState({
    animal_type: '',
    breed: '',
    count: '',
    date_acquired: '',
    weight: '',
    condition_notes: '',
    last_vet_visit: '',
    next_vaccination_date: '',
    image_url: '',
  });

  const resetForm = () => setFormData({
    animal_type: '',
    breed: '',
    count: '',
    date_acquired: '',
    weight: '',
    condition_notes: '',
    last_vet_visit: '',
    next_vaccination_date: '',
    image_url: '',
  });

  const refreshLivestock = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const data = await getLivestock(user.id);
      setLivestock(data);
    } catch (error) {
      console.error('Failed to load livestock:', error);
      toast.error('Failed to load livestock');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    refreshLivestock();
  }, [refreshLivestock]);

  useRealtime({
    table: 'livestock',
    filter: user ? `owner_id=eq.${user.id}` : undefined,
    onInsert: (newItem) => {
      setLivestock((prev) => {
        if (prev.some((item) => item.id === newItem.id)) return prev;
        return [newItem, ...prev];
      });
    },
    onUpdate: (updatedItem) => {
      setLivestock((prev) => prev.map((item) => (item.id === updatedItem.id ? updatedItem : item)));
    },
    onDelete: (deletedItem) => {
      setLivestock((prev) => prev.filter((item) => item.id !== deletedItem.id));
    },
  });

  const upcomingVaccinations = useMemo(
    () => livestock.filter((item) => {
      const daysUntil = getDaysUntil(item.next_vaccination_date);
      return daysUntil !== null && daysUntil <= 30;
    }),
    [livestock]
  );

  const filteredLivestock = useMemo(() => {
    let filtered = [...livestock];

    if (searchTerm.trim()) {
      const query = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (item) =>
          item.animal_type.toLowerCase().includes(query) ||
          item.breed?.toLowerCase().includes(query) ||
          item.condition_notes?.toLowerCase().includes(query)
      );
    }

    if (animalFilter !== 'all') {
      filtered = filtered.filter((item) => item.animal_type === animalFilter);
    }

    if (sortBy === 'latest') {
      filtered.sort((a, b) => b.created_at.localeCompare(a.created_at));
    } else if (sortBy === 'oldest') {
      filtered.sort((a, b) => a.created_at.localeCompare(b.created_at));
    } else if (sortBy === 'type-asc') {
      filtered.sort((a, b) => a.animal_type.localeCompare(b.animal_type));
    } else if (sortBy === 'type-desc') {
      filtered.sort((a, b) => b.animal_type.localeCompare(a.animal_type));
    } else if (sortBy === 'count-high') {
      filtered.sort((a, b) => b.count - a.count);
    } else if (sortBy === 'count-low') {
      filtered.sort((a, b) => a.count - b.count);
    } else if (sortBy === 'weight-high') {
      filtered.sort((a, b) => Number(b.weight || 0) - Number(a.weight || 0));
    } else if (sortBy === 'weight-low') {
      filtered.sort((a, b) => Number(a.weight || 0) - Number(b.weight || 0));
    }

    return filtered;
  }, [livestock, searchTerm, animalFilter, sortBy]);

  const animalTypes = useMemo(() => [...new Set(livestock.map((item) => item.animal_type))], [livestock]);

  const totalAnimals = useMemo(() => livestock.reduce((sum, item) => sum + item.count, 0), [livestock]);
  const totalGroups = useMemo(() => livestock.length, [livestock]);
  const totalAverageWeight = useMemo(() => {
    const weighted = livestock.filter((item) => item.weight !== null);
    if (!weighted.length) return 0;
    return weighted.reduce((sum, item) => sum + Number(item.weight || 0), 0) / weighted.length;
  }, [livestock]);
  const dueVaccinations = useMemo(() => upcomingVaccinations.length, [upcomingVaccinations]);

  const clearFilters = () => {
    setSearchTerm('');
    setAnimalFilter('all');
    setSortBy('latest');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      if (editingItem) {
        await updateLivestock(editingItem.id, {
          ...formData,
          count: Number(formData.count),
          weight: formData.weight ? Number(formData.weight) : null,
        });
        toast.success('Livestock updated successfully');
      } else {
        await createLivestock({
          owner_id: user.id,
          ...formData,
          count: Number(formData.count),
          weight: formData.weight ? Number(formData.weight) : null,
        });
        toast.success('Livestock added successfully');
      }
      setOpen(false);
      setEditingItem(null);
      resetForm();
      refreshLivestock();
    } catch (error) {
      console.error('Livestock save failed:', error);
      toast.error('Operation failed');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteLivestock(id);
      toast.success('Livestock deleted');
      refreshLivestock();
    } catch (error) {
      console.error('Livestock delete failed:', error);
      toast.error('Delete failed');
    }
  };

  const handleExport = () => {
    if (filteredLivestock.length === 0) {
      toast.error('No livestock to export');
      return;
    }
    try {
      const csv = [
        ['Animal Type', 'Breed', 'Count', 'Weight (kg)', 'Date Acquired', 'Last Vet Visit', 'Next Vaccination', 'Condition'].join(','),
        ...filteredLivestock.map((item) =>
          [item.animal_type, item.breed || '', item.count, item.weight || '', item.date_acquired || '', item.last_vet_visit || '', item.next_vaccination_date || '', item.condition_notes || ''].map((v) => `"${v}"`).join(',')
        ),
      ].join('\n');
      
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `livestock-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      toast.success(`Exported ${filteredLivestock.length} livestock records to CSV`);
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
        pageKey="livestock"
        title="Livestock Management"
        description="Track animal health and vaccination schedules"
      />

      {!isSupabaseConfigured && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          Live backend is unavailable. Livestock management is still usable in demo mode.
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <GlassCard>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Animals</p>
              <p className="text-2xl font-semibold">{totalAnimals}</p>
            </div>
            <HeartPulse className="h-5 w-5 text-emerald-600" />
          </div>
        </GlassCard>
        <GlassCard>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Animal Groups</p>
              <p className="text-2xl font-semibold">{totalGroups}</p>
            </div>
            <Sparkles className="h-5 w-5 text-sky-600" />
          </div>
        </GlassCard>
        <GlassCard>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Avg. Weight</p>
              <p className="text-2xl font-semibold">{totalAverageWeight ? totalAverageWeight.toFixed(1) : '0.0'} kg</p>
            </div>
            <Scale className="h-5 w-5 text-violet-600" />
          </div>
        </GlassCard>
        <GlassCard>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Vaccinations Due</p>
              <p className="text-2xl font-semibold">{dueVaccinations}</p>
            </div>
            <ShieldAlert className="h-5 w-5 text-amber-600" />
          </div>
        </GlassCard>
      </div>

      {upcomingVaccinations.length > 0 && (
        <GlassCard className="border-l-4 border-l-destructive">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-destructive mt-0.5" />
            <div>
              <h3 className="font-semibold mb-2">Upcoming Vaccinations</h3>
              <div className="space-y-1">
                {upcomingVaccinations.map((item) => {
                  const daysUntil = getDaysUntil(item.next_vaccination_date);
                  return (
                    <p key={item.id} className="text-sm">
                      {item.animal_type} ({item.breed || 'No breed listed'}) - Due: {item.next_vaccination_date}
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
            <div className="flex-1 min-w-[220px] relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search animals, breeds, or notes..."
                className="pl-10"
              />
            </div>
            <Select value={animalFilter} onValueChange={setAnimalFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {animalTypes.map((type) => (
                  <SelectItem key={type} value={type}>{type}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={sortBy} onValueChange={(value) => setSortBy(value as SortOption)}>
              <SelectTrigger className="w-[180px]">
                <ArrowUpDown className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Sort livestock" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="latest">Latest Added</SelectItem>
                <SelectItem value="oldest">Oldest Added</SelectItem>
                <SelectItem value="type-asc">Type A-Z</SelectItem>
                <SelectItem value="type-desc">Type Z-A</SelectItem>
                <SelectItem value="count-high">Count High-Low</SelectItem>
                <SelectItem value="count-low">Count Low-High</SelectItem>
                <SelectItem value="weight-high">Weight High-Low</SelectItem>
                <SelectItem value="weight-low">Weight Low-High</SelectItem>
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
            <h2 className="text-2xl font-semibold">Livestock Inventory</h2>
            <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => { setEditingItem(null); resetForm(); }}>
              <Plus className="mr-2 h-4 w-4" /> Add Livestock
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingItem ? 'Edit Livestock' : 'Add New Livestock'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label>Livestock Image</Label>
                <ImageUpload
                  currentImageUrl={formData.image_url}
                  onUploadComplete={(url) => setFormData({ ...formData, image_url: url })}
                  folder="livestock"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Animal Type</Label>
                  <Input value={formData.animal_type} onChange={(e) => setFormData({ ...formData, animal_type: e.target.value })} required placeholder="e.g., Cattle, Poultry" />
                </div>
                <div>
                  <Label>Breed</Label>
                  <Input value={formData.breed} onChange={(e) => setFormData({ ...formData, breed: e.target.value })} placeholder="e.g., Holstein" />
                </div>
                <div>
                  <Label>Count</Label>
                  <Input type="number" value={formData.count} onChange={(e) => setFormData({ ...formData, count: e.target.value })} required />
                </div>
                <div>
                  <Label>Date Acquired</Label>
                  <Input type="date" value={formData.date_acquired} onChange={(e) => setFormData({ ...formData, date_acquired: e.target.value })} />
                </div>
                <div>
                  <Label>Weight (kg)</Label>
                  <Input type="number" step="0.1" value={formData.weight} onChange={(e) => setFormData({ ...formData, weight: e.target.value })} />
                </div>
                <div>
                  <Label>Last Vet Visit</Label>
                  <Input type="date" value={formData.last_vet_visit} onChange={(e) => setFormData({ ...formData, last_vet_visit: e.target.value })} />
                </div>
                <div className="col-span-2">
                  <Label>Next Vaccination Date</Label>
                  <Input type="date" value={formData.next_vaccination_date} onChange={(e) => setFormData({ ...formData, next_vaccination_date: e.target.value })} />
                </div>
                <div className="col-span-2">
                  <Label>Condition Notes</Label>
                  <Textarea value={formData.condition_notes} onChange={(e) => setFormData({ ...formData, condition_notes: e.target.value })} rows={3} />
                </div>
              </div>
              <Button type="submit" className="w-full">{editingItem ? 'Update' : 'Add'} Livestock</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>
      </div>
      </GlassCard>

      <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
        {filteredLivestock.map((item) => {
          const daysUntilVaccination = getDaysUntil(item.next_vaccination_date);
          const daysSinceVet = item.last_vet_visit ? Math.floor((Date.now() - new Date(item.last_vet_visit).getTime()) / (1000 * 60 * 60 * 24)) : null;
          const healthTone = getHealthTone(daysUntilVaccination, daysSinceVet);

          return (
          <GlassCard key={item.id}>
            <div className={viewMode === 'grid' ? 'space-y-3' : 'flex flex-col gap-4 md:flex-row'}>
              {item.image_url && (
                <img
                  src={item.image_url}
                  alt={item.animal_type}
                  className={viewMode === 'grid' ? 'w-full h-32 object-cover rounded-lg' : 'w-full md:w-48 h-32 object-cover rounded-lg'}
                />
              )}
              <div className="flex-1 space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-semibold text-lg">{item.animal_type}</h3>
                    {item.breed && <p className="text-sm text-muted-foreground">{item.breed}</p>}
                  </div>
                  <Badge variant="outline">Count: {item.count}</Badge>
                </div>
                <div className={`rounded-xl border px-3 py-2 text-sm ${healthTone}`}>
                  <div className="flex items-center gap-2 font-medium">
                    <HeartPulse className="h-4 w-4" />
                    Health snapshot
                  </div>
                  <p className="mt-1 text-xs opacity-90">
                    {daysUntilVaccination !== null
                      ? `${daysUntilVaccination} days until next vaccination`
                      : 'No vaccination date set'}
                    {daysSinceVet !== null ? ` • Last vet visit ${daysSinceVet} days ago` : ''}
                  </p>
                </div>
                <div className="grid grid-cols-1 gap-2 text-sm sm:grid-cols-2">
                  {item.weight && <p><span className="text-muted-foreground">Weight:</span> {item.weight} kg</p>}
                  {item.date_acquired && <p><span className="text-muted-foreground">Acquired:</span> {item.date_acquired}</p>}
                  {item.last_vet_visit && <p><span className="text-muted-foreground">Last Vet Visit:</span> {item.last_vet_visit}</p>}
                  {item.next_vaccination_date && (
                    <p className={daysUntilVaccination !== null && daysUntilVaccination <= 7 ? 'text-destructive font-semibold' : ''}>
                      <span className="text-muted-foreground">Next Vaccination:</span> {item.next_vaccination_date}
                    </p>
                  )}
                </div>
                {item.condition_notes && <p className="rounded-xl bg-accent/70 p-3 text-xs leading-relaxed">{item.condition_notes}</p>}
                <div className="flex gap-2 pt-1">
                  <Button size="sm" variant="outline" onClick={() => { setEditingItem(item); setFormData({ animal_type: item.animal_type, breed: item.breed || '', count: item.count.toString(), date_acquired: item.date_acquired || '', weight: item.weight?.toString() || '', condition_notes: item.condition_notes || '', last_vet_visit: item.last_vet_visit || '', next_vaccination_date: item.next_vaccination_date || '', image_url: item.image_url || '' }); setOpen(true); }}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="destructive" onClick={() => handleDelete(item.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </GlassCard>
          );
        })}
      </div>

      {filteredLivestock.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <p>No livestock found. Add your first animal or clear filters to see all records.</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <GlassCard title="Total Animals" description="All livestock">
          <p className="text-3xl font-bold text-primary">{totalAnimals}</p>
        </GlassCard>
        <GlassCard title="Animal Types" description="Different species">
          <p className="text-3xl font-bold text-primary">{animalTypes.length}</p>
        </GlassCard>
        <GlassCard title="Upcoming Vaccinations" description="Next 30 days">
          <p className="text-3xl font-bold text-primary">{dueVaccinations}</p>
        </GlassCard>
      </div>
    </div>
  );
}
