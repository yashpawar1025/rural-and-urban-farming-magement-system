import { useCallback, useEffect, useMemo, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { GlassCard } from '@/components/common/GlassCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase, isSupabaseConfigured } from '@/db/supabase';
import { createDiagnosis, getDiagnoses } from '@/db/api';
import { useRealtime } from '@/hooks/useRealtime';
import { diseaseDatabase } from '@/lib/diseaseData';
import type { Diagnosis } from '@/types/types';
import { toast } from 'sonner';
import { Upload, Loader2, Activity, ShieldCheck, Sparkles, TriangleAlert, Microscope, RefreshCcw } from 'lucide-react';

type DiagnosisViewResult = {
  disease: string;
  confidence: number;
  treatment: string;
  prevention?: string;
  severity?: string;
};

export default function PlantDiagnosis() {
  const { user } = useAuth();
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [plantType, setPlantType] = useState('');
  const [symptoms, setSymptoms] = useState('');
  const [loading, setLoading] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [result, setResult] = useState<DiagnosisViewResult | null>(null);
  const [diagnosisHistory, setDiagnosisHistory] = useState<Diagnosis[]>([]);
  const [availablePlants, setAvailablePlants] = useState<string[]>([]);

  const fetchDiagnosisHistory = useCallback(async () => {
    if (!user) return;

    setHistoryLoading(true);
    try {
      if (!isSupabaseConfigured) {
        setDiagnosisHistory([]);
        return;
      }

      const data = await getDiagnoses(user.id);
      setDiagnosisHistory(data);
    } catch (error) {
      console.error('Failed to load diagnosis history:', error);
      toast.error('Unable to load diagnosis history');
    } finally {
      setHistoryLoading(false);
    }
  }, [user]);

  // Load available plant types from disease database
  useEffect(() => {
    const loadPlants = async () => {
      await diseaseDatabase.load();
      const plants = diseaseDatabase.getPlantTypes();
      setAvailablePlants(plants);
    };
    loadPlants();
  }, []);

  useEffect(() => {
    fetchDiagnosisHistory();
  }, [fetchDiagnosisHistory]);

  useEffect(() => {
    return () => {
      if (preview) {
        URL.revokeObjectURL(preview);
      }
    };
  }, [preview]);

  useRealtime({
    table: 'diagnoses',
    event: 'INSERT',
    filter: user ? `owner_id=eq.${user.id}` : undefined,
    onInsert: useCallback((newDiagnosis: Diagnosis) => {
      setDiagnosisHistory((prev) => {
        if (prev.some((item) => item.id === newDiagnosis.id)) {
          return prev;
        }
        return [newDiagnosis, ...prev];
      });
      toast.success('New diagnosis added in real time');
    }, []),
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.size > 5 * 1024 * 1024) {
        toast.error('File size must be less than 5MB');
        return;
      }
      setFile(selectedFile);
      if (preview) URL.revokeObjectURL(preview);
      setPreview(URL.createObjectURL(selectedFile));
      setResult(null);
    }
  };

  const generateDemoDiagnosis = (): DiagnosisViewResult => {
    const symptomKeywords = symptoms
      ? symptoms.split(',').map((s) => s.trim().toLowerCase()).filter(Boolean)
      : [];

    // Try to get a diagnosis from the disease database based on inputs
    const diagnosis = diseaseDatabase.getDiagnosis(plantType || undefined, symptomKeywords, 0.75);

    if (diagnosis) {
      return {
        disease: diagnosis.disease_name,
        confidence: diagnosis.confidence,
        treatment: diagnosis.treatment,
        prevention: diagnosis.prevention,
        severity: diagnosis.severity,
      };
    }

    // Fallback to a random disease if no matches
    const randomDisease = diseaseDatabase.getRandomDisease();
    return {
      disease: randomDisease.disease_name,
      confidence: randomDisease.confidence,
      treatment: randomDisease.treatment,
      prevention: randomDisease.prevention,
      severity: randomDisease.severity,
    };
  };

  const handleUpload = async () => {
    if (!file || !user) return;

    setLoading(true);
    try {
      if (!isSupabaseConfigured) {
        const diagnosisResult = generateDemoDiagnosis();
        setResult(diagnosisResult);

        const demoEntry: Diagnosis = {
          id: `demo-${Date.now()}`,
          owner_id: user.id,
          plant_name: plantType || 'Unknown Plant',
          symptoms: symptoms
            ? symptoms.split(',').map((item) => item.trim()).filter(Boolean)
            : null,
          image_url: preview,
          diagnosis_result: diagnosisResult.disease,
          confidence_score: diagnosisResult.confidence,
          treatment_suggestions: diagnosisResult.treatment,
          diagnosis_date: new Date().toISOString().split('T')[0],
          created_at: new Date().toISOString(),
        };

        setDiagnosisHistory((prev) => [demoEntry, ...prev]);
        toast.success('Demo diagnosis complete');
        return;
      }

      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('avdw5t0e8yrl_plant_images')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from('avdw5t0e8yrl_plant_images')
        .getPublicUrl(fileName);

      try {
        const response = await supabase.functions.invoke('plant-predict', {
          body: { image_url: urlData.publicUrl },
        });

        if (response.error) {
          const errorMsg = response.error?.message || 
                          (response.error?.context && typeof response.error.context === 'object' ? JSON.stringify(response.error.context) : null) ||
                          'Edge Function unavailable';
          console.error('Edge Function error:', response.error);
          throw new Error(errorMsg);
        }

        if (!response.data) {
          throw new Error('No diagnosis result from Edge Function');
        }

        const diagnosisResult = response.data;
        setResult(diagnosisResult);

        const savedDiagnosis = await createDiagnosis({
          owner_id: user.id,
          plant_name: plantType || null,
          symptoms: symptoms
            ? symptoms.split(',').map((item) => item.trim()).filter(Boolean)
            : null,
          image_url: urlData.publicUrl,
          diagnosis_result: diagnosisResult.disease,
          confidence_score: diagnosisResult.confidence,
          treatment_suggestions: diagnosisResult.treatment,
          diagnosis_date: new Date().toISOString().split('T')[0],
        });

        setDiagnosisHistory((prev) => {
          if (prev.some((item) => item.id === savedDiagnosis.id)) {
            return prev;
          }
          return [savedDiagnosis, ...prev];
        });

        toast.success('Diagnosis complete!');
      } catch (edgeFunctionError: any) {
        console.error('Edge Function failed:', edgeFunctionError);
        
        const isEdgeFunctionError = 
          edgeFunctionError?.message?.includes('Failed to send a request') ||
          edgeFunctionError?.message?.includes('Edge Function') ||
          edgeFunctionError?.code === 'FUNCTION_NOT_FOUND' ||
          edgeFunctionError?.status === 404;

        if (isEdgeFunctionError) {
          console.warn('Edge Function unavailable, using disease dataset');
          const diagnosisResult = generateDemoDiagnosis();
          setResult(diagnosisResult);

          const demoEntry: Diagnosis = {
            id: `edge-fallback-${Date.now()}`,
            owner_id: user.id,
            plant_name: plantType || 'Unknown Plant',
            symptoms: symptoms
              ? symptoms.split(',').map((item) => item.trim()).filter(Boolean)
              : null,
            image_url: urlData.publicUrl,
            diagnosis_result: diagnosisResult.disease,
            confidence_score: diagnosisResult.confidence,
            treatment_suggestions: diagnosisResult.treatment,
            diagnosis_date: new Date().toISOString().split('T')[0],
            created_at: new Date().toISOString(),
          };

          setDiagnosisHistory((prev) => [demoEntry, ...prev]);
          toast.warning('Using disease dataset (Edge Function unavailable)');
        } else {
          throw edgeFunctionError;
        }
      }
    } catch (error: unknown) {
      console.error('Diagnosis error:', error);
      const errorMsg = error instanceof Error ? error.message : 'Diagnosis failed';
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const averageConfidence = useMemo(() => {
    const availableConfidence = diagnosisHistory
      .map((item) => item.confidence_score)
      .filter((item): item is number => item !== null);

    if (!availableConfidence.length) return 0;
    return availableConfidence.reduce((acc, current) => acc + current, 0) / availableConfidence.length;
  }, [diagnosisHistory]);

  const criticalCases = useMemo(() => {
    return diagnosisHistory.filter(
      (item) => item.confidence_score !== null && item.confidence_score >= 0.85
    ).length;
  }, [diagnosisHistory]);

  const confidenceLevel = (confidence: number) => {
    if (confidence >= 0.9) return 'High Confidence';
    if (confidence >= 0.75) return 'Moderate Confidence';
    return 'Low Confidence';
  };

  const confidenceBadgeClass = (confidence: number) => {
    if (confidence >= 0.9) return 'bg-emerald-100 text-emerald-800 border-emerald-200';
    if (confidence >= 0.75) return 'bg-amber-100 text-amber-800 border-amber-200';
    return 'bg-rose-100 text-rose-800 border-rose-200';
  };

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-700 via-emerald-600 to-lime-500 p-8 text-white shadow-xl shadow-emerald-700/25">
        <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
        <div className="absolute -bottom-16 left-1/3 h-40 w-40 rounded-full bg-lime-100/20 blur-2xl" />
        <div className="relative z-10 grid gap-4 md:grid-cols-[1fr_auto] md:items-end">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs uppercase tracking-[0.16em]">
              <Sparkles className="h-3.5 w-3.5" />
              AI Disease Detection
            </div>
            <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">Plant Diagnosis</h1>
            <p className="mt-2 max-w-2xl text-sm text-white/90 md:text-base">Upload crop images, get treatment suggestions, and watch diagnosis records sync in real time.</p>
          </div>
          <div className="grid grid-cols-3 gap-3 text-center text-sm">
            <div className="rounded-2xl bg-white/15 px-4 py-3 backdrop-blur-md">
              <p className="text-xl font-semibold">{diagnosisHistory.length}</p>
              <p className="text-xs text-white/80">Diagnoses</p>
            </div>
            <div className="rounded-2xl bg-white/15 px-4 py-3 backdrop-blur-md">
              <p className="text-xl font-semibold">{(averageConfidence * 100).toFixed(0)}%</p>
              <p className="text-xs text-white/80">Avg Confidence</p>
            </div>
            <div className="rounded-2xl bg-white/15 px-4 py-3 backdrop-blur-md">
              <p className="text-xl font-semibold">{criticalCases}</p>
              <p className="text-xs text-white/80">Critical Cases</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <GlassCard>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Realtime Status</p>
              <p className="text-lg font-semibold">{isSupabaseConfigured ? 'Live Sync Enabled' : 'Demo Mode'}</p>
            </div>
            <Activity className="h-5 w-5 text-emerald-600" />
          </div>
        </GlassCard>
        <GlassCard>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Detection Accuracy</p>
              <p className="text-lg font-semibold">Model Assisted</p>
            </div>
            <ShieldCheck className="h-5 w-5 text-sky-600" />
          </div>
        </GlassCard>
        <GlassCard>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Alert Level</p>
              <p className="text-lg font-semibold">{criticalCases > 0 ? 'Monitor Closely' : 'Stable'}</p>
            </div>
            <TriangleAlert className="h-5 w-5 text-amber-600" />
          </div>
        </GlassCard>
      </div>

      {!isSupabaseConfigured && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          Live backend is unavailable. Diagnosis runs in demo mode locally, but the page remains fully interactive.
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <GlassCard title="Upload Image" description="Select a clear image of the affected plant">
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <div>
                <Label htmlFor="plant-type" className="mb-1 inline-block">Plant Type (optional)</Label>
                <Select value={plantType} onValueChange={setPlantType}>
                  <SelectTrigger id="plant-type">
                    <SelectValue placeholder="Select or search plant..." />
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
                <Label htmlFor="symptoms" className="mb-1 inline-block">Symptoms (comma separated)</Label>
                <Input
                  id="symptoms"
                  value={symptoms}
                  onChange={(event) => setSymptoms(event.target.value)}
                  placeholder="e.g. brown spots, yellowing"
                />
              </div>
            </div>

            <div className="rounded-xl border-2 border-dashed border-border p-8 text-center transition-all duration-300 hover:border-primary/40 hover:bg-accent/40">
              <input
                type="file"
                accept="image/jpeg,image/png"
                onChange={handleFileChange}
                className="hidden"
                id="file-upload"
              />
              <Label htmlFor="file-upload" className="cursor-pointer">
                <div className="flex flex-col items-center gap-2">
                  <Upload className="h-12 w-12 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    Click to upload a high-quality plant image
                  </p>
                  <p className="text-xs text-muted-foreground">
                    JPG or PNG (max 5MB)
                  </p>
                </div>
              </Label>
            </div>

            {preview && (
              <div className="space-y-4">
                <img src={preview} alt="Preview" className="h-64 w-full rounded-xl object-cover" />
                <Button onClick={handleUpload} disabled={loading} className="w-full">
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    'Diagnose Plant'
                  )}
                </Button>
              </div>
            )}
          </div>
        </GlassCard>

        <GlassCard title="Diagnosis Result" description="AI-powered disease detection">
          {result ? (
            <div className="space-y-4">
              <div className="rounded-xl bg-accent p-4">
                <p className="text-sm text-muted-foreground">Detected Disease</p>
                <p className="text-xl font-bold text-primary">{result.disease}</p>
                {result.severity && (
                  <Badge className="mt-2" variant="outline">
                    Severity: {result.severity.charAt(0).toUpperCase() + result.severity.slice(1)}
                  </Badge>
                )}
              </div>
              <div className="rounded-xl bg-accent p-4">
                <p className="text-sm text-muted-foreground">Confidence Score</p>
                <div className="mt-2 flex items-center justify-between">
                  <p className="text-xl font-bold">{(result.confidence * 100).toFixed(1)}%</p>
                  <Badge variant="outline" className={confidenceBadgeClass(result.confidence)}>
                    {confidenceLevel(result.confidence)}
                  </Badge>
                </div>
                <Progress className="mt-3 h-2" value={result.confidence * 100} />
              </div>
              <div className="rounded-xl bg-accent p-4">
                <p className="text-sm text-muted-foreground mb-2">Treatment Suggestions</p>
                <p className="text-sm">{result.treatment}</p>
              </div>
              {result.prevention && (
                <div className="rounded-xl bg-accent p-4">
                  <p className="text-sm text-muted-foreground mb-2">Prevention Tips</p>
                  <p className="text-sm">{result.prevention}</p>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <Microscope className="mx-auto mb-2 h-10 w-10 text-muted-foreground/60" />
              <p>Upload an image to get diagnosis results</p>
            </div>
          )}
        </GlassCard>

        <GlassCard title="Live Diagnosis Feed" description="New entries appear automatically in real time">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Badge variant="outline" className="text-xs">
                {isSupabaseConfigured ? 'Realtime Connected' : 'Local Demo Feed'}
              </Badge>
              <Button variant="ghost" size="sm" onClick={fetchDiagnosisHistory}>
                <RefreshCcw className="mr-2 h-3.5 w-3.5" />
                Refresh
              </Button>
            </div>

            {historyLoading ? (
              <div className="space-y-2">
                {[1, 2, 3].map((item) => (
                  <div key={item} className="h-16 rounded-xl bg-accent animate-pulse" />
                ))}
              </div>
            ) : diagnosisHistory.length === 0 ? (
              <div className="py-10 text-center text-sm text-muted-foreground">
                No diagnosis records yet.
              </div>
            ) : (
              <div className="max-h-[460px] space-y-2 overflow-y-auto pr-1">
                {diagnosisHistory.slice(0, 12).map((entry) => (
                  <div key={entry.id} className="rounded-xl border border-border bg-white p-3 shadow-sm">
                    <div className="mb-1 flex items-start justify-between gap-2">
                      <p className="text-sm font-semibold">{entry.diagnosis_result || 'Unknown Diagnosis'}</p>
                      {entry.confidence_score !== null && (
                        <Badge variant="outline" className={confidenceBadgeClass(entry.confidence_score)}>
                          {(entry.confidence_score * 100).toFixed(0)}%
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {entry.plant_name || 'Plant not specified'} • {new Date(entry.created_at).toLocaleString()}
                    </p>
                    {entry.treatment_suggestions && (
                      <p className="mt-2 line-clamp-2 text-xs text-slate-700">{entry.treatment_suggestions}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
