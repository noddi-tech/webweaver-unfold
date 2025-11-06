-- Extend color_tokens table to store complete color system metadata
ALTER TABLE color_tokens 
ADD COLUMN IF NOT EXISTS label text,
ADD COLUMN IF NOT EXISTS color_type text DEFAULT 'solid' CHECK (color_type IN ('solid', 'gradient', 'glass')),
ADD COLUMN IF NOT EXISTS category text DEFAULT 'surfaces' CHECK (category IN ('surfaces', 'text', 'interactive', 'feedback', 'gradients', 'glass')),
ADD COLUMN IF NOT EXISTS optimal_text_color text DEFAULT 'auto',
ADD COLUMN IF NOT EXISTS preview_class text,
ADD COLUMN IF NOT EXISTS sort_order integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS active boolean DEFAULT true;

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_color_tokens_active_type ON color_tokens(active, color_type, category);

-- Insert gradient colors from colorSystem.ts
INSERT INTO color_tokens (css_var, value, label, description, color_type, category, optimal_text_color, preview_class, sort_order, active)
VALUES 
  ('--gradient-hero', 'linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(var(--primary-glow)) 50%, hsl(var(--secondary)) 100%)', 'Hero Gradient', 'Primary brand gradient with glow effect', 'gradient', 'gradients', 'white', 'bg-gradient-hero', 1, true),
  ('--gradient-sunset', 'linear-gradient(135deg, hsl(var(--orange-500)) 0%, hsl(var(--pink-500)) 100%)', 'Sunset', 'Warm orange to pink gradient', 'gradient', 'gradients', 'white', 'bg-gradient-sunset', 2, true),
  ('--gradient-ocean', 'linear-gradient(135deg, hsl(var(--blue-500)) 0%, hsl(var(--cyan-500)) 100%)', 'Ocean', 'Cool blue to cyan gradient', 'gradient', 'gradients', 'white', 'bg-gradient-ocean', 3, true),
  ('--gradient-forest', 'linear-gradient(135deg, hsl(var(--green-600)) 0%, hsl(var(--emerald-400)) 100%)', 'Forest', 'Deep green to emerald gradient', 'gradient', 'gradients', 'white', 'bg-gradient-forest', 4, true),
  ('--gradient-aurora', 'linear-gradient(135deg, hsl(var(--purple-500)) 0%, hsl(var(--pink-400)) 50%, hsl(var(--blue-400)) 100%)', 'Aurora', 'Purple to pink to blue gradient', 'gradient', 'gradients', 'white', 'bg-gradient-aurora', 5, true),
  ('--gradient-fire', 'linear-gradient(135deg, hsl(var(--red-600)) 0%, hsl(var(--orange-500)) 50%, hsl(var(--yellow-400)) 100%)', 'Fire', 'Red to orange to yellow gradient', 'gradient', 'gradients', 'white', 'bg-gradient-fire', 6, true),
  ('--gradient-midnight', 'linear-gradient(135deg, hsl(var(--slate-900)) 0%, hsl(var(--blue-900)) 50%, hsl(var(--purple-900)) 100%)', 'Midnight', 'Dark blue night gradient', 'gradient', 'gradients', 'white', 'bg-gradient-midnight', 7, true),
  ('--gradient-subtle', 'linear-gradient(180deg, hsl(var(--muted)/0.3) 0%, hsl(var(--background)) 100%)', 'Subtle', 'Soft muted gradient', 'gradient', 'gradients', 'auto', 'bg-gradient-subtle', 8, true)
ON CONFLICT (css_var) DO UPDATE SET
  label = EXCLUDED.label,
  description = EXCLUDED.description,
  color_type = EXCLUDED.color_type,
  category = EXCLUDED.category,
  optimal_text_color = EXCLUDED.optimal_text_color,
  preview_class = EXCLUDED.preview_class,
  sort_order = EXCLUDED.sort_order;

