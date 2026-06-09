import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { GlassCard } from '@/components/common/GlassCard';
import { getCropEncyclopedia, createCrop } from '@/db/api';
import { isSupabaseConfigured } from '@/db/supabase';
import type { CropEncyclopedia as CropEncyclopediaType } from '@/types/types';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertTriangle, ArrowUpDown, Grid3X3, List, Search, Sparkles, Sprout, Wheat, Plus, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const fallbackCrops: CropEncyclopediaType[] = [
  {
    id: 'fallback-wheat',
    name: 'Wheat',
    image_url: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=400',
    soil_type: 'Loamy',
    growing_season: 'Winter/Spring',
    expected_yield: '3-4 tons/hectare',
    recommended_fertilizers: 'NPK 20-20-20, Urea',
    description: 'Staple cereal crop that thrives in moderate temperatures and fertile soil.',
    created_at: new Date().toISOString(),
  },
  {
    id: 'fallback-rice',
    name: 'Rice',
    image_url: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400',
    soil_type: 'Clay',
    growing_season: 'Summer/Monsoon',
    expected_yield: '4-5 tons/hectare',
    recommended_fertilizers: 'NPK 15-15-15, Organic compost',
    description: 'Water-loving crop that performs best under warm, humid conditions.',
    created_at: new Date().toISOString(),
  },
  {
    id: 'fallback-corn',
    name: 'Corn',
    image_url: 'https://images.unsplash.com/photo-1551754655-cd27e38d2076?w=400',
    soil_type: 'Sandy Loam',
    growing_season: 'Spring/Summer',
    expected_yield: '8-10 tons/hectare',
    recommended_fertilizers: 'NPK 18-46-0, Potash',
    description: 'High-demand crop with strong yields under good moisture management.',
    created_at: new Date().toISOString(),
  },
  {
    id: 'fallback-tomato',
    name: 'Tomato',
    image_url: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=400',
    soil_type: 'Loamy',
    growing_season: 'Spring/Summer',
    expected_yield: '50-60 tons/hectare',
    recommended_fertilizers: 'NPK 10-10-10, Calcium nitrate',
    description: 'Popular horticulture crop requiring regular feeding and support.',
    created_at: new Date().toISOString(),
  },
  {
    id: 'fallback-potato',
    name: 'Potato',
    image_url: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=400',
    soil_type: 'Sandy Loam',
    growing_season: 'Spring/Fall',
    expected_yield: '20-25 tons/hectare',
    recommended_fertilizers: 'NPK 5-10-10, Sulfur',
    description: 'Cool-season crop that performs well in loose, drained soils.',
    created_at: new Date().toISOString(),
  },
  {
    id: 'fallback-lettuce',
    name: 'Lettuce',
    image_url: 'https://images.unsplash.com/photo-1622206151226-18ca2c9ab4a1?w=400',
    soil_type: 'Loamy',
    growing_season: 'Spring/Fall',
    expected_yield: '15-20 tons/hectare',
    recommended_fertilizers: 'NPK 10-5-5, Fish emulsion',
    description: 'Fast-growing leafy crop suited for protected and urban cultivation.',
    created_at: new Date().toISOString(),
  },
];

