import { useState } from 'react';
import { GlassCard } from '@/components/common/GlassCard';
import { Badge } from '@/components/ui/badge';
import { Cloud, CloudRain, Sun, Wind, Droplets } from 'lucide-react';

export default function Weather() {
  const [currentWeather] = useState({
    temperature: 28,
    humidity: 65,
    rainfall: 0,
    windSpeed: 12,
    condition: 'Partly Cloudy',
  });

  const [forecast] = useState([
    { day: 'Monday', temp: 30, condition: 'Sunny', rainfall: 0 },
    { day: 'Tuesday', temp: 29, condition: 'Partly Cloudy', rainfall: 0 },
    { day: 'Wednesday', temp: 26, condition: 'Rainy', rainfall: 15 },
    { day: 'Thursday', temp: 27, condition: 'Cloudy', rainfall: 5 },
    { day: 'Friday', temp: 31, condition: 'Sunny', rainfall: 0 },
  ]);

  const getWeatherIcon = (condition: string) => {
    if (condition.includes('Rain')) return <CloudRain className="h-12 w-12 text-blue-500" />;
    if (condition.includes('Sunny')) return <Sun className="h-12 w-12 text-yellow-500" />;
    if (condition.includes('Cloud')) return <Cloud className="h-12 w-12 text-gray-500" />;
    return <Cloud className="h-12 w-12 text-gray-500" />;
  };

  return (
    <div className="p-6 space-y-6">
      <div className="gradient-animate rounded-lg p-8 text-white">
        <h1 className="text-3xl font-bold mb-2">Weather Module</h1>
        <p className="text-white/90">Monitor weather conditions for your farm</p>
      </div>

      <GlassCard title="Current Weather" description="Real-time conditions">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="text-center">
            {getWeatherIcon(currentWeather.condition)}
            <p className="text-3xl font-bold mt-2">{currentWeather.temperature}°C</p>
            <p className="text-sm text-muted-foreground">{currentWeather.condition}</p>
          </div>
          <div className="text-center">
            <Droplets className="h-12 w-12 mx-auto text-blue-500" />
            <p className="text-3xl font-bold mt-2">{currentWeather.humidity}%</p>
            <p className="text-sm text-muted-foreground">Humidity</p>
          </div>
          <div className="text-center">
            <CloudRain className="h-12 w-12 mx-auto text-blue-600" />
            <p className="text-3xl font-bold mt-2">{currentWeather.rainfall}mm</p>
            <p className="text-sm text-muted-foreground">Rainfall</p>
          </div>
          <div className="text-center">
            <Wind className="h-12 w-12 mx-auto text-gray-500" />
            <p className="text-3xl font-bold mt-2">{currentWeather.windSpeed} km/h</p>
            <p className="text-sm text-muted-foreground">Wind Speed</p>
          </div>
        </div>
      </GlassCard>

      <GlassCard title="5-Day Forecast" description="Weather predictions">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {forecast.map((day, index) => (
            <div key={index} className="p-4 bg-accent rounded-lg text-center hover-lift">
              <p className="font-semibold mb-2">{day.day}</p>
              {getWeatherIcon(day.condition)}
              <p className="text-2xl font-bold mt-2">{day.temp}°C</p>
              <p className="text-sm text-muted-foreground mt-1">{day.condition}</p>
              {day.rainfall > 0 && (
                <Badge variant="outline" className="mt-2">
                  {day.rainfall}mm rain
                </Badge>
              )}
            </div>
          ))}
        </div>
      </GlassCard>

      {forecast.some(d => d.rainfall > 10) && (
        <GlassCard className="border-l-4 border-l-destructive">
          <div className="flex items-start gap-3">
            <CloudRain className="h-5 w-5 text-destructive mt-0.5" />
            <div>
              <h3 className="font-semibold mb-2">Weather Warning</h3>
              <p className="text-sm">Heavy rainfall expected this week. Consider adjusting irrigation schedules and protecting sensitive crops.</p>
            </div>
          </div>
        </GlassCard>
      )}
    </div>
  );
}