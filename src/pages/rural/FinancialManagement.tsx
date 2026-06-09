import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { GlassCard } from '@/components/common/GlassCard';
import { SeasonalHero } from '@/components/common/SeasonalHero';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { getFinancialRecords, createFinancialRecord } from '@/db/api';
import { exportFinancialRecordsToCSV } from '@/lib/csvExport';
import type { FinancialRecord } from '@/types/types';
import { toast } from 'sonner';
import { Plus, TrendingUp, TrendingDown, Download, PieChart as PieChartIcon } from 'lucide-react';
import { Bar, Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement } from 'chart.js';

ChartJS.register(ArcElement);

export default function FinancialManagement() {
  const { user } = useAuth();
  const [records, setRecords] = useState<FinancialRecord[]>([]);
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    record_type: 'income' as 'income' | 'expense',
    amount: '',
    category: '',
    description: '',
    record_date: new Date().toISOString().split('T')[0],
  });

  useEffect(() => {
    if (user) {
      getFinancialRecords(user.id).then(setRecords);
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      await createFinancialRecord({
        owner_id: user.id,
        ...formData,
        amount: Number(formData.amount),
      });
      toast.success('Record added successfully');
      setOpen(false);
      setFormData({ record_type: 'income', amount: '', category: '', description: '', record_date: new Date().toISOString().split('T')[0] });
      getFinancialRecords(user.id).then(setRecords);
    } catch (error) {
      toast.error('Operation failed');
    }
  };

  const totalIncome = records.filter(r => r.record_type === 'income').reduce((sum, r) => sum + Number(r.amount), 0);
  const totalExpenses = records.filter(r => r.record_type === 'expense').reduce((sum, r) => sum + Number(r.amount), 0);
  const profit = totalIncome - totalExpenses;

  // Category breakdown for expenses
  const expensesByCategory = records
    .filter(r => r.record_type === 'expense')
    .reduce((acc, r) => {
      const cat = r.category || 'Uncategorized';
      acc[cat] = (acc[cat] || 0) + Number(r.amount);
      return acc;
    }, {} as Record<string, number>);

  const categoryChartData = {
    labels: Object.keys(expensesByCategory),
    datasets: [{
      data: Object.values(expensesByCategory),
      backgroundColor: [
        'hsl(var(--chart-1))',
        'hsl(var(--chart-2))',
        'hsl(var(--chart-3))',
        'hsl(var(--chart-4))',
        'hsl(var(--chart-5))',
      ],
    }],
  };

  const handleExport = () => {
    if (records.length === 0) {
      toast.error('No records to export');
      return;
    }
    try {
      exportFinancialRecordsToCSV(records);
      toast.success(`Exported ${records.length} records to CSV`);
    } catch (error) {
      toast.error('Export failed');
    }
  };

  const chartData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Profit',
        data: [2000, 3000, 2500, 4000, 3500, 5000],
        backgroundColor: 'hsl(var(--primary))',
      },
    ],
  };

  return (
    <div className="p-6 space-y-6">
      <SeasonalHero
        pageKey="financialManagement"
        title="Financial Management"
        description="Track income, expenses, and profitability"
      />

      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Financial Records</h2>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExport}>
            <Download className="mr-2 h-4 w-4" /> Export CSV
          </Button>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button><Plus className="mr-2 h-4 w-4" /> Add Record</Button>
            </DialogTrigger>
            <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Financial Record</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label>Type</Label>
                <Select value={formData.record_type} onValueChange={(value) => setFormData({ ...formData, record_type: value as 'income' | 'expense' })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="income">Income</SelectItem>
                    <SelectItem value="expense">Expense</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Amount ($)</Label>
                <Input type="number" step="0.01" value={formData.amount} onChange={(e) => setFormData({ ...formData, amount: e.target.value })} required />
              </div>
              <div>
                <Label>Category</Label>
                <Input value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} required />
              </div>
              <div>
                <Label>Description</Label>
                <Input value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
              </div>
              <div>
                <Label>Date</Label>
                <Input type="date" value={formData.record_date} onChange={(e) => setFormData({ ...formData, record_date: e.target.value })} required />
              </div>
              <Button type="submit" className="w-full">Add Record</Button>
            </form>
          </DialogContent>
        </Dialog>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <GlassCard>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Income</p>
              <p className="text-2xl font-bold text-primary">${totalIncome.toFixed(2)}</p>
            </div>
            <TrendingUp className="h-8 w-8 text-primary" />
          </div>
        </GlassCard>
        <GlassCard>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Expenses</p>
              <p className="text-2xl font-bold text-destructive">${totalExpenses.toFixed(2)}</p>
            </div>
            <TrendingDown className="h-8 w-8 text-destructive" />
          </div>
        </GlassCard>
        <GlassCard>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Net Profit</p>
              <p className={`text-2xl font-bold ${profit >= 0 ? 'text-primary' : 'text-destructive'}`}>${profit.toFixed(2)}</p>
            </div>
          </div>
        </GlassCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <GlassCard title="Monthly Profit" description="Profit trend over time">
          <Bar data={chartData} options={{ responsive: true, maintainAspectRatio: true }} />
        </GlassCard>

        {Object.keys(expensesByCategory).length > 0 && (
          <GlassCard title="Expense Breakdown" description="Expenses by category">
            <Pie data={categoryChartData} options={{ responsive: true, maintainAspectRatio: true }} />
          </GlassCard>
        )}
      </div>

      <GlassCard title="Recent Transactions" description="Latest financial records">
        <div className="space-y-2">
          {records.slice(0, 10).map((record) => (
            <div key={record.id} className="flex items-center justify-between p-3 bg-accent rounded-lg">
              <div>
                <p className="font-medium">{record.category}</p>
                <p className="text-sm text-muted-foreground">{record.description || 'No description'}</p>
                <p className="text-xs text-muted-foreground">{record.record_date}</p>
              </div>
              <p className={`font-bold ${record.record_type === 'income' ? 'text-primary' : 'text-destructive'}`}>
                {record.record_type === 'income' ? '+' : '-'}${Number(record.amount).toFixed(2)}
              </p>
            </div>
          ))}
        </div>
      </GlassCard>
    </div>
  );
}
