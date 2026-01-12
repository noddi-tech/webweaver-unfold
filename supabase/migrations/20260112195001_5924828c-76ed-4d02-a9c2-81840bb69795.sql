-- Create pricing tiers configuration table (for Launch and Scale base settings)
CREATE TABLE public.pricing_tiers_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tier_type TEXT NOT NULL CHECK (tier_type IN ('launch', 'scale')),
  
  -- Fixed costs (in EUR)
  fixed_monthly_cost NUMERIC NOT NULL DEFAULT 0,
  per_department_cost NUMERIC DEFAULT 0,
  
  -- Revenue percentage (as decimal, e.g., 0.03 for 3%)
  revenue_percentage NUMERIC NOT NULL DEFAULT 0.03,
  
  -- Display info
  name TEXT NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  
  UNIQUE(tier_type)
);

-- Create Scale revenue tiers table (15 tiers)
CREATE TABLE public.pricing_scale_tiers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tier_number INTEGER NOT NULL UNIQUE CHECK (tier_number BETWEEN 1 AND 15),
  
  -- Revenue threshold (in EUR)
  revenue_threshold NUMERIC NOT NULL,
  
  -- Take rate (as decimal, e.g., 0.015 for 1.5%)
  take_rate NUMERIC NOT NULL,
  
  -- Metadata for display
  revenue_multiplier NUMERIC,
  rate_reduction NUMERIC,
  
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.pricing_tiers_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pricing_scale_tiers ENABLE ROW LEVEL SECURITY;

-- Public read access for pricing display
CREATE POLICY "Anyone can view pricing config"
  ON public.pricing_tiers_config FOR SELECT
  USING (true);

CREATE POLICY "Anyone can view scale tiers"
  ON public.pricing_scale_tiers FOR SELECT
  USING (true);

-- Admin write access
CREATE POLICY "Admins can manage pricing config"
  ON public.pricing_tiers_config FOR ALL
  USING (public.is_admin());

CREATE POLICY "Admins can manage scale tiers"
  ON public.pricing_scale_tiers FOR ALL
  USING (public.is_admin());

-- Seed Launch tier config
INSERT INTO public.pricing_tiers_config (tier_type, fixed_monthly_cost, per_department_cost, revenue_percentage, name, description)
VALUES (
  'launch',
  500,
  0,
  0.03,
  'Launch',
  'Perfect for single locations and businesses under €1M revenue'
);

-- Seed Scale tier config
INSERT INTO public.pricing_tiers_config (tier_type, fixed_monthly_cost, per_department_cost, revenue_percentage, name, description)
VALUES (
  'scale',
  1000,
  100,
  0.015,
  'Scale',
  'For multi-location businesses with tiered revenue pricing'
);

-- Seed the 15 Scale revenue tiers
-- Tier 1: €1M at 1.5%
-- Tier 2: €2M at 1.4% (×2, -0.1%)
-- Tier 3: €3M at 1.3% (×1.5, -0.1%)
-- Tier 4+: ×1.5, -0.05%
INSERT INTO public.pricing_scale_tiers (tier_number, revenue_threshold, take_rate, revenue_multiplier, rate_reduction)
VALUES
  (1,  1000000,    0.0150, NULL, NULL),
  (2,  2000000,    0.0140, 2.0,  0.001),
  (3,  3000000,    0.0130, 1.5,  0.001),
  (4,  4500000,    0.0125, 1.5,  0.0005),
  (5,  6750000,    0.0120, 1.5,  0.0005),
  (6,  10125000,   0.0115, 1.5,  0.0005),
  (7,  15187500,   0.0110, 1.5,  0.0005),
  (8,  22781250,   0.0105, 1.5,  0.0005),
  (9,  34171875,   0.0100, 1.5,  0.0005),
  (10, 51257813,   0.0095, 1.5,  0.0005),
  (11, 76886719,   0.0090, 1.5,  0.0005),
  (12, 115330078,  0.0085, 1.5,  0.0005),
  (13, 172995117,  0.0080, 1.5,  0.0005),
  (14, 259492676,  0.0075, 1.5,  0.0005),
  (15, 389239014,  0.0070, 1.5,  0.0005);

-- Create updated_at triggers
CREATE TRIGGER update_pricing_tiers_config_updated_at
  BEFORE UPDATE ON public.pricing_tiers_config
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_pricing_scale_tiers_updated_at
  BEFORE UPDATE ON public.pricing_scale_tiers
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();