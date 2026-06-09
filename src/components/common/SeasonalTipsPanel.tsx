import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Lightbulb } from 'lucide-react';

interface SeasonalTip {
  id: string;
  tip: string;
}

interface SeasonalTipsPanelProps {
  season: 'spring' | 'summer' | 'autumn' | 'winter';
  tips: SeasonalTip[];
}

/**
 * Seasonal Tips Panel Component
 * Displays farming/gardening tips relevant to the current season
 * Minimal aesthetic: clean, informative, subtle styling
 */
export function SeasonalTipsPanel({ season, tips }: SeasonalTipsPanelProps) {
  const getSeasonColor = () => {
    switch (season) {
      case 'spring':
        return 'text-green-600';
      case 'summer':
        return 'text-yellow-600';
      case 'autumn':
        return 'text-orange-600';
      case 'winter':
        return 'text-blue-600';
      default:
        return 'text-primary';
    }
  };

  const getSeasonLabel = () => {
    return season.charAt(0).toUpperCase() + season.slice(1);
  };

  return (
    <Card className="card-minimal border-border/50">
      <CardHeader>
        <CardTitle className="text-lg font-normal flex items-center gap-2">
          <Lightbulb className={`w-5 h-5 ${getSeasonColor()}`} />
          <span>{getSeasonLabel()} Tips</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {tips.map((tip) => (
            <div
              key={tip.id}
              className="flex gap-3 p-3 rounded-lg bg-accent/20 hover:bg-accent/30 transition-colors"
            >
              <div className="flex-shrink-0 w-1.5 h-1.5 rounded-full bg-primary mt-2" />
              <p className="text-sm text-foreground/80 leading-relaxed">{tip.tip}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}