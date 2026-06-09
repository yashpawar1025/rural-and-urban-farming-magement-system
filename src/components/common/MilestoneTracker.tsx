import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2 } from 'lucide-react';

interface Milestone {
  id: string;
  title: string;
  date: string;
  icon?: string;
}

interface MilestoneTrackerProps {
  milestones: Milestone[];
}

/**
 * Milestone Tracker Component
 * Displays recent farm/garden milestones in a horizontal timeline
 * Minimal aesthetic: clean, spacious, subtle colors
 */
export function MilestoneTracker({ milestones }: MilestoneTrackerProps) {
  if (milestones.length === 0) {
    return null;
  }

  return (
    <Card className="card-minimal border-border/50">
      <CardHeader>
        <CardTitle className="text-lg font-normal">Recent Milestones</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex gap-4 overflow-x-auto pb-2">
          {milestones.map((milestone, index) => (
            <div
              key={milestone.id}
              className="flex-shrink-0 flex items-center gap-3 p-4 rounded-lg bg-accent/30 min-w-[240px]"
            >
              {/* Icon */}
              <div className="flex-shrink-0">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  {milestone.icon ? (
                    <span className="text-xl">{milestone.icon}</span>
                  ) : (
                    <CheckCircle2 className="w-5 h-5 text-primary" />
                  )}
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{milestone.title}</p>
                <p className="text-xs text-muted-foreground">{milestone.date}</p>
              </div>

              {/* Badge */}
              <Badge variant="secondary" className="flex-shrink-0 text-xs">
                {index === 0 ? 'Latest' : 'Done'}
              </Badge>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}