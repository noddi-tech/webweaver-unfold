-- Create features table for CMS-managed features
CREATE TABLE IF NOT EXISTS public.features (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  icon_name TEXT NOT NULL DEFAULT 'Sparkles',
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.features ENABLE ROW LEVEL SECURITY;

-- Policy: Features are viewable by everyone
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'features' AND policyname = 'Features are viewable by everyone'
  ) THEN
    CREATE POLICY "Features are viewable by everyone"
    ON public.features
    FOR SELECT
    USING (true);
  END IF;
END $$;

-- Policy: Features can be managed by authenticated users
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'features' AND policyname = 'Features can be managed by authenticated users'
  ) THEN
    CREATE POLICY "Features can be managed by authenticated users"
    ON public.features
    FOR ALL
    USING (auth.uid() IS NOT NULL)
    WITH CHECK (auth.uid() IS NOT NULL);
  END IF;
END $$;

-- Trigger to keep updated_at fresh
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'update_features_updated_at'
  ) THEN
    CREATE TRIGGER update_features_updated_at
    BEFORE UPDATE ON public.features
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
END $$;

-- Helpful index for ordering
CREATE INDEX IF NOT EXISTS idx_features_sort_order ON public.features (sort_order);
