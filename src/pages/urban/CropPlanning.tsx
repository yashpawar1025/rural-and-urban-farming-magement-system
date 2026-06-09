import { useState } from 'react';
import { GlassCard } from '@/components/common/GlassCard';
import { SeasonalHero } from '@/components/common/SeasonalHero';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/db/supabase';
import { toast } from 'sonner';
import { Loader2, Sprout } from 'lucide-react';

const DEMO_RECOMMENDATIONS = [
  {
    name: 'Tomatoes',
    description: 'Great for beginners, productive and versatile',
    expected_yield_per_sqm: 5,
    care_difficulty: 'Easy',
  },
  {
    name: 'Lettuce',
    description: 'Fast-growing leafy green, perfect for small spaces',
    expected_yield_per_sqm: 3,
    care_difficulty: 'Easy',
  },
  {
    name: 'Herbs (Basil, Mint)',
    description: 'Aromatic herbs for cooking, require minimal care',
    expected_yield_per_sqm: 2,
    care_difficulty: 'Easy',
  },
  {
    name: 'Bell Peppers',
    description: 'Colorful and nutritious, moderate care needed',
    expected_yield_per_sqm: 4,
    care_difficulty: 'Medium',
  },
  {
    name: 'Zucchini',
    description: 'Prolific producer, grows well in warm seasons',
    expected_yield_per_sqm: 6,
    care_difficulty: 'Medium',
  },
];

export default function CropPlanning() {
  const [loading, setLoading] = useState(false);
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    location: '',
    season: '',
    soil_type: '',
    available_space: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      try {
        const { data, error } = await supabase.functions.invoke('crops-recommend', {
          body: {
            location: formData.location,
            season: formData.season,
            soil_type: formData.soil_type,
            available_space: Number(formData.available_space),
          },
        });

        if (error) {
          console.error('Edge Function error:', error);
          throw error;
        }

        if (!data?.recommended_crops) {
          throw new Error('No recommendations from Edge Function');
        }

        setRecommendations(data.recommended_crops || []);
        toast.success('Recommendations generated successfully');
      } catch (edgeFunctionError: any) {
        console.error('Edge Function failed:', edgeFunctionError);

        // Check if this is an Edge Function deployment/connection error
        const isEdgeFunctionError = 
          edgeFunctionError?.message?.includes('Failed to send a request') ||
          edgeFunctionError?.message?.includes('Edge Function') ||
          edgeFunctionError?.code === 'FUNCTION_NOT_FOUND' ||
          edgeFunctionError?.status === 404;

        if (isEdgeFunctionError) {
          // Fallback to demo recommendations when Edge Function is not available
          console.warn('Edge Function unavailable, using demo recommendations');
          setRecommendations(DEMO_RECOMMENDATIONS);
          toast.warning('Using demo recommendations (Edge Function unavailable)');
        } else {
          // Re-throw non-Edge-Function errors
          throw edgeFunctionError;
        }
      }
    } catch (error: any) {
      toast.error(error?.message || 'Failed to get recommendations');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <SeasonalHero
        pageKey="cropPlanning"
        title="Crop Planning"
        description="AI-powered crop recommendations for your space"
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <GlassCard title="Plan Your Garden" description="Enter your details">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label>Location (City/Region)</Label>
              <Input
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                required
                placeholder="e.g., San Francisco"
              />
            </div>
            <div>
              <Label>Season</Label>
              <Select value={formData.season} onValueChange={(value) => setFormData({ ...formData, season: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select season" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Spring">Spring</SelectItem>
                  <SelectItem value="Summer">Summer</SelectItem>
                  <SelectItem value="Fall">Fall</SelectItem>
                  <SelectItem value="Winter">Winter</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Soil Type</Label>
              <Select value={formData.soil_type} onValueChange={(value) => setFormData({ ...formData, soil_type: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select soil type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Loamy">Loamy</SelectItem>
                  <SelectItem value="Sandy">Sandy</SelectItem>
                  <SelectItem value="Clay">Clay</SelectItem>
                  <SelectItem value="Silty">Silty</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Available Space (sqm)</Label>
              <Input
                type="number"
                step="0.1"
                value={formData.available_space}
                onChange={(e) => setFormData({ ...formData, available_space: e.target.value })}
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generating...</> : 'Get Recommendations'}
            </Button>
          </form>
        </GlassCard>

        <div className="lg:col-span-2">
          <GlassCard title="Recommended Crops" description="Best options for your garden">
            {recommendations.length > 0 ? (
              <div className="space-y-4">
                {recommendations.map((crop, index) => (
                  <div key={index} className="p-4 bg-accent rounded-lg hover-lift">
                    <div className="flex items-start gap-4">
                      <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <Sprout className="h-6 w-6 text-primary" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg mb-1">{crop.name}</h3>
                        <p className="text-sm text-muted-foreground mb-2">{crop.description}</p>
                        <div className="flex flex-wrap gap-3 text-sm">
                          <div>
                            <span className="text-muted-foreground">Expected Yield:</span>{' '}
                            <span className="font-medium">{crop.expected_yield_per_sqm} kg/sqm</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Difficulty:</span>{' '}
                            <span className={`font-medium ${crop.care_difficulty === 'Easy' ? 'text-green-600' : crop.care_difficulty === 'Medium' ? 'text-yellow-600' : 'text-red-600'}`}>
                              {crop.care_difficulty}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <Sprout className="h-16 w-16 mx-auto mb-4 opacity-50" />
                <p>Enter your details to get personalized crop recommendations</p>
              </div>
            )}
          </GlassCard>
        </div>
      </div>
    </div>
  );
}
