/**
 * Plant Disease Dataset
 * Loads CSV data of plant diseases and provides diagnosis recommendations
 */

export interface PlantDisease {
  plant_type: string;
  disease_name: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  confidence: number;
  symptoms: string;
  treatment: string;
  prevention: string;
  affected_area_estimate: string;
}

class DiseaseDatabase {
  private diseases: PlantDisease[] = [];
  private loaded = false;

  async load(): Promise<void> {
    if (this.loaded) return;

    try {
      const response = await fetch('/plant_diseases.csv');
      if (!response.ok) {
        console.warn('Disease dataset not found, using fallback data');
        this.diseases = this.getFallbackDiseases();
        this.loaded = true;
        return;
      }

      const text = await response.text();
      this.diseases = this.parseCSV(text);
      this.loaded = true;
      console.log(`Loaded ${this.diseases.length} diseases from dataset`);
    } catch (error) {
      console.error('Failed to load disease dataset:', error);
      this.diseases = this.getFallbackDiseases();
      this.loaded = true;
    }
  }

  private parseCSV(text: string): PlantDisease[] {
    const lines = text.trim().split('\n');
    if (lines.length < 2) return this.getFallbackDiseases();

    const headers = lines[0].split(',').map((h) => h.trim());
    const diseases: PlantDisease[] = [];

    for (let i = 1; i < lines.length; i++) {
      const values = this.parseCSVLine(lines[i]);
      if (values.length !== headers.length) continue;

      const disease: PlantDisease = {
        plant_type: values[0] || '',
        disease_name: values[1] || '',
        severity: (values[2] || 'medium') as any,
        confidence: parseFloat(values[3]) || 0.8,
        symptoms: values[4] || '',
        treatment: values[5] || '',
        prevention: values[6] || '',
        affected_area_estimate: values[7] || '',
      };

      if (disease.plant_type && disease.disease_name) {
        diseases.push(disease);
      }
    }

    return diseases.length > 0 ? diseases : this.getFallbackDiseases();
  }

  private parseCSVLine(line: string): string[] {
    const result: string[] = [];
    let current = '';
    let insideQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      const nextChar = line[i + 1];

      if (char === '"') {
        if (insideQuotes && nextChar === '"') {
          current += '"';
          i++;
        } else {
          insideQuotes = !insideQuotes;
        }
      } else if (char === ',' && !insideQuotes) {
        result.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }

    result.push(current.trim());
    return result;
  }

  /**
   * Get diseases for a specific plant type
   */
  getDiseasesByPlant(plantType: string): PlantDisease[] {
    const normalized = plantType.toLowerCase();
    return this.diseases.filter((d) => d.plant_type.toLowerCase().includes(normalized));
  }

  /**
   * Get a random disease for demo/fallback
   */
  getRandomDisease(): PlantDisease {
    if (this.diseases.length === 0) return this.getFallbackDiseases()[0];
    return this.diseases[Math.floor(Math.random() * this.diseases.length)];
  }

  /**
   * Get diseases matching symptoms
   */
  getDiseasesBySymptoms(symptomKeywords: string[]): PlantDisease[] {
    if (symptomKeywords.length === 0) return [];

    const keywords = symptomKeywords.map((s) => s.toLowerCase());
    return this.diseases.filter((disease) => {
      const diseaseLower = disease.disease_name.toLowerCase();
      const symptomsLower = disease.symptoms.toLowerCase();

      return keywords.some((keyword) => diseaseLower.includes(keyword) || symptomsLower.includes(keyword));
    });
  }

  /**
   * Get all available plant types from dataset
   */
  getPlantTypes(): string[] {
    const types = new Set(this.diseases.map((d) => d.plant_type));
    return Array.from(types).sort();
  }

  /**
   * Get all diseases
   */
  getAllDiseases(): PlantDisease[] {
    return [...this.diseases];
  }

  /**
   * Get diseases by severity level
   */
  getDiseasesBySeverity(severity: string): PlantDisease[] {
    return this.diseases.filter((d) => d.severity === severity);
  }

  /**
   * Search diseases by name pattern
   */
  searchDiseases(query: string): PlantDisease[] {
    const lower = query.toLowerCase();
    return this.diseases.filter((d) => d.disease_name.toLowerCase().includes(lower) || d.plant_type.toLowerCase().includes(lower));
  }

