export type UserRole = 'user' | 'admin';
export type FarmType = 'rural' | 'urban' | 'both';
export type GrowthStage = 'seedling' | 'vegetative' | 'flowering' | 'harvest';
export type OrderStatus = 'pending' | 'confirmed' | 'shipped' | 'delivered';
export type AlertType = 'low_water' | 'disease_detected' | 'weather_warning' | 'low_stock' | 'maintenance_due';
export type RecordType = 'income' | 'expense';
export type PaymentStatus = 'paid' | 'unpaid';
export type SchemeType = 'subsidy' | 'insurance' | 'loan';

export interface Profile {
  id: string;
  username: string;
  email: string | null;
  gmail_id: string | null;
  phone: string | null;
  role: UserRole;
  farm_type: FarmType;
  location: string | null;
  created_at: string;
  updated_at: string;
}

export interface Crop {
  id: string;
  owner_id: string;
  name: string;
  variety: string | null;
  field_assigned: string | null;
  planting_date: string | null;
  expected_harvest_date: string | null;
  actual_harvest_date: string | null;
  growth_stage: GrowthStage;
  expected_yield: number | null;
  actual_yield: number | null;
  notes: string | null;
  image_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface Livestock {
  id: string;
  owner_id: string;
  animal_type: string;
  breed: string | null;
  count: number;
  date_acquired: string | null;
  weight: number | null;
  condition_notes: string | null;
  last_vet_visit: string | null;
  next_vaccination_date: string | null;
  image_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface Inventory {
  id: string;
  owner_id: string;
  item_name: string;
  category: string;
  quantity: number;
  unit: string;
  reorder_threshold: number;
  created_at: string;
  updated_at: string;
}

export interface Equipment {
  id: string;
  owner_id: string;
  name: string;
  equipment_type: string;
  purchase_date: string | null;
  last_maintenance_date: string | null;
  next_maintenance_date: string | null;
  condition: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface FinancialRecord {
  id: string;
  owner_id: string;
  record_type: RecordType;
  amount: number;
  category: string;
  description: string | null;
  record_date: string;
  created_at: string;
  updated_at: string;
}

export interface Product {
  id: string;
  owner_id: string;
  name: string;
  description: string | null;
  price: number;
  quantity_available: number;
  image_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface Order {
  id: string;
  product_id: string;
  seller_id: string;
  buyer_name: string;
  buyer_contact: string | null;
  quantity: number;
  total_amount: number;
  status: OrderStatus;
  payment_status: PaymentStatus;
  order_date: string;
  created_at: string;
  updated_at: string;
  product?: Product;
}

export interface Alert {
  id: string;
  user_id: string;
  alert_type: AlertType;
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

export interface FarmLog {
  id: string;
  owner_id: string;
  log_date: string;
  activity_type: string;
  description: string;
  cost: number;
  created_at: string;
  updated_at: string;
}

export interface CropPlan {
  id: string;
  owner_id: string;
  location: string;
  season: string;
  soil_type: string;
  available_space: number;
  recommended_crops: RecommendedCrop[] | null;
  created_at: string;
}

export interface RecommendedCrop {
  name: string;
  expected_yield_per_sqm: number;
  care_difficulty: string;
  description?: string;
}

export interface IrrigationSchedule {
  id: string;
  owner_id: string;
  plant_name: string;
  zone: string | null;
  watering_days: string[];
  watering_time: string;
  daily_water_usage: number;
  created_at: string;
  updated_at: string;
}

export interface Diagnosis {
  id: string;
  owner_id: string;
  plant_name: string | null;
  symptoms: string[] | null;
  image_url: string | null;
  diagnosis_result: string | null;
  confidence_score: number | null;
  treatment_suggestions: string | null;
  diagnosis_date: string;
  created_at: string;
}

export interface GovernmentScheme {
  id: string;
  scheme_name: string;
  scheme_type: SchemeType;
  description: string;
  eligibility: string;
  application_deadline: string | null;
  link: string | null;
  created_at: string;
}

export interface CropEncyclopedia {
  id: string;
  name: string;
  image_url: string | null;
  soil_type: string;
  growing_season: string;
  expected_yield: string;
  recommended_fertilizers: string | null;
  description: string | null;
  created_at: string;
}

export interface FarmMapping {
  id: string;
  owner_id: string;
  grid_position: string;
  crop_assigned: string | null;
  crop_color: string | null;
  created_at: string;
  updated_at: string;
}

export interface WeatherData {
  temperature: number;
  humidity: number;
  rainfall: number;
  uv_index?: number;
  condition: string;
  forecast?: WeatherForecast[];
}

export interface WeatherForecast {
  date: string;
  temperature_high: number;
  temperature_low: number;
  condition: string;
  rainfall: number;
}

export interface DashboardStats {
  total_crop_area?: number;
  active_crops: number;
  total_revenue: number;
  total_expenses: number;
  water_usage?: number;
  active_plants?: number;
  pending_orders: number;
}
