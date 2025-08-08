-- Brand settings for logo
CREATE TABLE IF NOT EXISTS public.brand_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  logo_text TEXT,
  logo_variant TEXT NOT NULL DEFAULT 'text', -- 'text' (wordmark) for now
  gradient_token TEXT NOT NULL DEFAULT 'gradient-primary',
  text_token TEXT NOT NULL DEFAULT 'foreground',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS and policies
ALTER TABLE public.brand_settings ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  CREATE POLICY "Brand settings are viewable by everyone"
  ON public.brand_settings FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY "Brand settings can be managed by authenticated users"
  ON public.brand_settings FOR ALL USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Trigger for updated_at
DO $$ BEGIN
  CREATE TRIGGER update_brand_settings_updated_at
  BEFORE UPDATE ON public.brand_settings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- USPs table
CREATE TABLE IF NOT EXISTS public.usps (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  icon_name TEXT NOT NULL DEFAULT 'Sparkles',
  href TEXT,
  bg_token TEXT NOT NULL DEFAULT 'secondary',
  text_token TEXT NOT NULL DEFAULT 'foreground',
  location TEXT NOT NULL DEFAULT 'hero', -- e.g., 'hero', 'features', 'global'
  active BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- RLS and policies for USPs
ALTER TABLE public.usps ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  CREATE POLICY "USPs are viewable by everyone"
  ON public.usps FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY "USPs can be managed by authenticated users"
  ON public.usps FOR ALL USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Helpful index
CREATE INDEX IF NOT EXISTS usps_active_location_sort_idx ON public.usps (active, location, sort_order);

-- Trigger for updated_at
DO $$ BEGIN
  CREATE TRIGGER update_usps_updated_at
  BEFORE UPDATE ON public.usps
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
EXCEPTION WHEN duplicate_object THEN NULL; END $$;