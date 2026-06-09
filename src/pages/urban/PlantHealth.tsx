import { useState, useEffect } from 'react';
import { GlassCard } from '@/components/common/GlassCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/db/supabase';
import { diseaseDatabase } from '@/lib/diseaseData';
import { toast } from 'sonner';
import { Loader2, Leaf, AlertCircle } from 'lucide-react';

export default function PlantHealth() {
  const [loading, setLoading] = useState(false);
  const [diagnosis, setDiagnosis] = useState<any>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [symptoms, setSymptoms] = useState<string[]>([]);
  const [plantType, setPlantType] = useState('');
  const [availablePlants, setAvailablePlants] = useState<string[]>([]);

  const symptomOptions = [
    'Yellowing leaves',
    'Wilting',
    'Brown spots',
    'Curling leaves',
    'Stunted growth',
    'White powder on leaves',
    'Holes in leaves',
    'Drooping stems',
  ];

  // Load available plant types from disease database
  useEffect(() => {
    const loadPlants = async () => {
      await diseaseDatabase.load();
      const plants = diseaseDatabase.getPlantTypes();
      setAvailablePlants(plants);
    };
    loadPlants();
  }, []);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImageFile(e.target.files[0]);
    }
  };

  const generateDemoDiagnosis = () => {
    // Try to get a diagnosis from the disease database based on inputs
    const diagnosis = diseaseDatabase.getDiagnosis(plantType || undefined, symptoms, 0.75);

    if (diagnosis) {
      return {
        disease: diagnosis.disease_name,
        confidence: diagnosis.confidence,
        treatment: diagnosis.treatment,
        prevention: diagnosis.prevention,
        severity: diagnosis.severity,
      };
    }

    // Fallback to a random disease
    const randomDisease = diseaseDatabase.getRandomDisease();
    return {
      disease: randomDisease.disease_name,
      confidence: randomDisease.confidence,
      treatment: randomDisease.treatment,
      prevention: randomDisease.prevention,
      severity: randomDisease.severity,
    };
  };

  const handleDiagnose = async () => {
    if (!imageFile && symptoms.length === 0) {
      toast.error('Please upload an image or select symptoms');
      return;
    }

    setLoading(true);
    try {
      try {
        const { data, error } = await supabase.functions.invoke('plant-predict', {
          body: { image_url: 'placeholder', symptoms },
        });

        if (error) {
          console.error('Edge Function error:', error);
          throw error;
        }

        if (!data?.disease) {
          throw new Error('No diagnosis result from Edge Function');
        }

        setDiagnosis(data);
        toast.success('Diagnosis complete');
      } catch (edgeFunctionError: any) {
        console.error('Edge Function failed:', edgeFunctionError);

        // Check if this is an Edge Function deployment/connection error
        const isEdgeFunctionError = 
          edgeFunctionError?.message?.includes('Failed to send a request') ||
          edgeFunctionError?.message?.includes('Edge Function') ||
          edgeFunctionError?.code === 'FUNCTION_NOT_FOUND' ||
          edgeFunctionError?.status === 404;

        if (isEdgeFunctionError) {
          // Fallback to disease dataset when Edge Function is not available
          console.warn('Edge Function unavailable, using disease dataset');
          setDiagnosis(generateDemoDiagnosis());
          toast.warning('Using disease dataset (Edge Function unavailable)');
        } else {
          // Re-throw non-Edge-Function errors
          throw edgeFunctionError;
        }
      }
    } catch (error: any) {
      toast.error(error?.message || 'Diagnosis failed');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleSymptom = (symptom: string) => {
    setSymptoms(prev =>
      prev.includes(symptom) ? prev.filter(s => s !== symptom) : [...prev, symptom]
    );
  };

  return (
    <div className="p-6 space-y-6">
      <div className="gradient-animate rounded-lg p-8 text-white">
        <h1 className="text-3xl font-bold mb-2">Plant Health Diagnosis</h1>
        <p className="text-white/90">AI-powered plant disease detection</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <GlassCard title="Diagnosis Input" description="Upload image or select symptoms">
          <div className="space-y-4">
            <div>
              <Label htmlFor="plant-type">Plant Type (Optional)</Label>
              <Select value={plantType} onValueChange={setPlantType}>
                <SelectTrigger id="plant-type">
                  <SelectValue placeholder="Select a plant type..." />
                </SelectTrigger>
                <SelectContent>
                  {availablePlants.length > 0 ? (
                    availablePlants.map((plant) => (
                      <SelectItem key={plant} value={plant}>
                        {plant}
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="loading" disabled>Loading plants...</SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Upload Plant Image (Optional)</Label>
              <Input type="file" accept="image/*" onChange={handleImageUpload} />
              {imageFile && (
                <p className="text-sm text-muted-foreground mt-2">
                  Selected: {imageFile.name}
                </p>
              )}
            </div>

            <div>
              <Label className="mb-3 block">Select Symptoms</Label>
              <div className="space-y-2">
                {symptomOptions.map((symptom) => (
                  <div key={symptom} className="flex items-center space-x-2">
                    <Checkbox
                      id={symptom}
                      checked={symptoms.includes(symptom)}
                      onCheckedChange={() => toggleSymptom(symptom)}
                    />
                    <label htmlFor={symptom} className="text-sm cursor-pointer">
                      {symptom}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            <Button onClick={handleDiagnose} className="w-full" disabled={loading}>
              {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Analyzing...</> : 'Diagnose Plant'}
            </Button>
          </div>
        </GlassCard>

        <GlassCard title="Diagnosis Result" description="AI analysis">
          {diagnosis ? (
            <div className="space-y-4">
              <div className="p-4 bg-accent rounded-lg">
                <div className="flex items-start gap-3 mb-3">
                  <AlertCircle className="h-6 w-6 text-destructive flex-shrink-0 mt-1" />
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg mb-1">{diagnosis.disease}</h3>
                    <p className="text-sm text-muted-foreground">
                      Confidence: {(diagnosis.confidence * 100).toFixed(1)}%
                    </p>
                    {diagnosis.severity && (
                      <Badge className="mt-2" variant="outline">
                        Severity: {diagnosis.severity.charAt(0).toUpperCase() + diagnosis.severity.slice(1)}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>

              <div className="p-4 bg-accent rounded-lg">
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <Leaf className="h-5 w-5 text-primary" />
                  Treatment Recommendations
                </h4>
                <p className="text-sm">{diagnosis.treatment}</p>
              </div>

              {diagnosis.prevention && (
                <div className="p-4 bg-accent rounded-lg">
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <Leaf className="h-5 w-5 text-emerald-600" />
                    Prevention Tips
                  </h4>
                  <p className="text-sm">{diagnosis.prevention}</p>
                </div>
              )}

              <Button variant="outline" className="w-full" onClick={() => setDiagnosis(null)}>
                New Diagnosis
              </Button>
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <Leaf className="h-16 w-16 mx-auto mb-4 opacity-50" />
              <p>Upload an image or select symptoms to get a diagnosis</p>
            </div>
          )}
        </GlassCard>
      </div>

      <GlassCard title="Diagnosis History" description="Recent analyses">
        <div className="text-center py-8 text-muted-foreground">
          <p>No previous diagnoses yet</p>
        </div>
      </GlassCard>
    </div>
  );
}