export default function CropEncyclopedia() {
  const { user } = useAuth();
  const [crops, setCrops] = useState<CropEncyclopediaType[]>([]);
  const [filteredCrops, setFilteredCrops] = useState<CropEncyclopediaType[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [seasonFilter, setSeasonFilter] = useState('all');
  const [soilFilter, setSoilFilter] = useState('all');
  const [yieldFilter, setYieldFilter] = useState('all');
  const [sortBy, setSortBy] = useState<'name-asc' | 'name-desc' | 'season' | 'soil' | 'yield'>('name-asc');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedCrop, setSelectedCrop] = useState<CropEncyclopediaType | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [addingCropId, setAddingCropId] = useState<string | null>(null);

  const featuredCrop = useMemo(() => {
    if (!crops.length) return null;
    return [...crops].sort((a, b) => a.name.localeCompare(b.name))[0];
  }, [crops]);

  const availableSoils = useMemo(() => {
    return Array.from(new Set(crops.map((crop) => crop.soil_type).filter(Boolean))).sort((a, b) => a.localeCompare(b));
  }, [crops]);

  const seasonClass = (season: string) => {
    const value = season.toLowerCase();
    if (value.includes('spring')) return 'bg-emerald-100 text-emerald-800 border-emerald-200';
    if (value.includes('summer')) return 'bg-amber-100 text-amber-800 border-amber-200';
    if (value.includes('fall') || value.includes('autumn')) return 'bg-orange-100 text-orange-800 border-orange-200';
    if (value.includes('winter')) return 'bg-sky-100 text-sky-800 border-sky-200';
    return 'bg-slate-100 text-slate-700 border-slate-200';
  };

  const safeImage = (url: string | null, large = false) =>
    url || `https://via.placeholder.com/${large ? '800x420' : '420x220'}?text=Crop+Image`;

  const handleAddToFarm = async (crop: CropEncyclopediaType) => {
    if (!user) {
      toast.error('Please log in to add crops to your farm');
      return;
    }

    setAddingCropId(crop.id);
    try {
      // Extract numeric yield if possible
      let numericYield: number | null = null;
      if (crop.expected_yield) {
        const match = crop.expected_yield.match(/(\d+(?:\.\d+)?)/);
        if (match) {
          numericYield = parseFloat(match[1]);
        }
      }

      const cropData = {
        owner_id: user.id,
        name: crop.name,
        variety: crop.name,
        field_assigned: null as any,
        planting_date: new Date().toISOString().split('T')[0],
        expected_harvest_date: null as any, // Use null instead of empty string for date fields
        growth_stage: 'seedling' as const,
        expected_yield: numericYield,
        image_url: crop.image_url || null,
        notes: `Added from encyclopedia. Soil: ${crop.soil_type}. Season: ${crop.growing_season}. Fertilizers: ${crop.recommended_fertilizers}. ${crop.description || ''}`,
      };

      console.log('Adding crop with data:', cropData);

      await createCrop(cropData);
      toast.success(`"${crop.name}" added to your Crops Management!`, {
        description: 'You can now manage this crop in your farm records.',
      });
      setSelectedCrop(null);
    } catch (error: any) {
      console.error('Failed to add crop:', error);
      
      // Show detailed error message
      let errorMessage = 'Failed to add crop to farm';
      let errorDescription = 'Please try again or check your connection.';

      if (error?.message) {
        errorDescription = error.message;
      }

      // Check if it's a Supabase error
      if (error?.code) {
        if (error.code === '42P01') {
          errorDescription = 'Database table not found. Please ensure database migrations are run in Supabase.';
        } else if (error.code === 'PGRST301') {
          errorDescription = 'Permission denied. Please check your login status.';
        } else if (error.code === '23502') {
          errorDescription = 'Missing required fields. Please contact support.';
        } else {
          errorDescription = `Error: ${error.code} - ${error.message}`;
        }
      }

      toast.error(errorMessage, {
        description: errorDescription,
      });
    } finally {
      setAddingCropId(null);
    }
  };

  useEffect(() => {
    const loadCrops = async () => {
      try {
        if (!isSupabaseConfigured) {
          setCrops(fallbackCrops);
          setFilteredCrops(fallbackCrops);
          setLoadError('Live backend is unavailable. Showing local crop reference data.');
          return;
        }

        const data = await getCropEncyclopedia();
        setCrops(data);
        setFilteredCrops(data);
        setLoadError(null);
      } catch (error) {
        console.error('Failed to load crop encyclopedia:', error);
        setCrops(fallbackCrops);
        setFilteredCrops(fallbackCrops);
        setLoadError('Could not load live crop data. Showing fallback reference data.');
      } finally {
        setLoading(false);
      }
    };

    loadCrops();
  }, []);

  useEffect(() => {
    let filtered = [...crops];

    if (searchTerm) {
      filtered = filtered.filter((crop) =>
        crop.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (seasonFilter !== 'all') {
      filtered = filtered.filter((crop) =>
        crop.growing_season.toLowerCase().includes(seasonFilter.toLowerCase())
      );
    }

    if (soilFilter !== 'all') {
      filtered = filtered.filter((crop) =>
        crop.soil_type.toLowerCase() === soilFilter.toLowerCase()
      );
    }

    if (yieldFilter !== 'all') {
      filtered = filtered.filter((crop) => {
        const yield_num = parseInt(crop.expected_yield);
        if (yieldFilter === 'high') return yield_num >= 50;
        if (yieldFilter === 'medium') return yield_num >= 20 && yield_num < 50;
        if (yieldFilter === 'low') return yield_num < 20;
        return true;
      });
    }

    if (sortBy === 'name-asc') {
      filtered.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortBy === 'name-desc') {
      filtered.sort((a, b) => b.name.localeCompare(a.name));
    } else if (sortBy === 'season') {
      filtered.sort((a, b) => a.growing_season.localeCompare(b.growing_season));
    } else if (sortBy === 'soil') {
      filtered.sort((a, b) => a.soil_type.localeCompare(b.soil_type));
    } else if (sortBy === 'yield') {
      filtered.sort((a, b) => parseInt(b.expected_yield) - parseInt(a.expected_yield));
    }

    setFilteredCrops(filtered);
  }, [searchTerm, seasonFilter, soilFilter, yieldFilter, sortBy, crops]);

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <Skeleton className="h-32 w-full bg-muted" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-64 bg-muted" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-700 via-emerald-600 to-lime-500 p-8 text-white shadow-xl shadow-emerald-700/20">
        <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
        <div className="absolute -bottom-12 left-1/3 h-44 w-44 rounded-full bg-lime-200/20 blur-2xl" />
        <div className="relative z-10 grid gap-6 md:grid-cols-[1fr_auto] md:items-end">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs uppercase tracking-[0.16em]">
              <Sparkles className="h-3.5 w-3.5" />
              Crop Knowledge Hub
            </div>
            <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">Crop Encyclopedia</h1>
            <p className="mt-2 max-w-2xl text-sm text-white/90 md:text-base">
              Discover crop profiles, seasonal suitability, and soil compatibility for better planning decisions.
            </p>
          </div>
          <div className="grid grid-cols-3 gap-3 text-center text-sm">
            <div className="rounded-2xl bg-white/15 px-4 py-3 backdrop-blur-md">
              <p className="text-xl font-semibold">{crops.length}</p>
              <p className="text-xs text-white/80">Crops</p>
            </div>
            <div className="rounded-2xl bg-white/15 px-4 py-3 backdrop-blur-md">
              <p className="text-xl font-semibold">{availableSoils.length}</p>
              <p className="text-xs text-white/80">Soils</p>
            </div>
            <div className="rounded-2xl bg-white/15 px-4 py-3 backdrop-blur-md">
              <p className="text-xl font-semibold">{filteredCrops.length}</p>
              <p className="text-xs text-white/80">Results</p>
            </div>
          </div>
        </div>
      </div>

      {featuredCrop && (
        <GlassCard>
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="space-y-2">
              <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Featured Crop</p>
              <h2 className="text-2xl font-semibold text-slate-900">{featuredCrop.name}</h2>
              <p className="max-w-3xl text-sm text-muted-foreground">{featuredCrop.description || 'High-potential crop with balanced seasonal performance.'}</p>
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline" className={seasonClass(featuredCrop.growing_season)}>{featuredCrop.growing_season}</Badge>
                <Badge variant="outline">{featuredCrop.soil_type}</Badge>
                <Badge variant="outline">Yield: {featuredCrop.expected_yield}</Badge>
              </div>
            </div>
            <Button onClick={() => setSelectedCrop(featuredCrop)} className="rounded-xl">View details</Button>
          </div>
        </GlassCard>
      )}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <GlassCard>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Most Common Season</p>
              <p className="text-xl font-semibold">Spring / Summer</p>
            </div>
            <Sprout className="h-5 w-5 text-emerald-600" />
          </div>
        </GlassCard>
        <GlassCard>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Top Soil Match</p>
              <p className="text-xl font-semibold">Loamy</p>
            </div>
            <Wheat className="h-5 w-5 text-amber-600" />
          </div>
        </GlassCard>
        <GlassCard>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Filter Coverage</p>
              <p className="text-xl font-semibold">{filteredCrops.length}/{crops.length}</p>
            </div>
            <ArrowUpDown className="h-5 w-5 text-sky-600" />
          </div>
        </GlassCard>
      </div>

      {/* Filters */}
      <GlassCard>
        {loadError && (
          <div className="mb-4 flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{loadError}</span>
          </div>
        )}

        <div className="grid grid-cols-1 gap-4 md:grid-cols-5">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search crops..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={seasonFilter} onValueChange={setSeasonFilter}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Filter by season" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Seasons</SelectItem>
              <SelectItem value="spring">Spring</SelectItem>
              <SelectItem value="summer">Summer</SelectItem>
              <SelectItem value="fall">Fall</SelectItem>
              <SelectItem value="winter">Winter</SelectItem>
            </SelectContent>
          </Select>

          <Select value={soilFilter} onValueChange={setSoilFilter}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Filter by soil" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Soils</SelectItem>
              {availableSoils.map((soil) => (
                <SelectItem key={soil} value={soil}>{soil}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={yieldFilter} onValueChange={setYieldFilter}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Filter by yield" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Yields</SelectItem>
              <SelectItem value="high">High (50+ tons/ha)</SelectItem>
              <SelectItem value="medium">Medium (20-50 tons/ha)</SelectItem>
              <SelectItem value="low">Low (&lt;20 tons/ha)</SelectItem>
            </SelectContent>
          </Select>

          <Select value={sortBy} onValueChange={(value) => setSortBy(value as typeof sortBy)}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="name-asc">Name A-Z</SelectItem>
              <SelectItem value="name-desc">Name Z-A</SelectItem>
              <SelectItem value="season">Season</SelectItem>
              <SelectItem value="soil">Soil Type</SelectItem>
              <SelectItem value="yield">Yield (High to Low)</SelectItem>
            </SelectContent>
          </Select>

          <div className="flex items-center gap-2 justify-end">
            <Button variant={viewMode === 'grid' ? 'default' : 'outline'} size="icon" onClick={() => setViewMode('grid')} aria-label="Grid view">
              <Grid3X3 className="h-4 w-4" />
            </Button>
            <Button variant={viewMode === 'list' ? 'default' : 'outline'} size="icon" onClick={() => setViewMode('list')} aria-label="List view">
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </GlassCard>

      {/* Crop Grid */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
          {filteredCrops.map((crop) => (
            <div key={crop.id} className="hover-lift">
              <GlassCard>
                <div className="space-y-4">
                  <img
                    src={safeImage(crop.image_url)}
                    alt={crop.name}
                    onError={(event) => {
                      event.currentTarget.src = safeImage(null);
                    }}
                    className="h-52 w-full rounded-xl object-cover"
                  />
                  <div>
                    <div className="mb-2 flex items-start justify-between gap-3">
                      <h3 className="text-lg font-semibold text-slate-900">{crop.name}</h3>
                      <Badge variant="outline" className={seasonClass(crop.growing_season)}>{crop.growing_season}</Badge>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Soil Type:</span>
                        <Badge variant="outline">{crop.soil_type}</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Expected Yield:</span>
                        <span className="font-medium">{crop.expected_yield}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2 pt-2">
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={() => setSelectedCrop(crop)}
                    >
                      View Details
                    </Button>
                    <Button
                      className="flex-1"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAddToFarm(crop);
                      }}
                      disabled={addingCropId === crop.id}
                    >
                      {addingCropId === crop.id ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Adding...
                        </>
                      ) : (
                        <>
                          <Plus className="mr-2 h-4 w-4" />
                          Add to Farm
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </GlassCard>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredCrops.map((crop) => (
            <div key={crop.id} onClick={() => setSelectedCrop(crop)} className="cursor-pointer rounded-2xl border border-border bg-white p-4 shadow-sm transition-all duration-300 hover:border-emerald-300 hover:shadow-md">
              <div className="flex flex-col gap-4 md:flex-row">
                <img
                  src={safeImage(crop.image_url)}
                  alt={crop.name}
                  onError={(event) => {
                    event.currentTarget.src = safeImage(null);
                  }}
                  className="h-36 w-full rounded-xl object-cover md:w-56"
                />
                <div className="flex-1">
                  <div className="mb-2 flex flex-wrap items-center gap-2">
                    <h3 className="text-xl font-semibold text-slate-900">{crop.name}</h3>
                    <Badge variant="outline" className={seasonClass(crop.growing_season)}>{crop.growing_season}</Badge>
                  </div>
                  <p className="mb-3 line-clamp-2 text-sm text-muted-foreground">{crop.description || 'No description available for this crop yet.'}</p>
                  <div className="grid grid-cols-1 gap-2 text-sm md:grid-cols-3">
                    <div>
                      <p className="text-muted-foreground">Soil</p>
                      <p className="font-medium">{crop.soil_type}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Yield</p>
                      <p className="font-medium">{crop.expected_yield}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Fertilizers</p>
                      <p className="font-medium line-clamp-1">{crop.recommended_fertilizers || 'N/A'}</p>
                    </div>
                  </div>
                  <div className="flex gap-2 pt-3 mt-3 border-t">
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={() => setSelectedCrop(crop)}
                    >
                      View Details
                    </Button>
                    <Button
                      className="flex-1"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAddToFarm(crop);
                      }}
                      disabled={addingCropId === crop.id}
                    >
                      {addingCropId === crop.id ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Adding...
                        </>
                      ) : (
                        <>
                          <Plus className="mr-2 h-4 w-4" />
                          Add to Farm
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {filteredCrops.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <p>No crops found matching your criteria</p>
        </div>
      )}

      {/* Detail Modal */}
      <Dialog open={!!selectedCrop} onOpenChange={() => setSelectedCrop(null)}>
        <DialogContent className="max-w-2xl">
          {selectedCrop && (
            <>
              <DialogHeader>
                <DialogTitle>{selectedCrop.name}</DialogTitle>
                <DialogDescription>Complete crop information</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <img
                  src={safeImage(selectedCrop.image_url, true)}
                  alt={selectedCrop.name}
                  onError={(event) => {
                    event.currentTarget.src = safeImage(null, true);
                  }}
                  className="w-full h-64 object-cover rounded-xl"
                />
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline" className={seasonClass(selectedCrop.growing_season)}>{selectedCrop.growing_season}</Badge>
                  <Badge variant="outline">{selectedCrop.soil_type}</Badge>
                  <Badge variant="outline">Yield: {selectedCrop.expected_yield}</Badge>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Soil Type</p>
                    <p className="font-medium">{selectedCrop.soil_type}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Growing Season</p>
                    <p className="font-medium">{selectedCrop.growing_season}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Expected Yield</p>
                    <p className="font-medium">{selectedCrop.expected_yield}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Fertilizers</p>
                    <p className="font-medium">{selectedCrop.recommended_fertilizers || 'N/A'}</p>
                  </div>
                </div>
                {selectedCrop.description && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Description</p>
                    <p className="text-sm">{selectedCrop.description}</p>
                  </div>
                )}
                <div className="flex gap-3 pt-6 border-t mt-6">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => setSelectedCrop(null)}
                  >
                    Close
                  </Button>
                  <Button
                    className="flex-1 bg-emerald-600 hover:bg-emerald-700"
                    onClick={() => {
                      handleAddToFarm(selectedCrop);
                    }}
                    disabled={addingCropId === selectedCrop.id}
                  >
                    {addingCropId === selectedCrop.id ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Adding to Farm...
                      </>
                    ) : (
                      <>
                        <Plus className="mr-2 h-4 w-4" />
                        Add to My Farm
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
