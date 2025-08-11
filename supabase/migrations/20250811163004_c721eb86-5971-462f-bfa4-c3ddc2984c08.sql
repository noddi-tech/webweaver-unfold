-- Add section column to employees
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'employees' AND column_name = 'section'
  ) THEN
    ALTER TABLE public.employees
    ADD COLUMN section text NOT NULL DEFAULT 'General';
  END IF;
END $$;

-- Create employees_sections table
CREATE TABLE IF NOT EXISTS public.employees_sections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.employees_sections ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='employees_sections' AND policyname='Employees sections are viewable by everyone'
  ) THEN
    CREATE POLICY "Employees sections are viewable by everyone" ON public.employees_sections FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='employees_sections' AND policyname='Employees sections can be managed by authenticated users'
  ) THEN
    CREATE POLICY "Employees sections can be managed by authenticated users" ON public.employees_sections FOR ALL USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname='update_employees_sections_updated_at'
  ) THEN
    CREATE TRIGGER update_employees_sections_updated_at
    BEFORE UPDATE ON public.employees_sections
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_employees_sections_sort_order ON public.employees_sections(sort_order);
CREATE INDEX IF NOT EXISTS idx_employees_section ON public.employees(section);

-- Create employees_settings table
CREATE TABLE IF NOT EXISTS public.employees_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  section_title TEXT NOT NULL DEFAULT 'Our Team',
  section_subtitle TEXT,
  background_token TEXT NOT NULL DEFAULT 'background',
  card_bg_token TEXT NOT NULL DEFAULT 'card',
  border_token TEXT NOT NULL DEFAULT 'border',
  name_token TEXT NOT NULL DEFAULT 'foreground',
  title_token TEXT NOT NULL DEFAULT 'muted-foreground',
  link_token TEXT NOT NULL DEFAULT 'primary'
);

ALTER TABLE public.employees_settings ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='employees_settings' AND policyname='Employees settings are viewable by everyone'
  ) THEN
    CREATE POLICY "Employees settings are viewable by everyone" ON public.employees_settings FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='employees_settings' AND policyname='Employees settings can be managed by authenticated users'
  ) THEN
    CREATE POLICY "Employees settings can be managed by authenticated users" ON public.employees_settings FOR ALL USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname='update_employees_settings_updated_at'
  ) THEN
    CREATE TRIGGER update_employees_settings_updated_at
    BEFORE UPDATE ON public.employees_settings
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
END $$;

-- Seed one settings row if none exist
INSERT INTO public.employees_settings (section_title)
SELECT 'Our Team'
WHERE NOT EXISTS (SELECT 1 FROM public.employees_settings);
