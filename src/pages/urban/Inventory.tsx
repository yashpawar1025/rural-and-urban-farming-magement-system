import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { GlassCard } from '@/components/common/GlassCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { getInventory, createInventoryItem } from '@/db/api';
import { isSupabaseConfigured } from '@/db/supabase';
import { DEMO_URBAN_INVENTORY } from '@/lib/demoInventoryData';
import type { Inventory } from '@/types/types';
import { toast } from 'sonner';
import { Plus, Wrench } from 'lucide-react';

// Inventory data is now imported from demoInventoryData.ts

export default function UrbanInventory() {
  const { user } = useAuth();
  const [inventory, setInventory] = useState<Inventory[]>([]);
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    item_name: '',
    category: '',
    quantity: '',
    unit: '',
    reorder_threshold: '',
  });

  useEffect(() => {
    if (user) {
      if (!isSupabaseConfigured) {
        setInventory(DEMO_URBAN_INVENTORY);
      } else {
        getInventory(user.id).catch(() => setInventory(DEMO_URBAN_INVENTORY));
      }
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      await createInventoryItem({
        owner_id: user.id,
        ...formData,
        quantity: Number(formData.quantity),
        reorder_threshold: Number(formData.reorder_threshold),
      });
      toast.success('Item added successfully');
      setOpen(false);
      setFormData({ item_name: '', category: '', quantity: '', unit: '', reorder_threshold: '' });
      getInventory(user.id).then(setInventory);
    } catch (error) {
      toast.error('Operation failed');
    }
  };

  const lowStockItems = inventory.filter(item => item.quantity <= item.reorder_threshold);

  return (
    <div className="p-6 space-y-6">
      <div className="gradient-animate rounded-lg p-8 text-white">
        <h1 className="text-3xl font-bold mb-2">Inventory & Equipment</h1>
        <p className="text-white/90">Track tools and supplies</p>
      </div>

      {lowStockItems.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <p className="text-sm text-amber-800">
            <strong>{lowStockItems.length}</strong> items running low on stock
          </p>
        </div>
      )}

      <div className="flex gap-3">
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="h-4 w-4 mr-2" />Add Item</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Inventory Item</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">Item Name</Label>
                <Input
                  id="name"
                  value={formData.item_name}
                  onChange={(e) => setFormData({...formData, item_name: e.target.value})}
                  required
                />
              </div>
              <div>
                <Label htmlFor="category">Category</Label>
                <Input
                  id="category"
                  value={formData.category}
                  onChange={(e) => setFormData({...formData, category: e.target.value})}
                  required
                />
              </div>
              <div>
                <Label htmlFor="quantity">Quantity</Label>
                <Input
                  id="quantity"
                  type="number"
                  value={formData.quantity}
                  onChange={(e) => setFormData({...formData, quantity: e.target.value})}
                  required
                />
              </div>
              <div>
                <Label htmlFor="unit">Unit</Label>
                <Input
                  id="unit"
                  value={formData.unit}
                  onChange={(e) => setFormData({...formData, unit: e.target.value})}
                  required
                />
              </div>
              <div>
                <Label htmlFor="threshold">Reorder Threshold</Label>
                <Input
                  id="threshold"
                  type="number"
                  value={formData.reorder_threshold}
                  onChange={(e) => setFormData({...formData, reorder_threshold: e.target.value})}
                  required
                />
              </div>
              <Button type="submit" className="w-full">Add Item</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {inventory.map((item) => (
          <GlassCard key={item.id}>
            <div className="space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-lg">{item.item_name}</h3>
                  <Badge variant="outline">{item.category}</Badge>
                </div>
                <Wrench className="h-5 w-5 text-primary" />
              </div>
              <div className="text-sm space-y-1">
                <p className="text-2xl font-bold text-primary">
                  {item.quantity} <span className="text-base font-normal text-muted-foreground">{item.unit}</span>
                </p>
                <p className="text-muted-foreground">Reorder at: {item.reorder_threshold} {item.unit}</p>
                {item.quantity <= item.reorder_threshold && (
                  <Badge variant="destructive" className="mt-2">Low Stock</Badge>
                )}
              </div>
            </div>
          </GlassCard>
        ))}
      </div>

      {inventory.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <p>No items yet. Add your first tool or supply!</p>
        </div>
      )}
    </div>
  );
}
