/**
 * Module Enhancement Utilities
 * Provides common enhancement patterns for all farm modules
 */

// ============ KPI Calculation Functions ============
export const calculateHealthScore = (data: any) => {
  // Calculates 0-100 health score based on various factors
  let score = 100;
  
  if (data.alerts && Array.isArray(data.alerts)) {
    score -= data.alerts.length * 5;
  }
  
  if (data.maintenanceDue) {
    score -= 10;
  }
  
  if (data.issues) {
    score -= data.issues.length * 3;
  }
  
  return Math.max(0, Math.min(100, score));
};

export const calculateProductivityIndex = (data: any) => {
  // 0-100 productivity metric
  if (data.production && data.capacity) {
    return Math.round((data.production / data.capacity) * 100);
  }
  return 75;
};

export const calculateEfficiencyRatio = (data: any) => {
  // Input vs Output efficiency
  if (data.revenue && data.expenses) {
    return ((data.revenue - data.expenses) / data.revenue) * 100;
  }
  return 60;
};

// ============ Filtering & Sorting Utilities ============
export const applyFilters = (items: any[], filters: Record<string, any>) => {
  return items.filter((item) => {
    for (const [key, value] of Object.entries(filters)) {
      if (value === 'all' || value === null) continue;
      
      if (Array.isArray(value)) {
        if (!value.includes(item[key])) return false;
      } else if (typeof value === 'string') {
        if (!item[key]?.toString().toLowerCase().includes(value.toLowerCase())) {
          return false;
        }
      } else if (typeof value === 'number') {
        if (item[key] !== value) return false;
      }
    }
    return true;
  });
};

export const applySorting = (items: any[], sortKey: string, reverse = false) => {
  const sorted = [...items].sort((a, b) => {
    const aVal = a[sortKey];
    const bVal = b[sortKey];
    
    if (typeof aVal === 'number' && typeof bVal === 'number') {
      return aVal - bVal;
    }
    
    return String(aVal).localeCompare(String(bVal));
  });
  
  return reverse ? sorted.reverse() : sorted;
};

