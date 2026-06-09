import { supabase } from './supabase';
import type {
  Profile,
  Crop,
  Livestock,
  Inventory,
  Equipment,
  FinancialRecord,
  Product,
  Order,
  Alert,
  FarmLog,
  CropPlan,
  IrrigationSchedule,
  Diagnosis,
  GovernmentScheme,
  CropEncyclopedia,
  FarmMapping,
  DashboardStats,
} from '@/types/types';

// Profile API
export async function getProfile(userId: string) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle();
  
  if (error) throw error;
  return data as Profile | null;
}

export async function updateProfile(userId: string, updates: Partial<Profile>) {
  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId)
    .select()
    .maybeSingle();
  
  if (error) throw error;
  return data as Profile;
}

// Crops API
export async function getCrops(userId: string) {
  const { data, error } = await supabase
    .from('crops')
    .select('*')
    .eq('owner_id', userId)
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  return Array.isArray(data) ? data as Crop[] : [];
}

export async function createCrop(crop: Omit<Crop, 'id' | 'created_at' | 'updated_at'>) {
  const { data, error } = await supabase
    .from('crops')
    .insert(crop)
    .select()
    .maybeSingle();
  
  if (error) throw error;
  return data as Crop;
}

export async function updateCrop(cropId: string, updates: Partial<Crop>) {
  const { data, error } = await supabase
    .from('crops')
    .update(updates)
    .eq('id', cropId)
    .select()
    .maybeSingle();
  
  if (error) throw error;
  return data as Crop;
}

export async function deleteCrop(cropId: string) {
  const { error } = await supabase
    .from('crops')
    .delete()
    .eq('id', cropId);
  
  if (error) throw error;
}

// Livestock API
export async function getLivestock(userId: string) {
  const { data, error } = await supabase
    .from('livestock')
    .select('*')
    .eq('owner_id', userId)
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  return Array.isArray(data) ? data as Livestock[] : [];
}

export async function createLivestock(livestock: Omit<Livestock, 'id' | 'created_at' | 'updated_at'>) {
  const { data, error } = await supabase
    .from('livestock')
    .insert(livestock)
    .select()
    .maybeSingle();
  
  if (error) throw error;
  return data as Livestock;
}

export async function updateLivestock(livestockId: string, updates: Partial<Livestock>) {
  const { data, error } = await supabase
    .from('livestock')
    .update(updates)
    .eq('id', livestockId)
    .select()
    .maybeSingle();
  
  if (error) throw error;
  return data as Livestock;
}

export async function deleteLivestock(livestockId: string) {
  const { error } = await supabase
    .from('livestock')
    .delete()
    .eq('id', livestockId);
  
  if (error) throw error;
}

// Inventory API
export async function getInventory(userId: string) {
  const { data, error } = await supabase
    .from('inventory')
    .select('*')
    .eq('owner_id', userId)
    .order('item_name', { ascending: true });
  
  if (error) throw error;
  return Array.isArray(data) ? data as Inventory[] : [];
}

export async function createInventoryItem(item: Omit<Inventory, 'id' | 'created_at' | 'updated_at'>) {
  const { data, error } = await supabase
    .from('inventory')
    .insert(item)
    .select()
    .maybeSingle();
  
  if (error) throw error;
  return data as Inventory;
}

export async function updateInventoryItem(itemId: string, updates: Partial<Inventory>) {
  const { data, error } = await supabase
    .from('inventory')
    .update(updates)
    .eq('id', itemId)
    .select()
    .maybeSingle();
  
  if (error) throw error;
  return data as Inventory;
}

export async function deleteInventoryItem(itemId: string) {
  const { error } = await supabase
    .from('inventory')
    .delete()
    .eq('id', itemId);
  
  if (error) throw error;
}

// Equipment API
export async function getEquipment(userId: string) {
  const { data, error } = await supabase
    .from('equipment')
    .select('*')
    .eq('owner_id', userId)
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  return Array.isArray(data) ? data as Equipment[] : [];
}

export async function createEquipment(equipment: Omit<Equipment, 'id' | 'created_at' | 'updated_at'>) {
  const { data, error } = await supabase
    .from('equipment')
    .insert(equipment)
    .select()
    .maybeSingle();
  
  if (error) throw error;
  return data as Equipment;
}

export async function updateEquipment(equipmentId: string, updates: Partial<Equipment>) {
  const { data, error } = await supabase
    .from('equipment')
    .update(updates)
    .eq('id', equipmentId)
    .select()
    .maybeSingle();
  
  if (error) throw error;
  return data as Equipment;
}

export async function deleteEquipment(equipmentId: string) {
  const { error } = await supabase
    .from('equipment')
    .delete()
    .eq('id', equipmentId);
  
  if (error) throw error;
}