-- Insert glass effects
INSERT INTO color_tokens (css_var, value, label, description, color_type, category, optimal_text_color, preview_class, sort_order, active)
VALUES 
  ('--glass-light', 'rgba(255, 255, 255, 0.1)', 'Glass Light', 'Light frosted glass effect', 'glass', 'glass', 'white', 'bg-white/10 backdrop-blur-md border border-white/20', 1, true),
  ('--glass-dark', 'rgba(0, 0, 0, 0.2)', 'Glass Dark', 'Dark frosted glass effect', 'glass', 'glass', 'white', 'bg-black/20 backdrop-blur-md border border-white/10', 2, true),
  ('--glass-primary', 'hsl(var(--primary)/0.1)', 'Glass Primary', 'Primary color glass effect', 'glass', 'glass', 'auto', 'bg-primary/10 backdrop-blur-md border border-primary/20', 3, true)
ON CONFLICT (css_var) DO UPDATE SET
  label = EXCLUDED.label,
  description = EXCLUDED.description,
  color_type = EXCLUDED.color_type,
  category = EXCLUDED.category,
  optimal_text_color = EXCLUDED.optimal_text_color,
  preview_class = EXCLUDED.preview_class,
  sort_order = EXCLUDED.sort_order;

-- Insert solid semantic colors
INSERT INTO color_tokens (css_var, value, label, description, color_type, category, optimal_text_color, preview_class, sort_order, active)
VALUES 
  ('--background', '0 0% 100%', 'Background', 'Page background', 'solid', 'surfaces', 'dark', 'bg-background', 1, true),
  ('--foreground', '240 10% 3.9%', 'Foreground', 'Primary text color', 'solid', 'text', 'white', 'bg-foreground', 1, true),
  ('--card', '0 0% 100%', 'Card', 'Card background', 'solid', 'surfaces', 'dark', 'bg-card', 2, true),
  ('--card-foreground', '240 10% 3.9%', 'Card Text', 'Card text color', 'solid', 'text', 'white', 'bg-card-foreground', 2, true),
  ('--popover', '0 0% 100%', 'Popover', 'Popover background', 'solid', 'surfaces', 'dark', 'bg-popover', 3, true),
  ('--primary', '221.2 83.2% 53.3%', 'Primary', 'Primary brand color', 'solid', 'interactive', 'white', 'bg-primary', 1, true),
  ('--primary-foreground', '210 40% 98%', 'Primary Text', 'Text on primary', 'solid', 'text', 'dark', 'bg-primary-foreground', 3, true),
  ('--secondary', '210 40% 96.1%', 'Secondary', 'Secondary color', 'solid', 'interactive', 'dark', 'bg-secondary', 2, true),
  ('--secondary-foreground', '222.2 47.4% 11.2%', 'Secondary Text', 'Text on secondary', 'solid', 'text', 'white', 'bg-secondary-foreground', 4, true),
  ('--muted', '210 40% 96.1%', 'Muted', 'Muted background', 'solid', 'surfaces', 'dark', 'bg-muted', 4, true),
  ('--muted-foreground', '215.4 16.3% 46.9%', 'Muted Text', 'Muted text color', 'solid', 'text', 'white', 'bg-muted-foreground', 5, true),
  ('--accent', '210 40% 96.1%', 'Accent', 'Accent color', 'solid', 'interactive', 'dark', 'bg-accent', 3, true),
  ('--accent-foreground', '222.2 47.4% 11.2%', 'Accent Text', 'Text on accent', 'solid', 'text', 'white', 'bg-accent-foreground', 6, true),
  ('--destructive', '0 84.2% 60.2%', 'Destructive', 'Error/danger color', 'solid', 'feedback', 'white', 'bg-destructive', 1, true),
  ('--border', '214.3 31.8% 91.4%', 'Border', 'Border color', 'solid', 'surfaces', 'dark', 'bg-border', 5, true),
  ('--input', '214.3 31.8% 91.4%', 'Input', 'Input border color', 'solid', 'surfaces', 'dark', 'bg-input', 6, true),
  ('--ring', '221.2 83.2% 53.3%', 'Ring', 'Focus ring color', 'solid', 'interactive', 'white', 'bg-ring', 4, true)
ON CONFLICT (css_var) DO UPDATE SET
  label = EXCLUDED.label,
  description = EXCLUDED.description,
  color_type = EXCLUDED.color_type,
  category = EXCLUDED.category,
  optimal_text_color = EXCLUDED.optimal_text_color,
  preview_class = EXCLUDED.preview_class,
  sort_order = EXCLUDED.sort_order;