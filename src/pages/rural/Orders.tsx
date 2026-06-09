import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { GlassCard } from '@/components/common/GlassCard';
import { SeasonalHero } from '@/components/common/SeasonalHero';
import { useRealtime } from '@/hooks/useRealtime';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { getOrders, updateOrder } from '@/db/api';
import type { Order, OrderStatus } from '@/types/types';
import { toast } from 'sonner';
import { Package, DollarSign } from 'lucide-react';

export default function OrdersManagement() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    if (user) {
      getOrders(user.id).then(setOrders);
    }
  }, [user]);

  // Realtime subscription for orders
  useRealtime({
    table: 'orders',
    filter: user ? `seller_id=eq.${user.id}` : undefined,
    onInsert: (newOrder) => {
      setOrders((prev) => [newOrder, ...prev]);
      toast.success('New order received! (live update)', { duration: 3000 });
    },
    onUpdate: (updatedOrder) => {
      setOrders((prev) => prev.map((o) => (o.id === updatedOrder.id ? updatedOrder : o)));
      toast.info('Order updated (live update)', { duration: 2000 });
    },
    onDelete: (deletedOrder) => {
      setOrders((prev) => prev.filter((o) => o.id !== deletedOrder.id));
    },
  });

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    try {
      await updateOrder(orderId, { status: newStatus as OrderStatus });
      toast.success('Order status updated');
      if (user) getOrders(user.id).then(setOrders);
    } catch (error) {
      toast.error('Update failed');
    }
  };

  const filteredOrders = statusFilter === 'all' ? orders : orders.filter(o => o.status === statusFilter);
  const totalRevenue = orders.filter(o => o.payment_status === 'paid').reduce((sum, o) => sum + Number(o.total_amount), 0);
  const pendingOrders = orders.filter(o => o.status === 'pending').length;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-500';
      case 'confirmed': return 'bg-blue-500';
      case 'shipped': return 'bg-purple-500';
      case 'delivered': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="p-6 space-y-6">
      <SeasonalHero
        pageKey="orders"
        title="Orders & Marketplace"
        description="Manage product orders and sales"
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <GlassCard title="Total Orders" description="All time">
          <p className="text-3xl font-bold text-primary">{orders.length}</p>
        </GlassCard>
        <GlassCard title="Total Revenue" description="Paid orders">
          <p className="text-3xl font-bold text-primary">${totalRevenue.toFixed(2)}</p>
        </GlassCard>
        <GlassCard title="Pending Orders" description="Awaiting confirmation">
          <p className="text-3xl font-bold text-primary">{pendingOrders}</p>
        </GlassCard>
      </div>

      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">Order List</h2>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Orders</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="confirmed">Confirmed</SelectItem>
            <SelectItem value="shipped">Shipped</SelectItem>
            <SelectItem value="delivered">Delivered</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-4">
        {filteredOrders.map((order) => (
          <GlassCard key={order.id}>
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <Package className="h-5 w-5 text-primary" />
                  <h3 className="font-semibold">Order #{order.id.slice(0, 8)}</h3>
                  <Badge className={getStatusColor(order.status)}>{order.status}</Badge>
                  <Badge variant={order.payment_status === 'paid' ? 'default' : 'outline'}>
                    {order.payment_status}
                  </Badge>
                </div>
                <div className="text-sm space-y-1">
                  <p><span className="text-muted-foreground">Buyer:</span> {order.buyer_name}</p>
                  <p><span className="text-muted-foreground">Product:</span> {order.product?.name || 'Product'}</p>
                  <p><span className="text-muted-foreground">Quantity:</span> {order.quantity}</p>
                  <p className="font-semibold text-primary">
                    <DollarSign className="inline h-4 w-4" />
                    {Number(order.total_amount).toFixed(2)}
                  </p>
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <Select value={order.status} onValueChange={(value) => handleStatusChange(order.id, value)}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="confirmed">Confirmed</SelectItem>
                    <SelectItem value="shipped">Shipped</SelectItem>
                    <SelectItem value="delivered">Delivered</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </GlassCard>
        ))}
      </div>

      {filteredOrders.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <p>No orders yet. Start selling your products!</p>
        </div>
      )}
    </div>
  );
}