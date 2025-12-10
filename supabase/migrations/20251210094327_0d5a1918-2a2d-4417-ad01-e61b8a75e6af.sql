-- Add shadow_class column to background_styles
ALTER TABLE background_styles ADD COLUMN IF NOT EXISTS shadow_class TEXT DEFAULT 'shadow-none';

-- Create card_style_presets table for saving favorite configurations
CREATE TABLE IF NOT EXISTS card_style_presets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  background_class TEXT NOT NULL,
  text_color_class TEXT NOT NULL DEFAULT 'foreground',
  icon_color_token TEXT DEFAULT 'primary',
  icon_size TEXT DEFAULT 'default',
  shadow_class TEXT DEFAULT 'shadow-none',
  border_radius TEXT DEFAULT 'rounded-2xl',
  is_system_preset BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE card_style_presets ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Card style presets are viewable by everyone" 
ON card_style_presets FOR SELECT USING (true);

CREATE POLICY "Admins can manage card style presets" 
ON card_style_presets FOR ALL USING (is_admin()) WITH CHECK (is_admin());

-- Insert system presets
INSERT INTO card_style_presets (name, description, background_class, text_color_class, icon_color_token, shadow_class, is_system_preset) VALUES
  ('Mesh Velvet', 'Light purple gradient with dark text', 'bg-gradient-mesh-velvet', 'foreground', 'primary', 'shadow-lg', true),
  ('Hero Purple', 'Deep purple gradient with white text', 'bg-gradient-hero', 'white', 'white', 'shadow-xl', true),
  ('Glass Card', 'Frosted glass effect', 'glass-card', 'foreground', 'primary', 'shadow-md', true),
  ('Ocean Mesh', 'Blue-teal gradient', 'bg-gradient-mesh-ocean', 'white', 'white', 'shadow-lg', true),
  ('Sunset Warm', 'Orange-purple gradient', 'bg-gradient-warmth', 'white', 'white', 'shadow-xl', true),
  ('Clean White', 'Solid white background', 'bg-card', 'foreground', 'primary', 'shadow-sm', true),
  ('Primary Solid', 'Federal blue solid background', 'bg-primary', 'white', 'white', 'shadow-lg', true),
  ('Vibrant Purple', 'Bright purple accent', 'bg-vibrant-purple', 'white', 'white', 'shadow-xl', true)
ON CONFLICT DO NOTHING;

-- Trigger for updated_at
CREATE TRIGGER update_card_style_presets_updated_at
BEFORE UPDATE ON card_style_presets
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();