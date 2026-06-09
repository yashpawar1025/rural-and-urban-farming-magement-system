-- Create user role enum
CREATE TYPE public.user_role AS ENUM ('user', 'admin');

-- Create farm type enum
CREATE TYPE public.farm_type AS ENUM ('rural', 'urban', 'both');

-- Create growth stage enum
CREATE TYPE public.growth_stage AS ENUM ('seedling', 'vegetative', 'flowering', 'harvest');

-- Create order status enum
CREATE TYPE public.order_status AS ENUM ('pending', 'confirmed', 'shipped', 'delivered');

-- Create alert type enum
CREATE TYPE public.alert_type AS ENUM ('low_water', 'disease_detected', 'weather_warning', 'low_stock', 'maintenance_due');

-- Create profiles table
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username text UNIQUE NOT NULL,
  email text,
  phone text,
  role user_role NOT NULL DEFAULT 'user',
  farm_type farm_type NOT NULL DEFAULT 'both',
  location text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Create crops table
CREATE TABLE public.crops (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name text NOT NULL,
  variety text,
  field_assigned text,
  planting_date date,
  expected_harvest_date date,
  actual_harvest_date date,
  growth_stage growth_stage DEFAULT 'seedling',
  expected_yield numeric,
  actual_yield numeric,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Create livestock table
CREATE TABLE public.livestock (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  animal_type text NOT NULL,
  breed text,
  count integer NOT NULL DEFAULT 1,
  date_acquired date,
  weight numeric,
  condition_notes text,
  last_vet_visit date,
  next_vaccination_date date,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Create inventory table
CREATE TABLE public.inventory (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  item_name text NOT NULL,
  category text NOT NULL,
  quantity numeric NOT NULL DEFAULT 0,
  unit text NOT NULL,
  reorder_threshold numeric NOT NULL DEFAULT 10,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Create equipment table
CREATE TABLE public.equipment (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name text NOT NULL,
  equipment_type text NOT NULL,
  purchase_date date,
  last_maintenance_date date,
  next_maintenance_date date,
  condition text,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Create financial_records table
CREATE TABLE public.financial_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  record_type text NOT NULL CHECK (record_type IN ('income', 'expense')),
  amount numeric NOT NULL,
  category text NOT NULL,
  description text,
  record_date date NOT NULL DEFAULT CURRENT_DATE,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Create products table
CREATE TABLE public.products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  price numeric NOT NULL,
  quantity_available numeric NOT NULL DEFAULT 0,
  image_url text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Create orders table
CREATE TABLE public.orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  seller_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  buyer_name text NOT NULL,
  buyer_contact text,
  quantity numeric NOT NULL,
  total_amount numeric NOT NULL,
  status order_status NOT NULL DEFAULT 'pending',
  payment_status text NOT NULL DEFAULT 'unpaid' CHECK (payment_status IN ('paid', 'unpaid')),
  order_date date NOT NULL DEFAULT CURRENT_DATE,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Create alerts table
CREATE TABLE public.alerts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  alert_type alert_type NOT NULL,
  title text NOT NULL,
  message text NOT NULL,
  is_read boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Create farm_logs table
CREATE TABLE public.farm_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  log_date date NOT NULL DEFAULT CURRENT_DATE,
  activity_type text NOT NULL,
  description text NOT NULL,
  cost numeric DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Create crop_plans table (urban)
CREATE TABLE public.crop_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  location text NOT NULL,
  season text NOT NULL,
  soil_type text NOT NULL,
  available_space numeric NOT NULL,
  recommended_crops jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Create irrigation_schedules table (urban)
CREATE TABLE public.irrigation_schedules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  plant_name text NOT NULL,
  zone text,
  watering_days text[] NOT NULL,
  watering_time time NOT NULL,
  daily_water_usage numeric DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Create diagnoses table
CREATE TABLE public.diagnoses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  plant_name text,
  symptoms text[],
  image_url text,
  diagnosis_result text,
  confidence_score numeric,
  treatment_suggestions text,
  diagnosis_date date NOT NULL DEFAULT CURRENT_DATE,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Create government_schemes table (static data)
CREATE TABLE public.government_schemes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  scheme_name text NOT NULL,
  scheme_type text NOT NULL CHECK (scheme_type IN ('subsidy', 'insurance', 'loan')),
  description text NOT NULL,
  eligibility text NOT NULL,
  application_deadline date,
  link text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Create crop_encyclopedia table (static data)
CREATE TABLE public.crop_encyclopedia (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  image_url text,
  soil_type text NOT NULL,
  growing_season text NOT NULL,
  expected_yield text NOT NULL,
  recommended_fertilizers text,
  description text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Create farm_mapping table
CREATE TABLE public.farm_mapping (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  grid_position text NOT NULL,
  crop_assigned text,
  crop_color text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(owner_id, grid_position)
);

-- Create storage bucket for plant images
INSERT INTO storage.buckets (id, name, public) 
VALUES ('avdw5t0e8yrl_plant_images', 'avdw5t0e8yrl_plant_images', true);

-- Storage policies for plant images
CREATE POLICY "Anyone can view plant images" ON storage.objects FOR SELECT USING (bucket_id = 'avdw5t0e8yrl_plant_images');
CREATE POLICY "Authenticated users can upload plant images" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'avdw5t0e8yrl_plant_images' AND auth.role() = 'authenticated');
CREATE POLICY "Users can update their own plant images" ON storage.objects FOR UPDATE USING (bucket_id = 'avdw5t0e8yrl_plant_images' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users can delete their own plant images" ON storage.objects FOR DELETE USING (bucket_id = 'avdw5t0e8yrl_plant_images' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Create helper function to check admin role
CREATE OR REPLACE FUNCTION is_admin(uid uuid)
RETURNS boolean LANGUAGE sql SECURITY DEFINER AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles p
    WHERE p.id = uid AND p.role = 'admin'::user_role
  );
$$;

-- Profiles RLS policies
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins have full access to profiles" ON profiles FOR ALL TO authenticated USING (is_admin(auth.uid()));
CREATE POLICY "Users can view their own profile" ON profiles FOR SELECT TO authenticated USING (auth.uid() = id);
CREATE POLICY "Users can update their own profile" ON profiles FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (role IS NOT DISTINCT FROM (SELECT role FROM profiles WHERE id = auth.uid()));

-- Crops RLS policies
ALTER TABLE crops ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own crops" ON crops FOR ALL TO authenticated USING (auth.uid() = owner_id);

-- Livestock RLS policies
ALTER TABLE livestock ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own livestock" ON livestock FOR ALL TO authenticated USING (auth.uid() = owner_id);

-- Inventory RLS policies
ALTER TABLE inventory ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own inventory" ON inventory FOR ALL TO authenticated USING (auth.uid() = owner_id);

-- Equipment RLS policies
ALTER TABLE equipment ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own equipment" ON equipment FOR ALL TO authenticated USING (auth.uid() = owner_id);

-- Financial records RLS policies
ALTER TABLE financial_records ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own financial records" ON financial_records FOR ALL TO authenticated USING (auth.uid() = owner_id);

-- Products RLS policies
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view products" ON products FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can manage their own products" ON products FOR INSERT TO authenticated WITH CHECK (auth.uid() = owner_id);
CREATE POLICY "Users can update their own products" ON products FOR UPDATE TO authenticated USING (auth.uid() = owner_id);
CREATE POLICY "Users can delete their own products" ON products FOR DELETE TO authenticated USING (auth.uid() = owner_id);

-- Orders RLS policies
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Sellers can view their orders" ON orders FOR SELECT TO authenticated USING (auth.uid() = seller_id);
CREATE POLICY "Sellers can manage their orders" ON orders FOR ALL TO authenticated USING (auth.uid() = seller_id);

-- Alerts RLS policies
ALTER TABLE alerts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own alerts" ON alerts FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can update their own alerts" ON alerts FOR UPDATE TO authenticated USING (auth.uid() = user_id);

-- Farm logs RLS policies
ALTER TABLE farm_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own farm logs" ON farm_logs FOR ALL TO authenticated USING (auth.uid() = owner_id);

-- Crop plans RLS policies
ALTER TABLE crop_plans ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own crop plans" ON crop_plans FOR ALL TO authenticated USING (auth.uid() = owner_id);

-- Irrigation schedules RLS policies
ALTER TABLE irrigation_schedules ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own irrigation schedules" ON irrigation_schedules FOR ALL TO authenticated USING (auth.uid() = owner_id);

-- Diagnoses RLS policies
ALTER TABLE diagnoses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own diagnoses" ON diagnoses FOR ALL TO authenticated USING (auth.uid() = owner_id);

-- Government schemes RLS policies (read-only for all)
ALTER TABLE government_schemes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view government schemes" ON government_schemes FOR SELECT TO authenticated USING (true);

-- Crop encyclopedia RLS policies (read-only for all)
ALTER TABLE crop_encyclopedia ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view crop encyclopedia" ON crop_encyclopedia FOR SELECT TO authenticated USING (true);

-- Farm mapping RLS policies
ALTER TABLE farm_mapping ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own farm mapping" ON farm_mapping FOR ALL TO authenticated USING (auth.uid() = owner_id);

-- Auto-sync users to profiles
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  user_count int;
  extracted_username text;
BEGIN
  SELECT COUNT(*) INTO user_count FROM profiles;
  
  -- Extract username from email (remove @miaoda.com)
  extracted_username := REPLACE(NEW.email, '@miaoda.com', '');
  
  INSERT INTO public.profiles (id, username, email, phone, role, farm_type)
  VALUES (
    NEW.id,
    extracted_username,
    NEW.email,
    NEW.phone,
    CASE WHEN user_count = 0 THEN 'admin'::public.user_role ELSE 'user'::public.user_role END,
    'both'::public.farm_type
  );
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_confirmed ON auth.users;
CREATE TRIGGER on_auth_user_confirmed
  AFTER UPDATE ON auth.users
  FOR EACH ROW
  WHEN (OLD.confirmed_at IS NULL AND NEW.confirmed_at IS NOT NULL)
  EXECUTE FUNCTION handle_new_user();