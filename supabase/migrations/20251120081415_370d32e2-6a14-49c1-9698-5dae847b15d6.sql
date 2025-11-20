
-- Insert Solid Brand Colors (11 entries)
INSERT INTO color_tokens (css_var, value, label, description, color_type, category, optimal_text_color, preview_class, active, sort_order)
VALUES
  ('--primary', '249 67% 24%', 'Federal Blue', 'Primary Navio brand color', 'solid', 'surfaces', 'primary-foreground', 'bg-primary', true, 1),
  ('--vibrant-purple', '266 85% 58%', 'Vibrant Purple', 'Brand gradient accent', 'solid', 'interactive', 'white', 'bg-[hsl(var(--vibrant-purple))]', true, 2),
  ('--brand-orange', '25 95% 63%', 'Brand Orange', 'Energetic accent color', 'solid', 'interactive', 'foreground', 'bg-[hsl(var(--brand-orange))]', true, 3),
  ('--brand-pink', '321 59% 85%', 'Brand Pink', 'Soft accent color', 'solid', 'interactive', 'foreground', 'bg-[hsl(var(--brand-pink))]', true, 4),
  ('--brand-peach', '25 95% 70%', 'Brand Peach', 'Warm accent color', 'solid', 'interactive', 'foreground', 'bg-[hsl(var(--brand-peach))]', true, 5),
  ('--brand-blue', '210 100% 50%', 'Ocean Blue', 'Fresh ocean accent', 'solid', 'interactive', 'white', 'bg-[hsl(var(--brand-blue))]', true, 6),
  ('--brand-teal', '180 70% 45%', 'Brand Teal', 'Ocean teal accent', 'solid', 'interactive', 'white', 'bg-[hsl(var(--brand-teal))]', true, 7),
  ('--brand-green', '142 76% 50%', 'Success Green', 'Success and growth color', 'solid', 'feedback', 'white', 'bg-[hsl(var(--brand-green))]', true, 8),
  ('--background', '0 0% 100%', 'White Background', 'Pure white page background', 'solid', 'surfaces', 'foreground', 'bg-background', true, 10),
  ('--card', '249 67% 24%', 'Card Background', 'Federal Blue card background', 'solid', 'surfaces', 'card-foreground', 'bg-card', true, 11),
  ('--muted', '0 0% 96%', 'Muted Gray', 'Light gray surface', 'solid', 'surfaces', 'muted-foreground', 'bg-muted', true, 12)
ON CONFLICT (css_var) DO UPDATE SET
  value = EXCLUDED.value,
  label = EXCLUDED.label,
  description = EXCLUDED.description,
  color_type = EXCLUDED.color_type,
  category = EXCLUDED.category,
  optimal_text_color = EXCLUDED.optimal_text_color,
  preview_class = EXCLUDED.preview_class,
  active = EXCLUDED.active,
  sort_order = EXCLUDED.sort_order,
  updated_at = now();

-- Insert Standard Gradients (6 entries)
INSERT INTO color_tokens (css_var, value, label, description, color_type, category, optimal_text_color, preview_class, active, sort_order)
VALUES
  ('--gradient-primary', 'linear-gradient(135deg, hsl(249, 67%, 24%), hsl(266, 85%, 58%))', 'Primary Gradient', 'Federal Blue to Purple', 'gradient', 'gradients', 'white', 'bg-gradient-primary', true, 100),
  ('--gradient-hero', 'linear-gradient(135deg, hsl(266, 85%, 58%), hsl(25, 95%, 63%))', 'Hero Gradient', 'Purple to Orange - Main hero sections', 'gradient', 'gradients', 'white', 'bg-gradient-hero', true, 101),
  ('--gradient-sunset', 'linear-gradient(135deg, hsl(25, 95%, 63%), hsl(321, 59%, 85%))', 'Sunset Gradient', 'Orange to Pink warm blend', 'gradient', 'gradients', 'foreground', 'bg-gradient-sunset', true, 102),
  ('--gradient-warmth', 'linear-gradient(135deg, hsl(25, 95%, 70%), hsl(25, 95%, 63%))', 'Warmth Gradient', 'Peach to Orange warm tones', 'gradient', 'gradients', 'foreground', 'bg-gradient-warmth', true, 103),
  ('--gradient-ocean', 'linear-gradient(135deg, hsl(210, 100%, 50%), hsl(180, 70%, 45%))', 'Ocean Gradient', 'Blue to Teal fresh blend', 'gradient', 'gradients', 'white', 'bg-gradient-ocean', true, 104),
  ('--gradient-fire', 'linear-gradient(135deg, hsl(25, 95%, 63%), hsl(0, 84%, 60%))', 'Fire Gradient', 'Orange to Red intense energy', 'gradient', 'gradients', 'white', 'bg-gradient-fire', true, 105)
ON CONFLICT (css_var) DO UPDATE SET
  value = EXCLUDED.value,
  label = EXCLUDED.label,
  description = EXCLUDED.description,
  color_type = EXCLUDED.color_type,
  category = EXCLUDED.category,
  optimal_text_color = EXCLUDED.optimal_text_color,
  preview_class = EXCLUDED.preview_class,
  active = EXCLUDED.active,
  sort_order = EXCLUDED.sort_order,
  updated_at = now();

