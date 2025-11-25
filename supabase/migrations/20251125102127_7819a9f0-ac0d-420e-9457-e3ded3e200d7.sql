-- Create typography_settings table for font management
CREATE TABLE typography_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Primary Font
  font_family_name TEXT NOT NULL DEFAULT 'Atkinson Hyperlegible Next',
  font_source TEXT NOT NULL DEFAULT 'google', -- 'google' | 'self-hosted' | 'system'
  font_google_url TEXT DEFAULT 'https://fonts.googleapis.com/css2?family=Atkinson+Hyperlegible+Next:ital,wght@0,100..800;1,100..800&display=swap',
  font_files JSONB DEFAULT '[]', -- For self-hosted: [{weight, style, url, format}]
  fallback_fonts TEXT[] DEFAULT ARRAY['system-ui', '-apple-system', 'sans-serif'],
  
  -- Mono Font (for code)
  mono_font_family_name TEXT DEFAULT 'Atkinson Hyperlegible Mono',
  mono_font_source TEXT DEFAULT 'google',
  mono_font_google_url TEXT DEFAULT 'https://fonts.googleapis.com/css2?family=Atkinson+Hyperlegible+Mono:wght@400;700&display=swap',
  mono_font_files JSONB DEFAULT '[]',
  mono_fallback_fonts TEXT[] DEFAULT ARRAY['ui-monospace', 'SFMono-Regular', 'monospace'],
  
  -- Typography Scale (sizes, weights, line heights) - replaces localStorage
  typography_scale JSONB DEFAULT '[]',
  
  -- Meta
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default settings
INSERT INTO typography_settings (id) VALUES (gen_random_uuid());

-- Enable RLS
ALTER TABLE typography_settings ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Typography settings are viewable by everyone"
ON typography_settings FOR SELECT USING (true);

CREATE POLICY "Typography settings can be managed by authenticated users"
ON typography_settings FOR ALL USING (auth.uid() IS NOT NULL);

-- Trigger for updated_at
CREATE TRIGGER update_typography_settings_updated_at
BEFORE UPDATE ON typography_settings
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();