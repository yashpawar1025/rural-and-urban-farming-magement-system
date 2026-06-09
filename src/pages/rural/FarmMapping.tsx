import { useState } from 'react';
import { GlassCard } from '@/components/common/GlassCard';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';

export default function FarmMapping() {
  const [selectedCrop, setSelectedCrop] = useState<Record<string, string>>({});
  const crops = ['Wheat', 'Corn', 'Rice', 'Soybeans', 'Cotton', 'Vegetables', 'Fallow'];
  const gridSize = 6;

  const getCropColor = (crop: string) => {
    const colors: Record<string, string> = {
      'Wheat': 'bg-yellow-200',
      'Corn': 'bg-yellow-400',
      'Rice': 'bg-green-300',
      'Soybeans': 'bg-green-500',
      'Cotton': 'bg-white',
      'Vegetables': 'bg-green-600',
      'Fallow': 'bg-gray-300',
    };
    return colors[crop] || 'bg-gray-200';
  };

  const handleCellClick = (row: number, col: number, crop: string) => {
    const key = `${row}-${col}`;
    setSelectedCrop({ ...selectedCrop, [key]: crop });
  };

  return (
    <div className="p-6 space-y-6">
      <div className="gradient-animate rounded-lg p-8 text-white">
        <h1 className="text-3xl font-bold mb-2">Farm Mapping</h1>
        <p className="text-white/90">Visual field management and crop assignment</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3">
          <GlassCard title="Field Map" description="Click a plot to assign a crop">
            <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${gridSize}, 1fr)` }}>
              {Array.from({ length: gridSize * gridSize }).map((_, index) => {
                const row = Math.floor(index / gridSize);
                const col = index % gridSize;
                const key = `${row}-${col}`;
                const crop = selectedCrop[key] || 'Fallow';
                return (
                  <div key={key} className="relative group">
                    <div className={`aspect-square ${getCropColor(crop)} border-2 border-border rounded-lg cursor-pointer hover:opacity-80 transition-smooth flex items-center justify-center`}>
                      <span className="text-xs font-semibold opacity-0 group-hover:opacity-100">{crop}</span>
                    </div>
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-smooth">
                      <Select value={crop} onValueChange={(value) => handleCellClick(row, col, value)}>
                        <SelectTrigger className="h-full w-full opacity-0">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {crops.map((c) => (
                            <SelectItem key={c} value={c}>{c}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                );
              })}
            </div>
          </GlassCard>
        </div>

        <div>
          <GlassCard title="Legend" description="Crop types">
            <div className="space-y-2">
              {crops.map((crop) => (
                <div key={crop} className="flex items-center gap-3">
                  <div className={`h-6 w-6 ${getCropColor(crop)} border-2 border-border rounded`} />
                  <span className="text-sm">{crop}</span>
                </div>
              ))}
            </div>
          </GlassCard>

          <GlassCard title="Field Statistics" description="Current allocation" className="mt-6">
            <div className="space-y-2">
              {crops.map((crop) => {
                const count = Object.values(selectedCrop).filter(c => c === crop).length;
                if (count === 0 && crop !== 'Fallow') return null;
                return (
                  <div key={crop} className="flex items-center justify-between">
                    <span className="text-sm">{crop}</span>
                    <Badge variant="outline">{count} plots</Badge>
                  </div>
                );
              })}
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}