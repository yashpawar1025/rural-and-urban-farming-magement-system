import { useCallback, useEffect, useMemo, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { GlassCard } from '@/components/common/GlassCard';
import { SeasonalHero } from '@/components/common/SeasonalHero';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { getInventory, createInventoryItem, updateInventoryItem, deleteInventoryItem } from '@/db/api';
import { isSupabaseConfigured } from '@/db/supabase';
import { useRealtime } from '@/hooks/useRealtime';
import { DEMO_RURAL_INVENTORY } from '@/lib/demoInventoryData';
import type { Inventory } from '@/types/types';
import { toast } from 'sonner';
import { Plus, Edit, Trash2, AlertTriangle, Search, ArrowUpDown, LayoutGrid, List, Package, TrendingDown, TrendingUp, AlertCircle } from 'lucide-react';

type SortOption = 'latest' | 'oldest' | 'name-asc' | 'name-desc' | 'quantity-high' | 'quantity-low' | 'category-asc' | 'category-desc';
type StockStatus = 'all' | 'low' | 'adequate' | 'overstocked';

const STOCK_COLORS: Record<StockStatus, string> = {
  all: 'bg-slate-100 text-slate-800 border-slate-200',
  low: 'bg-red-100 text-red-800 border-red-200',
  adequate: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  overstocked: 'bg-amber-100 text-amber-800 border-amber-200',
};

const getStockStatus = (quantity: number, threshold: number): StockStatus => {
  if (quantity <= threshold) return 'low';
  if (quantity <= threshold * 1.5) return 'adequate';
  return 'overstocked';
};

export default function InventoryManagement() {
  const { user } = useAuth();
  const [inventory, setInventory] = useState<Inventory[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Inventory | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [stockStatusFilter, setStockStatusFilter] = useState<StockStatus>('all');
  const [sortBy, setSortBy] = useState<SortOption>('latest');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [formData, setFormData] = useState({
    item_name: '',
    category: '',
    quantity: '',
    unit: '',
    reorder_threshold: '',
  });

  const resetForm = () => setFormData({
    item_name: '',
    category: '',
    quantity: '',
    unit: '',
    reorder_threshold: '',
  });

  const refreshInventory = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      if (!isSupabaseConfigured) {
        // Use demo inventory when Supabase is not configured
        setInventory(DEMO_RURAL_INVENTORY);
        return;
      }
      const data = await getInventory(user.id);
      setInventory(data);
    } catch (error) {
      console.error('Failed to load inventory:', error);
      toast.error('Failed to load inventory');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    refreshInventory();
  }, [refreshInventory]);

  useRealtime({
    table: 'inventory',
    filter: user ? `owner_id=eq.${user.id}` : undefined,
    onInsert: (newItem) => {
      setInventory((prev) => {
        if (prev.some((item) => item.id === newItem.id)) return prev;
        return [newItem, ...prev];
      });
    },
    onUpdate: (updatedItem) => {
      setInventory((prev) => prev.map((item) => (item.id === updatedItem.id ? updatedItem : item)));
    },
    onDelete: (deletedItem) => {
      setInventory((prev) => prev.filter((item) => item.id !== deletedItem.id));
    },
  });

  const lowStockItems = useMemo(() => inventory.filter((item) => item.quantity <= item.reorder_threshold), [inventory]);
  const adequateStockItems = useMemo(() => inventory.filter((item) => item.quantity > item.reorder_threshold && item.quantity <= item.reorder_threshold * 1.5), [inventory]);
  const overstockedItems = useMemo(() => inventory.filter((item) => item.quantity > item.reorder_threshold * 1.5), [inventory]);

  const categories = useMemo(() => ['Seeds', 'Fertilizers', 'Pesticides', 'Tools', 'Feed', 'Other', ...new Set(inventory.map((item) => item.category))].filter((v, i, a) => a.indexOf(v) === i), [inventory]);

  const filteredInventory = useMemo(() => {
    let filtered = [...inventory];

    if (searchTerm.trim()) {
      const query = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (item) =>
          item.item_name.toLowerCase().includes(query) ||
          item.category.toLowerCase().includes(query) ||
          item.unit.toLowerCase().includes(query)
      );
    }

    if (categoryFilter !== 'all') {
      filtered = filtered.filter((item) => item.category === categoryFilter);
    }

    if (stockStatusFilter !== 'all') {
      filtered = filtered.filter((item) => getStockStatus(item.quantity, item.reorder_threshold) === stockStatusFilter);
    }

    if (sortBy === 'latest') {
      filtered.sort((a, b) => b.created_at.localeCompare(a.created_at));
    } else if (sortBy === 'oldest') {
      filtered.sort((a, b) => a.created_at.localeCompare(b.created_at));
    } else if (sortBy === 'name-asc') {
      filtered.sort((a, b) => a.item_name.localeCompare(b.item_name));
    } else if (sortBy === 'name-desc') {
      filtered.sort((a, b) => b.item_name.localeCompare(a.item_name));
    } else if (sortBy === 'quantity-high') {
      filtered.sort((a, b) => b.quantity - a.quantity);
    } else if (sortBy === 'quantity-low') {
      filtered.sort((a, b) => a.quantity - b.quantity);
    } else if (sortBy === 'category-asc') {
      filtered.sort((a, b) => a.category.localeCompare(b.category));
    } else if (sortBy === 'category-desc') {
      filtered.sort((a, b) => b.category.localeCompare(a.category));
    }

    return filtered;
  }, [inventory, searchTerm, categoryFilter, stockStatusFilter, sortBy]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      if (editingItem) {
        await updateInventoryItem(editingItem.id, {
          ...formData,
          quantity: Number(formData.quantity),
          reorder_threshold: Number(formData.reorder_threshold),
        });
        toast.success('Inventory updated successfully');
      } else {
        await createInventoryItem({
          owner_id: user.id,
          ...formData,
          quantity: Number(formData.quantity),
          reorder_threshold: Number(formData.reorder_threshold),
        });
        toast.success('Inventory added successfully');
      }
      setOpen(false);
      setEditingItem(null);
      resetForm();
      refreshInventory();
    } catch (error) {
      console.error('Inventory save failed:', error);
      toast.error('Operation failed');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteInventoryItem(id);
      toast.success('Item deleted');
      refreshInventory();
    } catch (error) {
      console.error('Inventory delete failed:', error);
      toast.error('Delete failed');
    }
  };

  const clearFilters = () => {
    setSearchTerm('');
    setCategoryFilter('all');
    setStockStatusFilter('all');
    setSortBy('latest');
  };

  const totalInventoryValue = useMemo(() => {
    return inventory.length;
  }, [inventory]);

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
        pageKey="inventory"
        title="Inventory Management"
        description="Track supplies and get low stock alerts"
      />

      {!isSupabaseConfigured && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          Live backend is unavailable. Inventory management is still usable in demo mode.
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <GlassCard>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Items</p>
              <p className="text-2xl font-semibold">{totalInventoryValue}</p>
            </div>
            <Package className="h-5 w-5 text-sky-600" />
          </div>
        </GlassCard>
        <GlassCard>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Low Stock</p>
              <p className="text-2xl font-semibold text-red-600">{lowStockItems.length}</p>
            </div>
            <AlertTriangle className="h-5 w-5 text-red-600" />
          </div>
        </GlassCard>
        <GlassCard>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Adequate Stock</p>
              <p className="text-2xl font-semibold text-emerald-600">{adequateStockItems.length}</p>
            </div>
            <TrendingUp className="h-5 w-5 text-emerald-600" />
          </div>
        </GlassCard>
        <GlassCard>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Overstocked</p>
              <p className="text-2xl font-semibold text-amber-600">{overstockedItems.length}</p>
            </div>
            <TrendingDown className="h-5 w-5 text-amber-600" />
          </div>
        </GlassCard>
      </div>

      {lowStockItems.length > 0 && (
        <GlassCard className="border-l-4 border-l-destructive">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-destructive mt-0.5" />
            <div>
              <h3 className="font-semibold mb-2">Low Stock Alert</h3>
              <div className="space-y-1">
                {lowStockItems.map((item) => (
                  <p key={item.id} className="text-sm">
                    {item.item_name} - Only {item.quantity} {item.unit} remaining (Threshold: {item.reorder_threshold})
                  </p>
                ))}
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
                placeholder="Search items, categories, or units..."
                className="pl-10"
              />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((cat) => (
                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={stockStatusFilter} onValueChange={(value) => setStockStatusFilter(value as StockStatus)}>
              <SelectTrigger className="w-[180px]">
                <AlertCircle className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Stock status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Stock Levels</SelectItem>
                <SelectItem value="low">Low Stock</SelectItem>
                <SelectItem value="adequate">Adequate</SelectItem>
                <SelectItem value="overstocked">Overstocked</SelectItem>
              </SelectContent>
            </Select>
            <Select value={sortBy} onValueChange={(value) => setSortBy(value as SortOption)}>
              <SelectTrigger className="w-[180px]">
                <ArrowUpDown className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Sort items" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="latest">Latest Added</SelectItem>
                <SelectItem value="oldest">Oldest Added</SelectItem>
                <SelectItem value="name-asc">Name A-Z</SelectItem>
                <SelectItem value="name-desc">Name Z-A</SelectItem>
                <SelectItem value="quantity-high">Quantity High-Low</SelectItem>
                <SelectItem value="quantity-low">Quantity Low-High</SelectItem>
                <SelectItem value="category-asc">Category A-Z</SelectItem>
                <SelectItem value="category-desc">Category Z-A</SelectItem>
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
          </div>

          <div className="flex items-center justify-between gap-3">
            <h2 className="text-2xl font-semibold">Inventory Items</h2>
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => { setEditingItem(null); resetForm(); }}>
                  <Plus className="mr-2 h-4 w-4" /> Add Item
                </Button>
              </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingItem ? 'Edit Item' : 'Add New Item'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label>Item Name</Label>
                <Input value={formData.item_name} onChange={(e) => setFormData({ ...formData, item_name: e.target.value })} required placeholder="e.g., Nitrogen Fertilizer" />
              </div>
              <div>
                <Label>Category</Label>
                <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Quantity</Label>
                  <Input type="number" step="0.1" value={formData.quantity} onChange={(e) => setFormData({ ...formData, quantity: e.target.value })} required placeholder="0" />
                </div>
                <div>
                  <Label>Unit</Label>
                  <Input value={formData.unit} onChange={(e) => setFormData({ ...formData, unit: e.target.value })} required placeholder="kg, L, bags" />
                </div>
              </div>
              <div>
                <Label>Reorder Threshold</Label>
                <Input type="number" step="0.1" value={formData.reorder_threshold} onChange={(e) => setFormData({ ...formData, reorder_threshold: e.target.value })} required placeholder="0" />
              </div>
              <Button type="submit" className="w-full">{editingItem ? 'Update' : 'Add'} Item</Button>
            </form>
          </DialogContent>
            </Dialog>
          </div>
        </div>
      </GlassCard>

      <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
        {filteredInventory.map((item) => {
          const status = getStockStatus(item.quantity, item.reorder_threshold);
          const statusColor = STOCK_COLORS[status];

          return (
          <GlassCard key={item.id}>
            <div className={viewMode === 'grid' ? 'space-y-3' : 'flex items-start justify-between gap-4'}>
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-lg">{item.item_name}</h3>
                  <div className="mt-1 flex gap-2">
                    <Badge variant="outline">{item.category}</Badge>
                    <Badge className={statusColor}>{status}</Badge>
                  </div>
                </div>
              </div>
              <div className="text-sm space-y-1">
                <div className="rounded-xl border border-border bg-slate-50 px-3 py-2">
                  <p className="text-xs text-muted-foreground mb-1">Current Stock</p>
                  <p className="text-2xl font-bold text-primary">
                    {item.quantity} <span className="text-base font-normal text-muted-foreground">{item.unit}</span>
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="rounded-lg bg-slate-50 px-2 py-2">
                    <p className="text-xs text-muted-foreground">Threshold</p>
                    <p className="text-sm font-semibold">{item.reorder_threshold}</p>
                  </div>
                  <div className="rounded-lg bg-slate-50 px-2 py-2">
                    <p className="text-xs text-muted-foreground">Buffer</p>
                    <p className="text-sm font-semibold">{Math.max(0, item.quantity - item.reorder_threshold).toFixed(1)}</p>
                  </div>
                </div>
                {item.quantity <= item.reorder_threshold && (
                  <div className="rounded-lg border border-red-200 bg-red-50 px-2 py-2 flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-red-600 flex-shrink-0" />
                    <span className="text-xs text-red-700 font-medium">Reorder needed</span>
                  </div>
                )}
                <p className="text-muted-foreground">Reorder at: {item.reorder_threshold} {item.unit}</p>
              </div>
              <div className="flex gap-2 pt-2">
                <Button size="sm" variant="outline" onClick={() => { setEditingItem(item); setFormData({ item_name: item.item_name, category: item.category, quantity: item.quantity.toString(), unit: item.unit, reorder_threshold: item.reorder_threshold.toString() }); setOpen(true); }} className="flex-1">
                  <Edit className="h-4 w-4" />
                </Button>
                <Button size="sm" variant="destructive" onClick={() => handleDelete(item.id)} className="flex-1">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </GlassCard>
          );
        })}
      </div>

      {filteredInventory.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <p>No inventory items found. Add your first item or clear filters to see all records.</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <GlassCard title="Total Items" description="In inventory">
          <p className="text-3xl font-bold text-primary">{totalInventoryValue}</p>
        </GlassCard>
        <GlassCard title="Low Stock Items" description="Need reordering">
          <p className="text-3xl font-bold text-red-600">{lowStockItems.length}</p>
        </GlassCard>
        <GlassCard title="Categories" description="Item types">
          <p className="text-3xl font-bold text-primary">{categories.length}</p>
        </GlassCard>
      </div>
    </div>
  );
}