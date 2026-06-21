-- Supabase SQL Setup for TSWheels Vehicle Rental System
-- Run this in your Supabase SQL Editor: https://supabase.com/dashboard/project/ckiqrybmvkogklxjtvun/sql

-- 1. PROFILES TABLE (linked to auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL DEFAULT '',
  email TEXT NOT NULL DEFAULT '',
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Auto-create profile on signup trigger
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, name, email, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    NEW.email,
    CASE WHEN NEW.email = 'admin@example.com' THEN 'admin' ELSE 'user' END
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing trigger if exists, then create
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


-- 2. VEHICLES TABLE
CREATE TABLE IF NOT EXISTS public.vehicles (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  name TEXT NOT NULL,
  type TEXT DEFAULT 'car',
  brand TEXT DEFAULT '',
  model TEXT DEFAULT '',
  year INT DEFAULT 2024,
  images TEXT[] DEFAULT '{}',
  price_hourly NUMERIC DEFAULT 0,
  price_daily NUMERIC DEFAULT 0,
  price_weekly NUMERIC DEFAULT 0,
  engine_capacity TEXT DEFAULT '',
  mileage TEXT DEFAULT '',
  features TEXT[] DEFAULT '{}',
  seats INT DEFAULT 5,
  fuel_type TEXT DEFAULT 'Petrol',
  transmission TEXT DEFAULT 'Automatic',
  availability BOOLEAN DEFAULT true,
  rating NUMERIC DEFAULT 5.0,
  reviews INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.vehicles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Vehicles are viewable by everyone" ON public.vehicles FOR SELECT USING (true);
CREATE POLICY "Admins can insert vehicles" ON public.vehicles FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins can update vehicles" ON public.vehicles FOR UPDATE USING (true);
CREATE POLICY "Admins can delete vehicles" ON public.vehicles FOR DELETE USING (true);


-- 3. BOOKINGS TABLE
CREATE TABLE IF NOT EXISTS public.bookings (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  user_id TEXT NOT NULL,
  vehicle_id TEXT NOT NULL,
  vehicle_name TEXT DEFAULT '',
  start_date TEXT NOT NULL,
  end_date TEXT NOT NULL,
  total_price NUMERIC DEFAULT 0,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled')),
  payment_method TEXT DEFAULT '',
  transaction_id TEXT DEFAULT '',
  customer_name TEXT DEFAULT '',
  customer_email TEXT DEFAULT '',
  customer_phone TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own bookings" ON public.bookings FOR SELECT USING (true);
CREATE POLICY "Users can create bookings" ON public.bookings FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update their bookings" ON public.bookings FOR UPDATE USING (true);
CREATE POLICY "Admins can delete bookings" ON public.bookings FOR DELETE USING (true);


-- 4. SETTINGS TABLE
CREATE TABLE IF NOT EXISTS public.settings (
  id TEXT PRIMARY KEY DEFAULT 'global',
  system_name TEXT DEFAULT 'TSWheels',
  contact_email TEXT DEFAULT 'support@tswheels.com',
  tax_rate NUMERIC DEFAULT 12,
  security_deposit NUMERIC DEFAULT 2000,
  terms_and_conditions TEXT DEFAULT '',
  maintenance_mode BOOLEAN DEFAULT false
);

ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Settings are viewable by everyone" ON public.settings FOR SELECT USING (true);
CREATE POLICY "Settings can be updated" ON public.settings FOR UPDATE USING (true);
CREATE POLICY "Settings can be inserted" ON public.settings FOR INSERT WITH CHECK (true);

-- Insert default settings
INSERT INTO public.settings (id, system_name, contact_email, tax_rate, security_deposit, terms_and_conditions, maintenance_mode)
VALUES ('global', 'TSWheels', 'support@tswheels.com', 12, 2000, 'By renting a vehicle, you agree to return it in the same condition as received.', false)
ON CONFLICT (id) DO NOTHING;


-- 5. ADS TABLE
CREATE TABLE IF NOT EXISTS public.ads (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT DEFAULT '',
  image TEXT DEFAULT '',
  color TEXT DEFAULT '',
  link TEXT DEFAULT ''
);

ALTER TABLE public.ads ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Ads are viewable by everyone" ON public.ads FOR SELECT USING (true);
CREATE POLICY "Ads can be managed" ON public.ads FOR ALL USING (true);


-- 6. Enable Google OAuth (configure in Supabase Dashboard)
-- Go to Authentication > Providers > Google
-- Enable Google provider
-- Add your Google OAuth Client ID and Client Secret
-- Set redirect URL to: https://ckiqrybmvkogklxjtvun.supabase.co/auth/v1/callback


-- 7. NEW SCHEMA FOR THE OVERHAUL (DYNAMIC CONFIGURATIONS & SNAPS)

-- Create Vehicle Categories table
CREATE TABLE IF NOT EXISTS public.vehicle_categories (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  name TEXT NOT NULL UNIQUE,
  description TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on vehicle_categories
ALTER TABLE public.vehicle_categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Categories are viewable by everyone" ON public.vehicle_categories FOR SELECT USING (true);
CREATE POLICY "Categories can be managed by admins" ON public.vehicle_categories FOR ALL USING (true);

-- Create Rental Hubs table
CREATE TABLE IF NOT EXISTS public.rental_hubs (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  name TEXT NOT NULL UNIQUE,
  address TEXT DEFAULT '',
  latitude NUMERIC,
  longitude NUMERIC,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on rental_hubs
ALTER TABLE public.rental_hubs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Hubs are viewable by everyone" ON public.rental_hubs FOR SELECT USING (true);
CREATE POLICY "Hubs can be managed by admins" ON public.rental_hubs FOR ALL USING (true);

-- Add dynamic config settings
ALTER TABLE public.settings ADD COLUMN IF NOT EXISTS min_age NUMERIC DEFAULT 18;
ALTER TABLE public.settings ADD COLUMN IF NOT EXISTS weekly_discount NUMERIC DEFAULT 10;
ALTER TABLE public.settings ADD COLUMN IF NOT EXISTS monthly_discount NUMERIC DEFAULT 20;

-- Update global settings with default configurations
UPDATE public.settings SET
  min_age = COALESCE(min_age, 18),
  weekly_discount = COALESCE(weekly_discount, 10),
  monthly_discount = COALESCE(monthly_discount, 20)
WHERE id = 'global';

-- Add vehicle metadata fields
ALTER TABLE public.vehicles ADD COLUMN IF NOT EXISTS registration_number TEXT DEFAULT '';
ALTER TABLE public.vehicles ADD COLUMN IF NOT EXISTS category TEXT DEFAULT '';
ALTER TABLE public.vehicles ADD COLUMN IF NOT EXISTS rental_hub TEXT DEFAULT '';
ALTER TABLE public.vehicles ADD COLUMN IF NOT EXISTS price_monthly NUMERIC DEFAULT 0;
ALTER TABLE public.vehicles ADD COLUMN IF NOT EXISTS insurance_expiry TEXT DEFAULT '';
ALTER TABLE public.vehicles ADD COLUMN IF NOT EXISTS puc_expiry TEXT DEFAULT '';

-- Add booking metadata & snapshot fields
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS customer_dob TEXT DEFAULT '';
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS customer_age INT DEFAULT 18;
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS customer_blood_group TEXT DEFAULT '';
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS customer_license_number TEXT DEFAULT '';
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS customer_license_expiry TEXT DEFAULT '';
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS customer_emergency_contact TEXT DEFAULT '';
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS customer_address TEXT DEFAULT '';

ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS vehicle_number TEXT DEFAULT '';
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS vehicle_category TEXT DEFAULT '';
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS vehicle_fuel_type TEXT DEFAULT '';
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS vehicle_transmission TEXT DEFAULT '';
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS vehicle_hub TEXT DEFAULT '';
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS vehicle_image TEXT DEFAULT '';

ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS rental_type TEXT DEFAULT 'daily';
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS duration INT DEFAULT 1;

ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS base_price NUMERIC DEFAULT 0;
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS tax_rate NUMERIC DEFAULT 12;
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS tax_amount NUMERIC DEFAULT 0;
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS security_deposit NUMERIC DEFAULT 2000;
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS discount_amount NUMERIC DEFAULT 0;

