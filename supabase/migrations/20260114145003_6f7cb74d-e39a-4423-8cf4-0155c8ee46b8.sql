-- Create sales_contact_settings table for centralized configuration
CREATE TABLE public.sales_contact_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  setting_key TEXT NOT NULL UNIQUE,
  
  -- For contact type settings (references employees)
  employee_id UUID REFERENCES public.employees(id) ON DELETE SET NULL,
  
  -- For URL/value type settings
  value TEXT,
  label TEXT,
  
  -- General
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.sales_contact_settings ENABLE ROW LEVEL SECURITY;

-- Allow public read access (these are public settings)
CREATE POLICY "Sales contact settings are publicly readable"
ON public.sales_contact_settings
FOR SELECT
USING (true);

-- Allow authenticated users with admin/editor role to manage
CREATE POLICY "Admins can manage sales contact settings"
ON public.sales_contact_settings
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'editor')
  )
);

-- Create trigger for updated_at
CREATE TRIGGER update_sales_contact_settings_updated_at
BEFORE UPDATE ON public.sales_contact_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default settings
-- First, get employee IDs for Joachim and Tom-Arne
INSERT INTO public.sales_contact_settings (setting_key, employee_id, value, label) VALUES
  ('primary_contact', (SELECT id FROM public.employees WHERE name ILIKE '%Joachim%' LIMIT 1), NULL, 'Primary Sales Contact'),
  ('secondary_contact', (SELECT id FROM public.employees WHERE name ILIKE '%Tom-Arne%' OR name ILIKE '%Tom Arne%' LIMIT 1), NULL, 'Secondary Sales Contact'),
  ('booking_url', NULL, 'https://calendly.com/joachim-noddi/30min', 'Book a meeting'),
  ('sales_email', NULL, 'sales@info.naviosolutions.com', 'Sales Email'),
  ('sales_phone', NULL, '+47 413 54 569', 'Sales Phone')
ON CONFLICT (setting_key) DO NOTHING;