// Financial Records API
export async function getFinancialRecords(userId: string) {
  const { data, error } = await supabase
    .from('financial_records')
    .select('*')
    .eq('owner_id', userId)
    .order('record_date', { ascending: false });
  
  if (error) throw error;
  return Array.isArray(data) ? data as FinancialRecord[] : [];
}

export async function createFinancialRecord(record: Omit<FinancialRecord, 'id' | 'created_at' | 'updated_at'>) {
  const { data, error } = await supabase
    .from('financial_records')
    .insert(record)
    .select()
    .maybeSingle();
  
  if (error) throw error;
  return data as FinancialRecord;
}

export async function updateFinancialRecord(recordId: string, updates: Partial<FinancialRecord>) {
  const { data, error } = await supabase
    .from('financial_records')
    .update(updates)
    .eq('id', recordId)
    .select()
    .maybeSingle();
  
  if (error) throw error;
  return data as FinancialRecord;
}

export async function deleteFinancialRecord(recordId: string) {
  const { error } = await supabase
    .from('financial_records')
    .delete()
    .eq('id', recordId);
  
  if (error) throw error;
}

// Products API
export async function getProducts(userId?: string) {
  let query = supabase
    .from('products')
    .select('*')
    .order('created_at', { ascending: false });
  
  if (userId) {
    query = query.eq('owner_id', userId);
  }
  
  const { data, error } = await query;
  
  if (error) throw error;
  return Array.isArray(data) ? data as Product[] : [];
}

export async function createProduct(product: Omit<Product, 'id' | 'created_at' | 'updated_at'>) {
  const { data, error } = await supabase
    .from('products')
    .insert(product)
    .select()
    .maybeSingle();
  
  if (error) throw error;
  return data as Product;
}

export async function updateProduct(productId: string, updates: Partial<Product>) {
  const { data, error } = await supabase
    .from('products')
    .update(updates)
    .eq('id', productId)
    .select()
    .maybeSingle();
  
  if (error) throw error;
  return data as Product;
}

export async function deleteProduct(productId: string) {
  const { error } = await supabase
    .from('products')
    .delete()
    .eq('id', productId);
  
  if (error) throw error;
}

// Orders API
export async function getOrders(userId: string) {
  const { data, error } = await supabase
    .from('orders')
    .select('*, product:products(*)')
    .eq('seller_id', userId)
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  return Array.isArray(data) ? data as Order[] : [];
}

export async function createOrder(order: Omit<Order, 'id' | 'created_at' | 'updated_at'>) {
  const { data, error } = await supabase
    .from('orders')
    .insert(order)
    .select()
    .maybeSingle();
  
  if (error) throw error;
  return data as Order;
}

export async function updateOrder(orderId: string, updates: Partial<Order>) {
  const { data, error } = await supabase
    .from('orders')
    .update(updates)
    .eq('id', orderId)
    .select()
    .maybeSingle();
  
  if (error) throw error;
  return data as Order;
}

// Alerts API
export async function getAlerts(userId: string) {
  const { data, error } = await supabase
    .from('alerts')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(20);
  
  if (error) throw error;
  return Array.isArray(data) ? data as Alert[] : [];
}

export async function markAlertAsRead(alertId: string) {
  const { error } = await supabase
    .from('alerts')
    .update({ is_read: true })
    .eq('id', alertId);
  
  if (error) throw error;
}

export async function getUnreadAlertCount(userId: string) {
  const { count, error } = await supabase
    .from('alerts')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('is_read', false);
  
  if (error) throw error;
  return count || 0;
}

// Farm Logs API
export async function getFarmLogs(userId: string) {
  const { data, error } = await supabase
    .from('farm_logs')
    .select('*')
    .eq('owner_id', userId)
    .order('log_date', { ascending: false });
  
  if (error) throw error;
  return Array.isArray(data) ? data as FarmLog[] : [];
}

export async function createFarmLog(log: Omit<FarmLog, 'id' | 'created_at' | 'updated_at'>) {
  const { data, error } = await supabase
    .from('farm_logs')
    .insert(log)
    .select()
    .maybeSingle();
  
  if (error) throw error;
  return data as FarmLog;
}

export async function updateFarmLog(logId: string, updates: Partial<FarmLog>) {
  const { data, error } = await supabase
    .from('farm_logs')
    .update(updates)
    .eq('id', logId)
    .select()
    .maybeSingle();
  
  if (error) throw error;
  return data as FarmLog;
}

export async function deleteFarmLog(logId: string) {
  const { error } = await supabase
    .from('farm_logs')
    .delete()
    .eq('id', logId);
  
  if (error) throw error;
}

// Crop Plans API
export async function getCropPlans(userId: string) {
  const { data, error } = await supabase
    .from('crop_plans')
    .select('*')
    .eq('owner_id', userId)
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  return Array.isArray(data) ? data as CropPlan[] : [];
}