// ============ Data Export Functions ============
export const exportToCSV = (data: any[], filename: string) => {
  if (data.length === 0) return;
  
  const headers = Object.keys(data[0]);
  const csv = [
    headers.join(','),
    ...data.map((row) =>
      headers.map((header) => {
        const value = row[header];
        if (typeof value === 'string' && value.includes(',')) {
          return `"${value}"`;
        }
        return value;
      }).join(',')
    ),
  ].join('\n');
  
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${filename}-${new Date().toISOString().split('T')[0]}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export const exportToJSON = (data: any[], filename: string) => {
  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${filename}-${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

// ============ Comparison & Analytics Functions ============
export const compareItems = (item1: any, item2: any) => {
  const comparison: Record<string, any> = {};
  
  const keys = new Set([...Object.keys(item1), ...Object.keys(item2)]);
  
  for (const key of keys) {
    const val1 = item1[key];
    const val2 = item2[key];
    
    if (typeof val1 === 'number' && typeof val2 === 'number') {
      const diff = val2 - val1;
      const percentChange = ((diff / val1) * 100).toFixed(2);
      comparison[key] = {
        item1: val1,
        item2: val2,
        difference: diff,
        percentChange: `${diff >= 0 ? '+' : ''}${percentChange}%`,
        trend: diff >= 0 ? 'up' : 'down',
      };
    } else {
      comparison[key] = { item1: val1, item2: val2 };
    }
  }
  
  return comparison;
};

export const calculateTrends = (data: any[], valueKey: string) => {
  if (data.length < 2) return { trend: 'flat', percentChange: 0 };
  
  const values = data.map((item) => item[valueKey]).filter((v) => typeof v === 'number');
  const oldest = values[values.length - 1];
  const newest = values[0];
  
  if (oldest === 0) return { trend: 'flat', percentChange: 0 };
  
  const change = ((newest - oldest) / oldest) * 100;
  
  return {
    trend: change > 0 ? 'up' : change < 0 ? 'down' : 'flat',
    percentChange: Math.round(change),
    absolute: newest - oldest,
  };
};

// ============ Alert & Threshold Management ============
export const checkThresholds = (value: number, thresholds: { warning: number; critical: number }) => {
  if (value <= thresholds.critical) return { level: 'critical', color: 'text-destructive bg-destructive/10' };
  if (value <= thresholds.warning) return { level: 'warning', color: 'text-amber-600 bg-amber-50' };
  return { level: 'normal', color: 'text-emerald-600 bg-emerald-50' };
};

export const generateAlerts = (data: any[], rules: Record<string, (item: any) => boolean>) => {
  const alerts: any[] = [];
  
  for (const [ruleName, ruleFunc] of Object.entries(rules)) {
    data.forEach((item) => {
      if (ruleFunc(item)) {
        alerts.push({
          id: `${ruleName}-${item.id}`,
          type: ruleName,
          item,
          severity: ruleName.includes('critical') ? 'high' : 'medium',
        });
      }
    });
  }
  
  return alerts;
};

// ============ Recommendation Engine ============
export const generateRecommendations = (data: any[], module: string) => {
  const recommendations: string[] = [];
  
  switch (module) {
    case 'crops':
      if (data.some((crop: any) => crop.moisture_level < 40)) {
        recommendations.push('💧 Irrigation needed: Some crops are dry');
      }
      if (data.some((crop: any) => crop.health_status === 'poor')) {
        recommendations.push('🚨 Pest/disease detected: Schedule diagnosis');
      }
      if (data.length > 5) {
        recommendations.push('📊 Multiple crops: Consider crop rotation plan');
      }
      break;
      
    case 'livestock':
      const overdue = data.filter((animal: any) => {
        if (!animal.next_vaccination_date) return false;
        const daysUntil = Math.ceil((new Date(animal.next_vaccination_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
        return daysUntil <= 7;
      });
      if (overdue.length > 0) {
        recommendations.push(`💉 ${overdue.length} animals need vaccination this week`);
      }
      break;
      
    case 'equipment':
      if (data.some((eq: any) => eq.condition === 'poor')) {
        recommendations.push('🔧 Critical maintenance needed: Replace/repair damaged equipment');
      }
      if (data.some((eq: any) => {
        if (!eq.next_maintenance_date) return false;
        const daysUntil = Math.ceil((new Date(eq.next_maintenance_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
        return daysUntil <= 7;
      })) {
        recommendations.push('📅 Schedule maintenance for equipment this week');
      }
      break;
  }
  
  return recommendations;
};

// ============ Background Image Mapping ============
export const getModuleBackgroundImage = (module: string, season?: string) => {
  const seasonImages: Record<string, Record<string, string>> = {
    spring: {
      crops: 'https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=1200&h=400&fit=crop',
      livestock: 'https://images.unsplash.com/photo-1500595046891-70d5dd62d18a?w=1200&h=400&fit=crop',
      equipment: 'https://images.unsplash.com/photo-1611273426858-450d8e3c9fce?w=1200&h=400&fit=crop',
      weather: 'https://images.unsplash.com/photo-1444080748397-f442aa95c3e5?w=1200&h=400&fit=crop',
    },
    summer: {
      crops: 'https://images.unsplash.com/photo-1595421645021-08582a702519?w=1200&h=400&fit=crop',
      livestock: 'https://images.unsplash.com/photo-1500595046891-70d5dd62d18a?w=1200&h=400&fit=crop',
      equipment: 'https://images.unsplash.com/photo-1627334714823-9f38cf7209de?w=1200&h=400&fit=crop',
      weather: 'https://images.unsplash.com/photo-1519904981063-b0cf448d479e?w=1200&h=400&fit=crop',
    },
  };
  
  return seasonImages[season || 'spring']?.[module] || null;
};

// ============ Quick Action Helpers ============
export const generateQuickActions = (module: string) => {
  const actions: Record<string, any[]> = {
    crops: [
      { label: 'Add Crop', icon: '🌱', action: 'add' },
      { label: 'View Health', icon: '📊', action: 'health' },
      { label: 'Irrigate', icon: '💧', action: 'irrigate' },
      { label: 'Fertilize', icon: '🧪', action: 'fertilize' },
    ],
    livestock: [
      { label: 'Add Animal', icon: '🐄', action: 'add' },
      { label: 'Schedule Vaccination', icon: '💉', action: 'vaccinate' },
      { label: 'Vet Visit', icon: '🏥', action: 'vet' },
      { label: 'Feed Log', icon: '🥕', action: 'feed' },
    ],
    equipment: [
      { label: 'Add Equipment', icon: '🔧', action: 'add' },
      { label: 'Schedule Maintenance', icon: '🛠️', action: 'maintain' },
      { label: 'View Status', icon: '📋', action: 'status' },
      { label: 'Repair Log', icon: '⚙️', action: 'repair' },
    ],
  };
  
  return actions[module] || [];
};
