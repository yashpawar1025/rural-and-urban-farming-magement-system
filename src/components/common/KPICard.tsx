import { ReactNode } from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface KPICardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  trend?: {
    value: number;
    label: string;
  };
  onClick?: () => void;
}

/**
 * KPI Card Component with Trend Indicator
 * Minimal aesthetic: clean, airy, subtle animations
 */
export function KPICard({ title, value, icon, trend, onClick }: KPICardProps) {
  const getTrendColor = () => {
    if (!trend) return '';
    if (trend.value > 0) return 'text-green-600';
    if (trend.value < 0) return 'text-red-600';
    return 'text-muted-foreground';
  };

  const getTrendIcon = () => {
    if (!trend) return null;
    if (trend.value > 0) return <TrendingUp className="w-3 h-3" />;
    if (trend.value < 0) return <TrendingDown className="w-3 h-3" />;
    return <Minus className="w-3 h-3" />;
  };

  return (
    <Card 
      className={`card-minimal border-border/50 ${onClick ? 'cursor-pointer' : ''}`}
      onClick={onClick}
    >
      <CardContent className="p-6 space-y-3">
        {/* Icon and Title */}
        <div className="flex items-center justify-between">
          <div className="p-2 rounded-lg bg-accent/30">
            {icon}
          </div>
          {trend && (
            <div className={`flex items-center gap-1 text-xs font-medium ${getTrendColor()}`}>
              {getTrendIcon()}
              <span>{Math.abs(trend.value)}%</span>
            </div>
          )}
        </div>

        {/* Value */}
        <div className="space-y-1">
          <p className="text-3xl font-light tracking-tight">{value}</p>
          <p className="text-sm text-muted-foreground font-normal">{title}</p>
        </div>

        {/* Trend Label */}
        {trend && (
          <p className="text-xs text-muted-foreground">{trend.label}</p>
        )}
      </CardContent>
    </Card>
  );
}