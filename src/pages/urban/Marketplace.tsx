import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { GlassCard } from '@/components/common/GlassCard';
import { SeasonalHero } from '@/components/common/SeasonalHero';
import { ImageUpload } from '@/components/common/ImageUpload';
import { useRealtime } from '@/hooks/useRealtime';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { getProducts, createProduct, getOrders } from '@/db/api';
import type { Product, Order } from '@/types/types';
import { toast } from 'sonner';
import { Plus, ShoppingBag, DollarSign } from 'lucide-react';

export default function Marketplace() {
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    product_name: '',
    description: '',
    price: '',
    quantity_available: '',
    image_url: '',
  });

  useEffect(() => {
    if (user) {
      getProducts(user.id).then(setProducts);
      getOrders(user.id).then(setOrders);
    }
  }, [user]);

  // Realtime subscriptions
  useRealtime({
    table: 'products',
    filter: user ? `owner_id=eq.${user.id}` : undefined,
    onInsert: (newProduct) => {
      setProducts((prev) => [...prev, newProduct]);
      toast.success('Product added (live update)', { duration: 2000 });
    },
    onUpdate: (updatedProduct) => {
      setProducts((prev) => prev.map((p) => (p.id === updatedProduct.id ? updatedProduct : p)));
    },
    onDelete: (deletedProduct) => {
      setProducts((prev) => prev.filter((p) => p.id !== deletedProduct.id));
    },
  });

  useRealtime({
    table: 'orders',
    filter: user ? `seller_id=eq.${user.id}` : undefined,
    onInsert: (newOrder) => {
      setOrders((prev) => [newOrder, ...prev]);
      toast.success('New order received! (live update)', { duration: 3000 });
    },
    onUpdate: (updatedOrder) => {
      setOrders((prev) => prev.map((o) => (o.id === updatedOrder.id ? updatedOrder : o)));
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      await createProduct({
        owner_id: user.id,
        name: formData.product_name,
        description: formData.description || null,
        price: Number(formData.price),
        quantity_available: Number(formData.quantity_available),
        image_url: formData.image_url || null,
      });
      toast.success('Product listed successfully');
      setOpen(false);
      setFormData({ product_name: '', description: '', price: '', quantity_available: '', image_url: '' });
      getProducts(user.id).then(setProducts);
    } catch (error) {
      toast.error('Operation failed');
    }
  };

  const totalRevenue = orders.filter(o => o.payment_status === 'paid').reduce((sum, o) => sum + Number(o.total_amount), 0);

  return (
    <div className="p-6 space-y-6">
      <SeasonalHero
        pageKey="urbanMarketplace"
        title="Marketplace"
        description="Sell your home-grown produce"
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <GlassCard title="Listed Products" description="Available for sale">
          <p className="text-3xl font-bold text-primary">{products.length}</p>
        </GlassCard>
        <GlassCard title="Total Orders" description="All time">
          <p className="text-3xl font-bold text-primary">{orders.length}</p>
        </GlassCard>
        <GlassCard title="Total Revenue" description="Earnings">
          <p className="text-3xl font-bold text-primary">${totalRevenue.toFixed(2)}</p>
        </GlassCard>
      </div>

      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">My Products</h2>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" /> List Product
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>List New Product</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label>Product Image</Label>
                <ImageUpload
                  currentImageUrl={formData.image_url}
                  onUploadComplete={(url) => setFormData({ ...formData, image_url: url })}
                  folder="products"
                />
              </div>
              <div>
                <Label>Product Name</Label>
                <Input value={formData.product_name} onChange={(e) => setFormData({ ...formData, product_name: e.target.value })} required />
              </div>
              <div>
                <Label>Description</Label>
                <Textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} rows={3} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Price ($)</Label>
                  <Input type="number" step="0.01" value={formData.price} onChange={(e) => setFormData({ ...formData, price: e.target.value })} required />
                </div>
                <div>
                  <Label>Quantity</Label>
                  <Input type="number" value={formData.quantity_available} onChange={(e) => setFormData({ ...formData, quantity_available: e.target.value })} required />
                </div>
              </div>
              <Button type="submit" className="w-full">List Product</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((product) => (
          <GlassCard key={product.id}>
            <div className="space-y-3">
              {product.image_url && (
                <img
                  src={product.image_url}
                  alt={product.name}
                  className="w-full h-32 object-cover rounded-lg"
                />
              )}
              <div className="flex items-start justify-between">
                <h3 className="font-semibold text-lg">{product.name}</h3>
                <ShoppingBag className="h-5 w-5 text-primary" />
              </div>
              {product.description && (
                <p className="text-sm text-muted-foreground">{product.description}</p>
              )}
              <div className="flex items-center justify-between">
                <div className="text-2xl font-bold text-primary">
                  <DollarSign className="inline h-5 w-5" />
                  {Number(product.price).toFixed(2)}
                </div>
                <Badge variant="outline">{product.quantity_available} available</Badge>
              </div>
            </div>
          </GlassCard>
        ))}
      </div>

      {products.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <p>No products listed yet. Start selling your produce!</p>
        </div>
      )}

      <GlassCard title="Recent Orders" description="Customer purchases">
        <div className="space-y-3">
          {orders.slice(0, 5).map((order) => (
            <div key={order.id} className="p-3 bg-accent rounded-lg flex items-center justify-between">
              <div>
                <p className="font-semibold">{order.product?.name || 'Product'}</p>
                <p className="text-sm text-muted-foreground">Qty: {order.quantity}</p>
              </div>
              <div className="text-right">
                <p className="font-semibold text-primary">${Number(order.total_amount).toFixed(2)}</p>
                <Badge variant={order.status === 'delivered' ? 'default' : 'outline'}>{order.status}</Badge>
              </div>
            </div>
          ))}
        </div>
        {orders.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <p>No orders yet</p>
          </div>
        )}
      </GlassCard>
    </div>
  );
}
