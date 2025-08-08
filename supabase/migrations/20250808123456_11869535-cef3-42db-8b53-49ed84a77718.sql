-- Create features_settings table for styling and copy control of Features section
CREATE TABLE IF NOT EXISTS public.features_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  section_title TEXT NOT NULL DEFAULT 'Platform Benefits',
  section_subtitle TEXT,
  background_token TEXT NOT NULL DEFAULT 'background',
  card_bg_token TEXT NOT NULL DEFAULT 'card',
  border_token TEXT NOT NULL DEFAULT 'border',
  icon_token TEXT NOT NULL DEFAULT 'primary',
  title_token TEXT NOT NULL DEFAULT 'foreground',
  description_token TEXT NOT NULL DEFAULT 'muted-foreground',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.features_settings ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'features_settings' AND policyname = 'Features settings are viewable by everyone'
  ) THEN
    CREATE POLICY "Features settings are viewable by everyone"
    ON public.features_settings
    FOR SELECT
    USING (true);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'features_settings' AND policyname = 'Features settings can be managed by authenticated users'
  ) THEN
    CREATE POLICY "Features settings can be managed by authenticated users"
    ON public.features_settings
    FOR ALL
    USING (auth.uid() IS NOT NULL)
    WITH CHECK (auth.uid() IS NOT NULL);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'update_features_settings_updated_at'
  ) THEN
    CREATE TRIGGER update_features_settings_updated_at
    BEFORE UPDATE ON public.features_settings
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
END $$;

-- Seed a default row if table is empty
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.features_settings) THEN
    INSERT INTO public.features_settings
      (section_title, section_subtitle, background_token, card_bg_token, border_token, icon_token, title_token, description_token)
    VALUES
      ('Platform Benefits', 'Our comprehensive platform transforms how automotive maintenance providers operate, delivering efficiency, visibility, and growth.', 'background', 'card', 'border', 'primary', 'foreground', 'muted-foreground');
  END IF;
END $$;