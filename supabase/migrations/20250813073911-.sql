-- Contact CMS schema
-- 1) contact_settings
CREATE TABLE IF NOT EXISTS public.contact_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  section_title TEXT NOT NULL DEFAULT 'Contact Us',
  section_subtitle TEXT,
  background_token TEXT NOT NULL DEFAULT 'background',
  card_bg_token TEXT NOT NULL DEFAULT 'card',
  border_token TEXT NOT NULL DEFAULT 'border',
  icon_token TEXT NOT NULL DEFAULT 'primary',
  title_token TEXT NOT NULL DEFAULT 'foreground',
  description_token TEXT NOT NULL DEFAULT 'muted-foreground'
);

-- 2) contact_items
CREATE TABLE IF NOT EXISTS public.contact_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  label TEXT NOT NULL,
  value TEXT,
  icon_name TEXT NOT NULL DEFAULT 'Mail',
  href TEXT,
  active BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER DEFAULT 0
);

-- 3) business_hours
CREATE TABLE IF NOT EXISTS public.business_hours (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  day_label TEXT NOT NULL,
  time_value TEXT NOT NULL,
  active BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER DEFAULT 0
);

-- Enable RLS
ALTER TABLE public.contact_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.business_hours ENABLE ROW LEVEL SECURITY;

-- Policies: viewable by everyone
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='contact_settings' AND policyname='Contact settings are viewable by everyone'
  ) THEN
    CREATE POLICY "Contact settings are viewable by everyone"
    ON public.contact_settings FOR SELECT USING (true);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='contact_items' AND policyname='Contact items are viewable by everyone'
  ) THEN
    CREATE POLICY "Contact items are viewable by everyone"
    ON public.contact_items FOR SELECT USING (true);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='business_hours' AND policyname='Business hours are viewable by everyone'
  ) THEN
    CREATE POLICY "Business hours are viewable by everyone"
    ON public.business_hours FOR SELECT USING (true);
  END IF;
END $$;

-- Policies: manageable by authenticated users
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='contact_settings' AND policyname='Contact settings can be managed by authenticated users'
  ) THEN
    CREATE POLICY "Contact settings can be managed by authenticated users"
    ON public.contact_settings FOR ALL
    USING (auth.uid() IS NOT NULL)
    WITH CHECK (auth.uid() IS NOT NULL);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='contact_items' AND policyname='Contact items can be managed by authenticated users'
  ) THEN
    CREATE POLICY "Contact items can be managed by authenticated users"
    ON public.contact_items FOR ALL
    USING (auth.uid() IS NOT NULL)
    WITH CHECK (auth.uid() IS NOT NULL);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='business_hours' AND policyname='Business hours can be managed by authenticated users'
  ) THEN
    CREATE POLICY "Business hours can be managed by authenticated users"
    ON public.business_hours FOR ALL
    USING (auth.uid() IS NOT NULL)
    WITH CHECK (auth.uid() IS NOT NULL);
  END IF;
END $$;

-- Trigger to auto-update updated_at
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'trg_contact_settings_updated_at'
  ) THEN
    CREATE TRIGGER trg_contact_settings_updated_at
    BEFORE UPDATE ON public.contact_settings
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'trg_contact_items_updated_at'
  ) THEN
    CREATE TRIGGER trg_contact_items_updated_at
    BEFORE UPDATE ON public.contact_items
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'trg_business_hours_updated_at'
  ) THEN
    CREATE TRIGGER trg_business_hours_updated_at
    BEFORE UPDATE ON public.business_hours
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
END $$;

-- Optional: seed default rows if empty
INSERT INTO public.contact_settings (section_title, section_subtitle)
SELECT 'Contact Us', 'We\'re here to help you succeed.'
WHERE NOT EXISTS (SELECT 1 FROM public.contact_settings);

INSERT INTO public.contact_items (label, value, icon_name, href, sort_order)
SELECT * FROM (VALUES
  ('Email', 'hello@nodditech.com', 'Mail', 'mailto:hello@nodditech.com', 0),
  ('Phone', '+1 (555) 123-4567', 'Phone', 'tel:+15551234567', 1),
  ('Office', '123 Innovation Drive, Tech City, TC 12345', 'MapPin', NULL, 2)
) AS v(label, value, icon_name, href, sort_order)
WHERE NOT EXISTS (SELECT 1 FROM public.contact_items);

INSERT INTO public.business_hours (day_label, time_value, sort_order)
SELECT * FROM (VALUES
  ('Monday - Friday', '9:00 AM - 6:00 PM', 0),
  ('Saturday', '10:00 AM - 4:00 PM', 1),
  ('Sunday', 'Closed', 2)
) AS v(day_label, time_value, sort_order)
WHERE NOT EXISTS (SELECT 1 FROM public.business_hours);