  /**
   * Get a curated diagnosis based on symptoms and plant type
   */
  getDiagnosis(
    plantType?: string,
    symptomKeywords?: string[],
    confidence?: number
  ): PlantDisease | null {
    let candidates = [...this.diseases];

    // Filter by plant type if provided
    if (plantType) {
      const plantMatches = this.getDiseasesByPlant(plantType);
      if (plantMatches.length > 0) {
        candidates = plantMatches;
      }
    }

    // Filter by symptoms if provided
    if (symptomKeywords && symptomKeywords.length > 0) {
      const symptomMatches = this.getDiseasesBySymptoms(symptomKeywords);
      if (symptomMatches.length > 0) {
        candidates = symptomMatches;
      }
    }

    // Filter by confidence if provided
    if (confidence !== undefined) {
      const confidentMatches = candidates.filter((d) => d.confidence >= confidence - 0.1);
      if (confidentMatches.length > 0) {
        candidates = confidentMatches;
      }
    }

    if (candidates.length === 0) return null;

    // Return random candidate from filtered list for variety
    return candidates[Math.floor(Math.random() * candidates.length)];
  }

  private getFallbackDiseases(): PlantDisease[] {
    return [
      {
        plant_type: 'Tomato',
        disease_name: 'Early Blight',
        severity: 'high',
        confidence: 0.94,
        symptoms: 'Brown spots with concentric rings on lower leaves, yellowing',
        treatment: 'Remove infected leaves. Apply copper-based fungicide. Water at soil level only.',
        prevention: 'Mulch plants. Avoid overhead watering. Rotate crops yearly. Remove plant debris.',
        affected_area_estimate: '30-50%',
      },
      {
        plant_type: 'Tomato',
        disease_name: 'Late Blight',
        severity: 'critical',
        confidence: 0.96,
        symptoms: 'Water-soaked lesions on leaves and stems, white fungal growth on underside',
        treatment: 'Remove infected plants immediately. Apply mancozeb or chlorothalonil. Increase airflow.',
        prevention: 'Plant resistant varieties. Avoid overhead watering. Improve air circulation.',
        affected_area_estimate: '50-100%',
      },
      {
        plant_type: 'Potato',
        disease_name: 'Late Blight',
        severity: 'critical',
        confidence: 0.97,
        symptoms: 'Water-soaked spots on leaves, white fungal growth, stem rot',
        treatment: 'Remove affected plants. Apply mancozeb fungicide. Improve air circulation.',
        prevention: 'Plant resistant varieties. Avoid overhead watering. Destroy affected tubers.',
        affected_area_estimate: '60-100%',
      },
      {
        plant_type: 'Lettuce',
        disease_name: 'Downy Mildew',
        severity: 'high',
        confidence: 0.87,
        symptoms: 'Yellow patches on upper leaves, white fungal growth on underside',
        treatment: 'Apply mancozeb or azoxystrobin. Remove infected leaves. Improve air circulation.',
        prevention: 'Space plants for airflow. Avoid overhead watering. Remove plant debris.',
        affected_area_estimate: '40-70%',
      },
      {
        plant_type: 'Pepper',
        disease_name: 'Phytophthora Blight',
        severity: 'critical',
        confidence: 0.92,
        symptoms: 'Water-soaked lesions on leaves and stems, fruit rot',
        treatment: 'Remove infected plants. Apply metalaxyl or mancozeb. Improve drainage.',
        prevention: 'Ensure excellent drainage. Space plants properly. Use fungicide seed treatment.',
        affected_area_estimate: '50-100%',
      },
      {
        plant_type: 'Cucumber',
        disease_name: 'Powdery Mildew',
        severity: 'medium',
        confidence: 0.84,
        symptoms: 'White powdery coating on leaves and stems, leaf yellowing',
        treatment: 'Spray with neem oil or sulfur-based fungicide. Prune affected areas.',
        prevention: 'Ensure adequate spacing. Avoid overhead watering. Apply preventative spray.',
        affected_area_estimate: '20-40%',
      },
    ];
  }
}

// Export singleton instance
export const diseaseDatabase = new DiseaseDatabase();

// Initialize on module load
diseaseDatabase.load().catch(console.error);
