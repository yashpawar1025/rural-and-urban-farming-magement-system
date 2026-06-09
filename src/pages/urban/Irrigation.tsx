import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { GlassCard } from '@/components/common/GlassCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Line } from 'react-chartjs-2';
import { getIrrigationSchedules, createIrrigationSchedule } from '@/db/api';
import type { IrrigationSchedule } from '@/types/types';
import { toast } from 'sonner';
import { Plus, Droplets } from 'lucide-react';

export default function Irrigation() {
  const { user } = useAuth();
  const [schedules, setSchedules] = useState<IrrigationSchedule[]>([]);
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    plant_name: '',
    watering_days: '',
    watering_time: '',
    daily_water_usage: '',
  });

  useEffect(() => {
    if (user) {
      getIrrigationSchedules(user.id).then(setSchedules);
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      await createIrrigationSchedule({
        owner_id: user.id,
        ...formData,
        zone: null,
        watering_days: formData.watering_days.split(',').map(d => d.trim()),
        daily_water_usage: Number(formData.daily_water_usage),
      });
      toast.success('Schedule added successfully');
      setOpen(false);
      setFormData({ plant_name: '', watering_days: '', watering_time: '', daily_water_usage: '' });
      getIrrigationSchedules(user.id).then(setSchedules);
    } catch (error) {
      toast.error('Operation failed');
    }
  };

  const totalWaterUsage = schedules.reduce((sum, s) => sum + Number(s.daily_water_usage), 0);

  const usageChartData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [{
      label: 'Water Usage (L)',
      data: [totalWaterUsage * 0.9, totalWaterUsage * 1.1, totalWaterUsage, totalWaterUsage * 0.95, totalWaterUsage * 1.05, totalWaterUsage * 1.2, totalWaterUsage],
      borderColor: 'hsl(var(--chart-3))',
      backgroundColor: 'hsla(var(--chart-3), 0.1)',
      fill: true,
      tension: 0.4,
    }],
  };

  return (
    <div className="p-6 space-y-6">
      <div className="gradient-animate rounded-lg p-8 text-white">
        <h1 className="text-3xl font-bold mb-2">Irrigation System</h1>
        <p className="text-white/90">Manage watering schedules and track usage</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <GlassCard title="Today's Usage" description="Water consumed">
          <p className="text-3xl font-bold text-primary">{totalWaterUsage.toFixed(1)}L</p>
        </GlassCard>
        <GlassCard title="Active Schedules" description="Watering plans">
          <p className="text-3xl font-bold text-primary">{schedules.length}</p>
        </GlassCard>
        <GlassCard title="Efficiency" description="Water savings">
          <p className="text-3xl font-bold text-primary">92%</p>
        </GlassCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <GlassCard title="Water Usage Trend" description="Last 7 days">
          <Line data={usageChartData} options={{ responsive: true, maintainAspectRatio: true }} />
        </GlassCard>

        <GlassCard title="Watering Schedules" description="Active plans">
          <div className="space-y-3 mb-4">
            {schedules.map((schedule) => (
              <div key={schedule.id} className="p-3 bg-accent rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold">{schedule.plant_name}</h3>
                  <Droplets className="h-5 w-5 text-primary" />
                </div>
                <div className="text-sm space-y-1">
                  <p><span className="text-muted-foreground">Days:</span> {schedule.watering_days}</p>
                  <p><span className="text-muted-foreground">Time:</span> {schedule.watering_time}</p>
                  <p><span className="text-muted-foreground">Daily Usage:</span> {schedule.daily_water_usage}L</p>
                </div>
              </div>
            ))}
          </div>

          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="w-full">
                <Plus className="mr-2 h-4 w-4" /> Add Schedule
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Watering Schedule</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label>Plant Name</Label>
                  <Input value={formData.plant_name} onChange={(e) => setFormData({ ...formData, plant_name: e.target.value })} required />
                </div>
                <div>
                  <Label>Watering Days</Label>
                  <Input value={formData.watering_days} onChange={(e) => setFormData({ ...formData, watering_days: e.target.value })} required placeholder="e.g., Mon, Wed, Fri" />
                </div>
                <div>
                  <Label>Watering Time</Label>
                  <Input type="time" value={formData.watering_time} onChange={(e) => setFormData({ ...formData, watering_time: e.target.value })} required />
                </div>
                <div>
                  <Label>Daily Water Usage (L)</Label>
                  <Input type="number" step="0.1" value={formData.daily_water_usage} onChange={(e) => setFormData({ ...formData, daily_water_usage: e.target.value })} required />
                </div>
                <Button type="submit" className="w-full">Add Schedule</Button>
              </form>
            </DialogContent>
          </Dialog>
        </GlassCard>
      </div>
    </div>
  );
}
