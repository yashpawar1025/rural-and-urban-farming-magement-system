import { GlassCard } from '@/components/common/GlassCard';
import { Badge } from '@/components/ui/badge';
import { Cloud, Sun, Droplets } from 'lucide-react';

export default function UrbanWeather() {
  const currentWeather = {
    temperature: 24,
    humidity: 70,
    uvIndex: 6,
    condition: 'Partly Cloudy',
  };

  const forecast = [
    { day: 'Today', temp: 24, condition: 'Partly Cloudy', rainfall: 0 },
    { day: 'Tomorrow', temp: 26, condition: 'Sunny', rainfall: 0 },
    { day: 'Day 3', temp: 22, condition: 'Rainy', rainfall: 12 },
  ];

  const wateringRecommendation = forecast[1].rainfall > 5 
    ? 'Skip watering tomorrow - rain expected' 
    : 'Water as scheduled - no rain expected';

  return (
    <div className="p-6 space-y-6">
      <div className="gradient-animate rounded-lg p-8 text-white">
        <h1 className="text-3xl font-bold mb-2">Weather</h1>
        <p className="text-white/90">Local weather and watering recommendations</p>
      </div>

      <GlassCard title="Current Weather" description="Local conditions">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="text-center">
            <Sun className="h-12 w-12 mx-auto text-yellow-500" />
            <p className="text-3xl font-bold mt-2">{currentWeather.temperature}°C</p>
            <p className="text-sm text-muted-foreground">{currentWeather.condition}</p>
          </div>
          <div className="text-center">
            <Droplets className="h-12 w-12 mx-auto text-blue-500" />
            <p className="text-3xl font-bold mt-2">{currentWeather.humidity}%</p>
            <p className="text-sm text-muted-foreground">Humidity</p>
          </div>
          <div className="text-center">
            <Sun className="h-12 w-12 mx-auto text-orange-500" />
            <p className="text-3xl font-bold mt-2">{currentWeather.uvIndex}</p>
            <p className="text-sm text-muted-foreground">UV Index</p>
          </div>
          <div className="text-center">
            <Cloud className="h-12 w-12 mx-auto text-gray-500" />
            <p className="text-3xl font-bold mt-2">0mm</p>
            <p className="text-sm text-muted-foreground">Rainfall</p>
          </div>
        </div>
      </GlassCard>

      <GlassCard title="3-Day Forecast" description="Weather predictions">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {forecast.map((day, index) => (
            <div key={index} className="p-4 bg-accent rounded-lg text-center hover-lift">
              <p className="font-semibold mb-2">{day.day}</p>
              {day.condition.includes('Rain') ? (
                <Droplets className="h-12 w-12 mx-auto text-blue-500" />
              ) : (
                <Sun className="h-12 w-12 mx-auto text-yellow-500" />
              )}
              <p className="text-2xl font-bold mt-2">{day.temp}°C</p>
              <p className="text-sm text-muted-foreground mt-1">{day.condition}</p>
              {day.rainfall > 0 && (
                <Badge variant="outline" className="mt-2">{day.rainfall}mm rain</Badge>
              )}
            </div>
          ))}
        </div>
      </GlassCard>

      <GlassCard title="Watering Recommendation" description="Based on weather forecast" className="border-l-4 border-l-primary">
        <div className="flex items-start gap-3">
          <Droplets className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
          <div>
            <p className="font-semibold mb-2">{wateringRecommendation}</p>
            <p className="text-sm text-muted-foreground">
              Adjust your irrigation schedule based on upcoming weather conditions to save water and optimize plant health.
            </p>
          </div>
        </div>
      </GlassCard>
    </div>
  );
}
