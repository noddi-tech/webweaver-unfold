-- Create tables for Contact CMS
-- 1) contact_form_content
CREATE TABLE IF NOT EXISTS public.contact_form_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL DEFAULT 'Send us a message',
  description TEXT DEFAULT 'Fill out the form below and we\'ll get back to you as soon as possible.',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2) contact_methods (Get in touch)
CREATE TABLE IF NOT EXISTS public.contact_methods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL CHECK (type IN ('email','phone','address')),
  label TEXT NOT NULL,
  value TEXT NOT NULL,
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_contact_methods_order ON public.contact_methods(order_index);

-- 3) business_hours
CREATE TABLE IF NOT EXISTS public.business_hours (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  day_of_week SMALLINT NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
  open_time TEXT,
  close_time TEXT,
  is_closed BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT uniq_business_hours_day UNIQUE(day_of_week)
);
CREATE INDEX IF NOT EXISTS idx_business_hours_day ON public.business_hours(day_of_week);

-- Enable Row Level Security
ALTER TABLE public.contact_form_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_methods ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.business_hours ENABLE ROW LEVEL SECURITY;

-- Policies: Public read, authenticated write
DO $$ BEGIN
  -- contact_form_content policies
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'contact_form_content' AND policyname = 'Public can read contact_form_content'
  ) THEN
    CREATE POLICY "Public can read contact_form_content" ON public.contact_form_content
      FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'contact_form_content' AND policyname = 'Authenticated can write contact_form_content'
  ) THEN
    CREATE POLICY "Authenticated can write contact_form_content" ON public.contact_form_content
      FOR ALL USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);
  END IF;

  -- contact_methods policies
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'contact_methods' AND policyname = 'Public can read contact_methods'
  ) THEN
    CREATE POLICY "Public can read contact_methods" ON public.contact_methods
      FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'contact_methods' AND policyname = 'Authenticated can write contact_methods'
  ) THEN
    CREATE POLICY "Authenticated can write contact_methods" ON public.contact_methods
      FOR ALL USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);
  END IF;

  -- business_hours policies
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'business_hours' AND policyname = 'Public can read business_hours'
  ) THEN
    CREATE POLICY "Public can read business_hours" ON public.business_hours
      FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'business_hours' AND policyname = 'Authenticated can write business_hours'
  ) THEN
    CREATE POLICY "Authenticated can write business_hours" ON public.business_hours
      FOR ALL USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);
  END IF;
END $$;

-- Timestamps trigger function exists: public.update_updated_at_column
-- Create triggers to auto-update updated_at on update
DO $$ BEGIN
  -- contact_form_content trigger
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'trg_contact_form_content_updated_at'
  ) THEN
    CREATE TRIGGER trg_contact_form_content_updated_at
    BEFORE UPDATE ON public.contact_form_content
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
  END IF;

  -- contact_methods trigger
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'trg_contact_methods_updated_at'
  ) THEN
    CREATE TRIGGER trg_contact_methods_updated_at
    BEFORE UPDATE ON public.contact_methods
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
  END IF;

  -- business_hours trigger
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'trg_business_hours_updated_at'
  ) THEN
    CREATE TRIGGER trg_business_hours_updated_at
    BEFORE UPDATE ON public.business_hours
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
END $$;