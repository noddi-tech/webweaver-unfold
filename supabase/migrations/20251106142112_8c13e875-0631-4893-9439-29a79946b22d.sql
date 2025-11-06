-- Phase 1: Add gradient-primary to database as the canonical default gradient
INSERT INTO color_tokens (
  css_var, 
  label, 
  value, 
  description, 
  color_type, 
  category, 
  preview_class, 
  optimal_text_color, 
  sort_order, 
  active
) VALUES (
  '--gradient-primary',
  'Gradient Primary (Default)',
  'linear-gradient(135deg, hsl(249 67% 24%), hsl(266 85% 58%))',
  'Default gradient for icons, badges, and primary UI elements',
  'gradient',
  'gradients',
  'bg-gradient-primary',
  'white',
  0,
  true
) ON CONFLICT (css_var) DO UPDATE SET
  label = EXCLUDED.label,
  value = EXCLUDED.value,
  description = EXCLUDED.description,
  preview_class = EXCLUDED.preview_class,
  sort_order = EXCLUDED.sort_order;

-- Phase 2: Create icon_styles table for CMS-managed icon backgrounds
CREATE TABLE IF NOT EXISTS icon_styles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  element_id text UNIQUE NOT NULL,
  background_token text NOT NULL DEFAULT 'gradient-primary',
  icon_name text,
  icon_color_token text DEFAULT 'primary-foreground',
  size text DEFAULT 'default' CHECK (size IN ('sm', 'default', 'lg', 'xl')),
  shape text DEFAULT 'rounded-xl',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE icon_styles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Icon styles viewable by everyone" 
  ON icon_styles FOR SELECT USING (true);

CREATE POLICY "Icon styles manageable by authenticated users" 
  ON icon_styles FOR ALL 
  USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);

-- Add trigger for updated_at
CREATE TRIGGER update_icon_styles_updated_at
  BEFORE UPDATE ON icon_styles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();