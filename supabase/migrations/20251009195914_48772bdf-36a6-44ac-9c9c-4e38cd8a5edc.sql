-- Create Languages Table
CREATE TABLE public.languages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  native_name TEXT NOT NULL,
  flag_code TEXT NOT NULL,
  enabled BOOLEAN NOT NULL DEFAULT true,
  is_default BOOLEAN NOT NULL DEFAULT false,
  sort_order INTEGER DEFAULT 0,
  rtl BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Insert all 16 languages
INSERT INTO public.languages (code, name, native_name, flag_code, enabled, is_default, sort_order) VALUES
  ('en', 'English', 'English', 'GB', true, true, 1),
  ('de', 'German', 'Deutsch', 'DE', true, false, 2),
  ('fr', 'French', 'Français', 'FR', true, false, 3),
  ('es', 'Spanish', 'Español', 'ES', true, false, 4),
  ('it', 'Italian', 'Italiano', 'IT', true, false, 5),
  ('pt', 'Portuguese', 'Português', 'PT', true, false, 6),
  ('nl', 'Dutch', 'Nederlands', 'NL', true, false, 7),
  ('pl', 'Polish', 'Polski', 'PL', true, false, 8),
  ('sv', 'Swedish', 'Svenska', 'SE', true, false, 9),
  ('no', 'Norwegian', 'Norsk', 'NO', true, false, 10),
  ('da', 'Danish', 'Dansk', 'DK', true, false, 11),
  ('fi', 'Finnish', 'Suomi', 'FI', true, false, 12),
  ('cs', 'Czech', 'Čeština', 'CZ', true, false, 13),
  ('hu', 'Hungarian', 'Magyar', 'HU', true, false, 14),
  ('ro', 'Romanian', 'Română', 'RO', true, false, 15),
  ('el', 'Greek', 'Ελληνικά', 'GR', true, false, 16);

-- RLS policies for languages
ALTER TABLE public.languages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Languages are viewable by everyone"
  ON public.languages FOR SELECT
  USING (true);

CREATE POLICY "Languages can be managed by authenticated users"
  ON public.languages FOR ALL
  USING (auth.uid() IS NOT NULL);

-- Update trigger for languages
CREATE TRIGGER update_languages_updated_at
  BEFORE UPDATE ON public.languages
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create Translations Table
CREATE TABLE public.translations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  translation_key TEXT NOT NULL,
  language_code TEXT NOT NULL REFERENCES public.languages(code) ON DELETE CASCADE,
  translated_text TEXT NOT NULL,
  context TEXT,
  page_location TEXT,
  approved BOOLEAN NOT NULL DEFAULT false,
  approved_by UUID REFERENCES auth.users(id),
  approved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(translation_key, language_code)
);

-- Indexes for translations
CREATE INDEX idx_translations_key ON public.translations(translation_key);
CREATE INDEX idx_translations_lang ON public.translations(language_code);
CREATE INDEX idx_translations_page ON public.translations(page_location);
CREATE INDEX idx_translations_approved ON public.translations(approved);

-- RLS policies for translations
ALTER TABLE public.translations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Translations are viewable by everyone"
  ON public.translations FOR SELECT
  USING (true);

CREATE POLICY "Translations can be managed by authenticated users"
  ON public.translations FOR ALL
  USING (auth.uid() IS NOT NULL);

-- Update trigger for translations
CREATE TRIGGER update_translations_updated_at
  BEFORE UPDATE ON public.translations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create Language Settings Table
CREATE TABLE public.language_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  enable_browser_detection BOOLEAN NOT NULL DEFAULT true,
  show_language_switcher_header BOOLEAN NOT NULL DEFAULT true,
  show_language_switcher_footer BOOLEAN NOT NULL DEFAULT true,
  default_language_code TEXT NOT NULL DEFAULT 'en' REFERENCES public.languages(code),
  fallback_language_code TEXT NOT NULL DEFAULT 'en' REFERENCES public.languages(code),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Insert default settings
INSERT INTO public.language_settings (id) VALUES (gen_random_uuid());

-- RLS policies for language_settings
ALTER TABLE public.language_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Language settings are viewable by everyone"
  ON public.language_settings FOR SELECT
  USING (true);

CREATE POLICY "Language settings can be managed by authenticated users"
  ON public.language_settings FOR ALL
  USING (auth.uid() IS NOT NULL);

-- Update trigger for language_settings
CREATE TRIGGER update_language_settings_updated_at
  BEFORE UPDATE ON public.language_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create Translation Stats View (fixed GROUP BY)
CREATE VIEW translation_stats AS
SELECT 
  l.code,
  l.name,
  l.enabled,
  l.sort_order,
  COUNT(t.id) as total_translations,
  COUNT(CASE WHEN t.approved THEN 1 END) as approved_translations,
  ROUND(COUNT(CASE WHEN t.approved THEN 1 END)::NUMERIC / NULLIF(COUNT(t.id), 0) * 100, 2) as approval_percentage
FROM languages l
LEFT JOIN translations t ON l.code = t.language_code
GROUP BY l.code, l.name, l.enabled, l.sort_order
ORDER BY l.sort_order;