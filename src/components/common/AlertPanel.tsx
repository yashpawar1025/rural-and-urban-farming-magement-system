import { useEffect, useState } from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { getAlerts, markAlertAsRead } from '@/db/api';
import type { Alert as AlertType } from '@/types/types';
import { AlertCircle, Droplet, Bug, Cloud, Package, Wrench, X } from 'lucide-react';

interface AlertPanelProps {
  userId: string;
  maxHeight?: string;
}

const alertIcons = {
  low_water: <Droplet className="h-4 w-4" />,
  disease_detected: <Bug className="h-4 w-4" />,
  weather_warning: <Cloud className="h-4 w-4" />,
  low_stock: <Package className="h-4 w-4" />,
  maintenance_due: <Wrench className="h-4 w-4" />,
};

const alertVariants = {
  low_water: 'default',
  disease_detected: 'destructive',
  weather_warning: 'default',
  low_stock: 'default',
  maintenance_due: 'default',
} as const;

export function AlertPanel({ userId, maxHeight = '400px' }: AlertPanelProps) {
  const [alerts, setAlerts] = useState<AlertType[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAlerts = async () => {
    try {
      const data = await getAlerts(userId);
      setAlerts(data);
    } catch (error) {
      console.error('Failed to fetch alerts:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
  }, [userId]);

  const handleMarkAsRead = async (alertId: string) => {
    try {
      await markAlertAsRead(alertId);
      setAlerts(alerts.filter(a => a.id !== alertId));
    } catch (error) {
      console.error('Failed to mark alert as read:', error);
    }
  };

  if (loading) {
    return <div className="text-center py-4 text-muted-foreground">Loading alerts...</div>;
  }

  if (alerts.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <AlertCircle className="h-12 w-12 mx-auto mb-2 opacity-50" />
        <p>No alerts at this time</p>
      </div>
    );
  }

  return (
    <ScrollArea style={{ maxHeight }}>
      <div className="space-y-3 pr-4">
        {alerts.map((alert) => (
          <Alert key={alert.id} variant={alertVariants[alert.alert_type] as 'default' | 'destructive'} className="relative">
            <div className="flex items-start gap-3">
              <div className="mt-0.5">{alertIcons[alert.alert_type]}</div>
              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between">
                  <AlertTitle className="text-sm font-semibold">{alert.title}</AlertTitle>
                  <Badge variant="outline" className="text-xs">
                    {alert.alert_type.replace('_', ' ')}
                  </Badge>
                </div>
                <AlertDescription className="text-sm">{alert.message}</AlertDescription>
                <p className="text-xs text-muted-foreground">
                  {new Date(alert.created_at).toLocaleString()}
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 shrink-0"
                onClick={() => handleMarkAsRead(alert.id)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </Alert>
        ))}
      </div>
    </ScrollArea>
  );
}
