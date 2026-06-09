import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface CircularProgressProps {
  value: number; // 0-100
  size?: number;
  strokeWidth?: number;
  label: string;
  description?: string;
}

/**
 * Circular Progress Component
 * Displays a score as an animated circular progress bar
 * Minimal aesthetic: clean, subtle colors, smooth animation
 */
export function CircularProgress({ 
  value, 
  size = 120, 
  strokeWidth = 8, 
  label,
  description 
}: CircularProgressProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (value / 100) * circumference;

  const getColor = () => {
    if (value >= 80) return 'hsl(142, 35%, 40%)'; // primary
    if (value >= 60) return 'hsl(142, 30%, 65%)'; // secondary
    if (value >= 40) return 'hsl(45, 80%, 60%)'; // warning
    return 'hsl(0, 50%, 55%)'; // destructive
  };

  return (
    <Card className="card-minimal border-border/50">
      <CardHeader>
        <CardTitle className="text-lg font-normal">{label}</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col items-center space-y-4">
        {/* Circular Progress SVG */}
        <div className="relative" style={{ width: size, height: size }}>
          {/* Background Circle */}
          <svg className="transform -rotate-90" width={size} height={size}>
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke="hsl(var(--muted))"
              strokeWidth={strokeWidth}
              fill="none"
            />
            {/* Progress Circle */}
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke={getColor()}
              strokeWidth={strokeWidth}
              fill="none"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              strokeLinecap="round"
              style={{
                transition: 'stroke-dashoffset 1s ease-in-out, stroke 0.3s ease',
              }}
            />
          </svg>
          {/* Center Value */}
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-3xl font-light tracking-tight">{value}</span>
          </div>
        </div>

        {/* Description */}
        {description && (
          <p className="text-sm text-muted-foreground text-center">{description}</p>
        )}
      </CardContent>
    </Card>
  );
}