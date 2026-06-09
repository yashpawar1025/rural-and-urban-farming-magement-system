import { useCallback, useEffect, useMemo, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { GlassCard } from '@/components/common/GlassCard';
import { SeasonalHero } from '@/components/common/SeasonalHero';
import { ImageUpload } from '@/components/common/ImageUpload';
import { useRealtime } from '@/hooks/useRealtime';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { getCrops, createCrop, updateCrop, deleteCrop } from '@/db/api';
import { isSupabaseConfigured } from '@/db/supabase';
import { exportCropsToCSV } from '@/lib/csvExport';
import type { Crop, GrowthStage } from '@/types/types';
import { toast } from 'sonner';
import { Plus, Edit, Trash2, Sprout, Download, Filter, Search, ArrowUpDown, LayoutGrid, List, Sparkles, Clock3, CircleCheckBig, Activity } from 'lucide-react';

type SortOption = 'latest' | 'oldest' | 'name-asc' | 'name-desc' | 'yield-high' | 'yield-low';

const STAGE_STYLE: Record<GrowthStage, string> = {
  seedling: 'bg-sky-100 text-sky-800 border-sky-200',
  vegetative: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  flowering: 'bg-amber-100 text-amber-800 border-amber-200',
  harvest: 'bg-orange-100 text-orange-800 border-orange-200',
};

export default function CropsManagement() {
  const { user } = useAuth();
  const [crops, setCrops] = useState<Crop[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editingCrop, setEditingCrop] = useState<Crop | null>(null);
  const [selectedCrops, setSelectedCrops] = useState<Set<string>>(new Set());
  const [searchTerm, setSearchTerm] = useState('');
  const [stageFilter, setStageFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<SortOption>('latest');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [formData, setFormData] = useState({
    name: '',
    variety: '',
    field_assigned: '',
    planting_date: '',
    expected_harvest_date: '',
    growth_stage: 'seedling' as GrowthStage,
    expected_yield: '',
    image_url: '',
    notes: '',
  });

  const refreshCrops = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const data = await getCrops(user.id);
      setCrops(data);
    } catch (error) {
      console.error('Failed to fetch crops:', error);
      toast.error('Failed to load crops');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    refreshCrops();
  }, [refreshCrops]);

  const filteredCrops = useMemo(() => {
    let filtered = [...crops];

    if (searchTerm.trim()) {
      const query = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (crop) =>
          crop.name.toLowerCase().includes(query) ||
          crop.variety?.toLowerCase().includes(query) ||
          crop.field_assigned?.toLowerCase().includes(query) ||
          crop.notes?.toLowerCase().includes(query)
      );
    }

    if (stageFilter !== 'all') {
      filtered = filtered.filter((crop) => crop.growth_stage === stageFilter);
    }

    if (sortBy === 'latest') {
      filtered.sort((a, b) => b.created_at.localeCompare(a.created_at));
    } else if (sortBy === 'oldest') {
      filtered.sort((a, b) => a.created_at.localeCompare(b.created_at));
    } else if (sortBy === 'name-asc') {
      filtered.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortBy === 'name-desc') {
      filtered.sort((a, b) => b.name.localeCompare(a.name));
    } else if (sortBy === 'yield-high') {
      filtered.sort((a, b) => Number(b.expected_yield || 0) - Number(a.expected_yield || 0));
    } else if (sortBy === 'yield-low') {
      filtered.sort((a, b) => Number(a.expected_yield || 0) - Number(b.expected_yield || 0));
    }

    return filtered;
  }, [crops, searchTerm, stageFilter, sortBy]);

  // Realtime subscription for crops
  useRealtime({
    table: 'crops',
    filter: user ? `owner_id=eq.${user.id}` : undefined,
    onInsert: (newCrop) => {
      setCrops((prev) => {
        if (prev.some((item) => item.id === newCrop.id)) {
          return prev;
        }
        return [newCrop, ...prev];
      });
      toast.success('New crop added (live update)', { duration: 2000 });
    },
    onUpdate: (updatedCrop) => {
      setCrops((prev) => prev.map((c) => (c.id === updatedCrop.id ? updatedCrop : c)));
      toast.info('Crop updated (live update)', { duration: 2000 });
    },
    onDelete: (deletedCrop) => {
      setCrops((prev) => prev.filter((c) => c.id !== deletedCrop.id));
      toast.info('Crop deleted (live update)', { duration: 2000 });
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      if (editingCrop) {
        await updateCrop(editingCrop.id, {
          ...formData,
          expected_yield: formData.expected_yield ? Number(formData.expected_yield) : null,
          notes: formData.notes || null,
        });
        toast.success('Crop updated successfully');
      } else {
        await createCrop({
          owner_id: user.id,
          ...formData,
          expected_yield: formData.expected_yield ? Number(formData.expected_yield) : null,
          actual_yield: null,
          actual_harvest_date: null,
          notes: formData.notes || null,
        });
        toast.success('Crop added successfully');
      }
      setOpen(false);
      setEditingCrop(null);
      setFormData({ name: '', variety: '', field_assigned: '', planting_date: '', expected_harvest_date: '', growth_stage: 'seedling', expected_yield: '', image_url: '', notes: '' });
      refreshCrops();
    } catch (error) {
      console.error('Crop save failed:', error);
      toast.error('Operation failed');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteCrop(id);
      toast.success('Crop deleted');
      refreshCrops();
    } catch (error) {
      console.error('Crop delete failed:', error);
      toast.error('Delete failed');
    }
  };

  const handleBulkDelete = async () => {
    if (selectedCrops.size === 0) {
      toast.error('No crops selected');
      return;
    }
    
    try {
      await Promise.all(Array.from(selectedCrops).map(id => deleteCrop(id)));
      toast.success(`${selectedCrops.size} crops deleted`);
      setSelectedCrops(new Set());
      refreshCrops();
    } catch (error) {
      console.error('Bulk delete failed:', error);
      toast.error('Bulk delete failed');
    }
  };

  const handleBulkUpdateStage = async (newStage: GrowthStage) => {
    if (selectedCrops.size === 0) {
      toast.error('No crops selected');
      return;
    }
    
    try {
      await Promise.all(
        Array.from(selectedCrops).map(id => {
          const crop = crops.find(c => c.id === id);
          if (crop) {
            return updateCrop(id, { growth_stage: newStage });
          }
          return Promise.resolve();
        })
      );
      toast.success(`${selectedCrops.size} crops updated to ${newStage}`);
      setSelectedCrops(new Set());
      refreshCrops();
    } catch (error) {
      console.error('Bulk stage update failed:', error);
      toast.error('Bulk update failed');
    }
  };

  const handleExport = () => {
    if (filteredCrops.length === 0) {
      toast.error('No crops to export');
      return;
    }
    
    try {
      exportCropsToCSV(filteredCrops);
      toast.success(`Exported ${filteredCrops.length} crops to CSV`);
    } catch (error) {
      toast.error('Export failed');
    }
  };

  const toggleSelectAll = () => {
    if (selectedCrops.size === filteredCrops.length) {
      setSelectedCrops(new Set());
    } else {
      setSelectedCrops(new Set(filteredCrops.map(c => c.id)));
    }
  };

  const toggleSelectCrop = (id: string) => {
    const newSelected = new Set(selectedCrops);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedCrops(newSelected);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setStageFilter('all');
    setSortBy('latest');
  };

  const totalExpectedYield = useMemo(
    () => crops.reduce((sum, crop) => sum + Number(crop.expected_yield || 0), 0),
    [crops]
  );

  const upcomingHarvest = useMemo(() => {
    return crops
      .filter((crop) => crop.expected_harvest_date)
      .sort((a, b) => (a.expected_harvest_date || '').localeCompare(b.expected_harvest_date || ''))
      .slice(0, 4);
  }, [crops]);

  const readinessRate = useMemo(() => {
    if (!crops.length) return 0;
    const ready = crops.filter((crop) => crop.growth_stage === 'harvest').length;
    return Math.round((ready / crops.length) * 100);
  }, [crops]);

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
        pageKey="cropsManagement"
        title="Crops Management"
        description="Track and manage your crop lifecycle"
      />

      {!isSupabaseConfigured && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          Live backend is unavailable. You can still use crop management in demo mode.
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <GlassCard>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Crops</p>
              <p className="text-2xl font-semibold">{crops.length}</p>
            </div>
            <Sprout className="h-5 w-5 text-emerald-600" />
          </div>
        </GlassCard>
        <GlassCard>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Expected Yield</p>
              <p className="text-2xl font-semibold">{totalExpectedYield.toFixed(1)} t</p>
            </div>
            <Activity className="h-5 w-5 text-sky-600" />
          </div>
        </GlassCard>
        <GlassCard>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Readiness</p>
              <p className="text-2xl font-semibold">{readinessRate}%</p>
            </div>
            <CircleCheckBig className="h-5 w-5 text-amber-600" />
          </div>
        </GlassCard>
        <GlassCard>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Upcoming Harvest</p>
              <p className="text-2xl font-semibold">{upcomingHarvest.length}</p>
            </div>
            <Clock3 className="h-5 w-5 text-violet-600" />
          </div>
        </GlassCard>
      </div>

      {/* Toolbar */}
      <GlassCard>
        <div className="space-y-4">
          <div className="flex flex-wrap gap-3 items-center">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search crops..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={stageFilter} onValueChange={setStageFilter}>
              <SelectTrigger className="w-[180px]">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Filter by stage" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Stages</SelectItem>
                <SelectItem value="seedling">Seedling</SelectItem>
                <SelectItem value="vegetative">Vegetative</SelectItem>
                <SelectItem value="flowering">Flowering</SelectItem>
                <SelectItem value="harvest">Harvest</SelectItem>
              </SelectContent>
            </Select>
            <Select value={sortBy} onValueChange={(value) => setSortBy(value as SortOption)}>
              <SelectTrigger className="w-[180px]">
                <ArrowUpDown className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Sort crops" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="latest">Latest Added</SelectItem>
                <SelectItem value="oldest">Oldest Added</SelectItem>
                <SelectItem value="name-asc">Name A-Z</SelectItem>
                <SelectItem value="name-desc">Name Z-A</SelectItem>
                <SelectItem value="yield-high">Yield High-Low</SelectItem>
                <SelectItem value="yield-low">Yield Low-High</SelectItem>
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
            <Button variant="outline" onClick={handleExport}>
              <Download className="mr-2 h-4 w-4" /> Export CSV
            </Button>
            <Button variant="outline" onClick={clearFilters}>Reset</Button>
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => { setEditingCrop(null); setFormData({ name: '', variety: '', field_assigned: '', planting_date: '', expected_harvest_date: '', growth_stage: 'seedling', expected_yield: '', image_url: '', notes: '' }); }}>
                  <Plus className="mr-2 h-4 w-4" /> Add Crop
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingCrop ? 'Edit Crop' : 'Add New Crop'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label>Crop Image</Label>
                <ImageUpload
                  currentImageUrl={formData.image_url}
                  onUploadComplete={(url) => setFormData({ ...formData, image_url: url })}
                  folder="crops"
                />
              </div>
              <div>
                <Label>Crop Name</Label>
                <Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
              </div>
              <div>
                <Label>Variety</Label>
                <Input value={formData.variety} onChange={(e) => setFormData({ ...formData, variety: e.target.value })} />
              </div>
              <div>
                <Label>Field Assigned</Label>
                <Input value={formData.field_assigned} onChange={(e) => setFormData({ ...formData, field_assigned: e.target.value })} />
              </div>
              <div>
                <Label>Planting Date</Label>
                <Input type="date" value={formData.planting_date} onChange={(e) => setFormData({ ...formData, planting_date: e.target.value })} />
              </div>
              <div>
                <Label>Expected Harvest Date</Label>
                <Input type="date" value={formData.expected_harvest_date} onChange={(e) => setFormData({ ...formData, expected_harvest_date: e.target.value })} />
              </div>
              <div>
                <Label>Growth Stage</Label>
                <Select value={formData.growth_stage} onValueChange={(value) => setFormData({ ...formData, growth_stage: value as GrowthStage })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="seedling">Seedling</SelectItem>
                    <SelectItem value="vegetative">Vegetative</SelectItem>
                    <SelectItem value="flowering">Flowering</SelectItem>
                    <SelectItem value="harvest">Harvest</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Expected Yield (tons)</Label>
                <Input type="number" step="0.1" value={formData.expected_yield} onChange={(e) => setFormData({ ...formData, expected_yield: e.target.value })} />
              </div>
              <div>
                <Label>Notes</Label>
                <Textarea rows={3} value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} placeholder="Add optional notes, observations, or care reminders..." />
              </div>
              <Button type="submit" className="w-full">{editingCrop ? 'Update' : 'Add'} Crop</Button>
            </form>
          </DialogContent>
        </Dialog>
          </div>

          {/* Bulk Actions */}
          {selectedCrops.size > 0 && (
            <div className="flex items-center gap-3 p-3 bg-accent rounded-lg">
              <span className="text-sm font-medium">{selectedCrops.size} selected</span>
              <Button variant="outline" size="sm" onClick={toggleSelectAll}>
                {selectedCrops.size === filteredCrops.length ? 'Unselect All' : 'Select All'}
              </Button>
              <Select onValueChange={(value) => handleBulkUpdateStage(value as GrowthStage)}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Update stage" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="seedling">Set to Seedling</SelectItem>
                  <SelectItem value="vegetative">Set to Vegetative</SelectItem>
                  <SelectItem value="flowering">Set to Flowering</SelectItem>
                  <SelectItem value="harvest">Set to Harvest</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="destructive" size="sm" onClick={handleBulkDelete}>
                <Trash2 className="mr-2 h-4 w-4" /> Delete Selected
              </Button>
              <Button variant="outline" size="sm" onClick={() => setSelectedCrops(new Set())}>
                Clear Selection
              </Button>
            </div>
          )}
        </div>
      </GlassCard>

      {/* Stage Breakdown */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <GlassCard title="Stage Breakdown" description="Distribution across growth lifecycle">
          <div className="space-y-3">
            {(['seedling', 'vegetative', 'flowering', 'harvest'] as GrowthStage[]).map((stage) => {
              const count = crops.filter((crop) => crop.growth_stage === stage).length;
              const percent = crops.length ? Math.round((count / crops.length) * 100) : 0;
              return (
                <div key={stage}>
                  <div className="mb-1 flex items-center justify-between text-sm">
                    <span className="capitalize">{stage}</span>
                    <span className="text-muted-foreground">{count} ({percent}%)</span>
                  </div>
                  <div className="h-2 rounded-full bg-slate-100">
                    <div className="h-2 rounded-full bg-emerald-500 transition-all duration-300" style={{ width: `${percent}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </GlassCard>
        <GlassCard title="Upcoming Harvest Window" description="Nearest expected harvest dates">
          <div className="space-y-3">
            {upcomingHarvest.length === 0 ? (
              <p className="py-6 text-center text-sm text-muted-foreground">No harvest dates scheduled yet.</p>
            ) : (
              upcomingHarvest.map((crop) => (
                <div key={crop.id} className="rounded-xl border border-border bg-white px-3 py-2 shadow-sm">
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <p className="font-medium">{crop.name}</p>
                      <p className="text-xs text-muted-foreground">{crop.field_assigned || 'No field assigned'}</p>
                    </div>
                    <Badge variant="outline">{crop.expected_harvest_date}</Badge>
                  </div>
                </div>
              ))
            )}
          </div>
        </GlassCard>
      </div>

      {/* Crops Grid */}
      <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
        {filteredCrops.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <Sprout className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
            <p className="text-muted-foreground">No crops found</p>
          </div>
        ) : (
          filteredCrops.map((crop) => (
            <GlassCard key={crop.id}>
              <div className={viewMode === 'grid' ? 'space-y-3' : 'flex gap-4 items-start'}>
                <Checkbox
                  checked={selectedCrops.has(crop.id)}
                  onCheckedChange={() => toggleSelectCrop(crop.id)}
                />
                <div className="flex-1">
                  {crop.image_url && (
                    <img
                      src={crop.image_url}
                      alt={crop.name}
                      className={viewMode === 'grid' ? 'w-full h-32 object-cover rounded-lg mb-2' : 'w-full md:w-52 h-32 object-cover rounded-lg mb-2 md:mb-0'}
                    />
                  )}
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-lg">{crop.name}</h3>
                      {crop.variety && <p className="text-sm text-muted-foreground">{crop.variety}</p>}
                    </div>
                    <Badge variant="outline" className={STAGE_STYLE[crop.growth_stage]}>{crop.growth_stage}</Badge>
                  </div>
                  <div className="text-sm space-y-1 mt-2">
                    <p><span className="text-muted-foreground">Field:</span> {crop.field_assigned || 'N/A'}</p>
                    <p><span className="text-muted-foreground">Planted:</span> {crop.planting_date || 'N/A'}</p>
                    <p><span className="text-muted-foreground">Harvest:</span> {crop.expected_harvest_date || 'N/A'}</p>
                    <p><span className="text-muted-foreground">Expected Yield:</span> {crop.expected_yield || 'N/A'} tons</p>
                    {crop.notes && <p className="text-xs text-muted-foreground line-clamp-2">{crop.notes}</p>}
                  </div>
                  <div className="flex gap-2 mt-3">
                    <Button size="sm" variant="outline" onClick={() => { setEditingCrop(crop); setFormData({ name: crop.name, variety: crop.variety || '', field_assigned: crop.field_assigned || '', planting_date: crop.planting_date || '', expected_harvest_date: crop.expected_harvest_date || '', growth_stage: crop.growth_stage, expected_yield: crop.expected_yield?.toString() || '', image_url: crop.image_url || '', notes: crop.notes || '' }); setOpen(true); }}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="destructive" onClick={() => handleDelete(crop.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </GlassCard>
          ))
        )}
      </div>

      {crops.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <p>No crops yet. Add your first crop to get started!</p>
        </div>
      )}
    </div>
  );
}