export async function createCropPlan(plan: Omit<CropPlan, 'id' | 'created_at'>) {
  const { data, error } = await supabase
    .from('crop_plans')
    .insert(plan)
    .select()
    .maybeSingle();
  
  if (error) throw error;
  return data as CropPlan;
}

// Irrigation Schedules API
export async function getIrrigationSchedules(userId: string) {
  const { data, error } = await supabase
    .from('irrigation_schedules')
    .select('*')
    .eq('owner_id', userId)
    .order('plant_name', { ascending: true });
  
  if (error) throw error;
  return Array.isArray(data) ? data as IrrigationSchedule[] : [];
}

export async function createIrrigationSchedule(schedule: Omit<IrrigationSchedule, 'id' | 'created_at' | 'updated_at'>) {
  const { data, error } = await supabase
    .from('irrigation_schedules')
    .insert(schedule)
    .select()
    .maybeSingle();
  
  if (error) throw error;
  return data as IrrigationSchedule;
}

export async function updateIrrigationSchedule(scheduleId: string, updates: Partial<IrrigationSchedule>) {
  const { data, error } = await supabase
    .from('irrigation_schedules')
    .update(updates)
    .eq('id', scheduleId)
    .select()
    .maybeSingle();
  
  if (error) throw error;
  return data as IrrigationSchedule;
}

export async function deleteIrrigationSchedule(scheduleId: string) {
  const { error } = await supabase
    .from('irrigation_schedules')
    .delete()
    .eq('id', scheduleId);
  
  if (error) throw error;
}

// Diagnoses API
export async function getDiagnoses(userId: string) {
  const { data, error } = await supabase
    .from('diagnoses')
    .select('*')
    .eq('owner_id', userId)
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  return Array.isArray(data) ? data as Diagnosis[] : [];
}

export async function createDiagnosis(diagnosis: Omit<Diagnosis, 'id' | 'created_at'>) {
  const { data, error } = await supabase
    .from('diagnoses')
    .insert(diagnosis)
    .select()
    .maybeSingle();
  
  if (error) throw error;
  return data as Diagnosis;
}

// Government Schemes API
export async function getGovernmentSchemes() {
  const { data, error } = await supabase
    .from('government_schemes')
    .select('*')
    .order('scheme_name', { ascending: true });
  
  if (error) throw error;
  return Array.isArray(data) ? data as GovernmentScheme[] : [];
}

// Crop Encyclopedia API
export async function getCropEncyclopedia() {
  const { data, error } = await supabase
    .from('crop_encyclopedia')
    .select('*')
    .order('name', { ascending: true });
  
  if (error) throw error;
  return Array.isArray(data) ? data as CropEncyclopedia[] : [];
}

// Farm Mapping API
export async function getFarmMapping(userId: string) {
  const { data, error } = await supabase
    .from('farm_mapping')
    .select('*')
    .eq('owner_id', userId)
    .order('grid_position', { ascending: true });
  
  if (error) throw error;
  return Array.isArray(data) ? data as FarmMapping[] : [];
}

export async function upsertFarmMapping(mapping: Omit<FarmMapping, 'id' | 'created_at' | 'updated_at'>) {
  const { data, error } = await supabase
    .from('farm_mapping')
    .upsert(mapping, { onConflict: 'owner_id,grid_position' })
    .select()
    .maybeSingle();
  
  if (error) throw error;
  return data as FarmMapping;
}

// Dashboard Stats
export async function getDashboardStats(userId: string, farmType: 'rural' | 'urban'): Promise<DashboardStats> {
  const [cropsData, financialData, ordersData, irrigationData] = await Promise.all([
    getCrops(userId),
    getFinancialRecords(userId),
    getOrders(userId),
    farmType === 'urban' ? getIrrigationSchedules(userId) : Promise.resolve([]),
  ]);

  const totalRevenue = financialData
    .filter(r => r.record_type === 'income')
    .reduce((sum, r) => sum + Number(r.amount), 0);

  const totalExpenses = financialData
    .filter(r => r.record_type === 'expense')
    .reduce((sum, r) => sum + Number(r.amount), 0);

  const pendingOrders = ordersData.filter(o => o.status === 'pending').length;

  if (farmType === 'rural') {
    return {
      total_crop_area: cropsData.length * 2.5,
      active_crops: cropsData.length,
      total_revenue: totalRevenue,
      total_expenses: totalExpenses,
      water_usage: 0,
      pending_orders: pendingOrders,
    };
  } else {
    const waterUsage = irrigationData.reduce((sum, s) => sum + Number(s.daily_water_usage), 0);
    return {
      active_crops: 0,
      active_plants: cropsData.length,
      water_usage: waterUsage,
      total_revenue: totalRevenue,
      total_expenses: totalExpenses,
      pending_orders: pendingOrders,
    };
  }
}