-- Insert Experimental Mesh Gradients (6 entries)
INSERT INTO color_tokens (css_var, value, label, description, color_type, category, optimal_text_color, preview_class, active, sort_order)
VALUES
  ('--gradient-mesh-aurora', 'radial-gradient(at 0% 0%, hsl(266, 85%, 58%) 0px, transparent 50%), radial-gradient(at 50% 50%, hsl(210, 100%, 50%) 0px, transparent 50%), radial-gradient(at 100% 0%, hsl(180, 70%, 45%) 0px, transparent 50%)', 'Aurora Mesh', 'Purple-Blue-Teal atmospheric blend', 'gradient', 'gradients', 'white', 'bg-gradient-mesh-aurora', true, 200),
  ('--gradient-mesh-sunset', 'radial-gradient(at 0% 100%, hsl(25, 95%, 63%) 0px, transparent 50%), radial-gradient(at 50% 0%, hsl(321, 59%, 85%) 0px, transparent 50%), radial-gradient(at 100% 100%, hsl(25, 95%, 70%) 0px, transparent 50%)', 'Sunset Mesh', 'Orange-Pink-Peach warm glow', 'gradient', 'gradients', 'foreground', 'bg-gradient-mesh-sunset', true, 201),
  ('--gradient-mesh-ocean', 'radial-gradient(at 20% 30%, hsl(210, 100%, 50%) 0px, transparent 50%), radial-gradient(at 80% 70%, hsl(180, 70%, 45%) 0px, transparent 50%), radial-gradient(at 50% 50%, hsl(249, 67%, 24%) 0px, transparent 50%)', 'Ocean Mesh', 'Blue-Teal-Navy deep waters', 'gradient', 'gradients', 'white', 'bg-gradient-mesh-ocean', true, 202),
  ('--gradient-mesh-dream', 'radial-gradient(at 40% 20%, hsl(266, 85%, 58%) 0px, transparent 50%), radial-gradient(at 80% 60%, hsl(321, 59%, 85%) 0px, transparent 50%), radial-gradient(at 20% 80%, hsl(210, 100%, 50%) 0px, transparent 50%)', 'Dream Mesh', 'Purple-Pink-Blue dreamy blend', 'gradient', 'gradients', 'white', 'bg-gradient-mesh-dream', true, 203),
  ('--gradient-mesh-cosmic', 'radial-gradient(at 0% 50%, hsl(249, 67%, 24%) 0px, transparent 50%), radial-gradient(at 50% 0%, hsl(266, 85%, 58%) 0px, transparent 50%), radial-gradient(at 100% 50%, hsl(210, 100%, 50%) 0px, transparent 50%)', 'Cosmic Mesh', 'Navy-Purple-Blue space vibe', 'gradient', 'gradients', 'white', 'bg-gradient-mesh-cosmic', true, 204),
  ('--gradient-mesh-velvet', 'radial-gradient(at 30% 40%, hsl(266, 85%, 58%) 0px, transparent 50%), radial-gradient(at 70% 60%, hsl(249, 67%, 24%) 0px, transparent 50%), radial-gradient(at 50% 100%, hsl(25, 95%, 63%) 0px, transparent 50%)', 'Velvet Mesh', 'Purple-Navy-Orange luxurious depth', 'gradient', 'gradients', 'white', 'bg-gradient-mesh-velvet', true, 205)
ON CONFLICT (css_var) DO UPDATE SET
  value = EXCLUDED.value,
  label = EXCLUDED.label,
  description = EXCLUDED.description,
  color_type = EXCLUDED.color_type,
  category = EXCLUDED.category,
  optimal_text_color = EXCLUDED.optimal_text_color,
  preview_class = EXCLUDED.preview_class,
  active = EXCLUDED.active,
  sort_order = EXCLUDED.sort_order,
  updated_at = now();

-- Insert Glass Effects (3 entries)
INSERT INTO color_tokens (css_var, value, label, description, color_type, category, optimal_text_color, preview_class, active, sort_order)
VALUES
  ('glass-solid', 'background: hsl(var(--card-background) / 1.0)', 'Glass Solid', 'Fully opaque glass effect', 'glass', 'glass', 'auto', 'glass-solid', true, 300),
  ('glass-card', 'background: hsl(var(--card-background) / 0.95)', 'Glass Card', 'Standard glass with 95% opacity', 'glass', 'glass', 'auto', 'glass-card', true, 301),
  ('glass-prominent', 'background: hsl(var(--card-background) / 0.98)', 'Glass Prominent', 'Prominent glass for modals', 'glass', 'glass', 'auto', 'glass-prominent', true, 302)
ON CONFLICT (css_var) DO UPDATE SET
  value = EXCLUDED.value,
  label = EXCLUDED.label,
  description = EXCLUDED.description,
  color_type = EXCLUDED.color_type,
  category = EXCLUDED.category,
  optimal_text_color = EXCLUDED.optimal_text_color,
  preview_class = EXCLUDED.preview_class,
  active = EXCLUDED.active,
  sort_order = EXCLUDED.sort_order,
  updated_at = now();
