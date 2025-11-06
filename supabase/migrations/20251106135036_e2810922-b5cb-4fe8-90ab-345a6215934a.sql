-- Clean up gradients to match CMS canonical list
-- Remove inconsistent gradients and ensure only 5 canonical gradients exist

-- Delete old gradients not in CMS canonical list
DELETE FROM color_tokens 
WHERE css_var IN ('--gradient-forest', '--gradient-aurora', '--gradient-midnight', '--gradient-subtle');

-- Update Hero Gradient with complete metadata
UPDATE color_tokens 
SET 
  label = 'Hero Gradient',
  value = 'linear-gradient(135deg, hsl(249 67% 24%), hsl(266 85% 58%))',
  description = 'Federal blue to vibrant purple - primary hero gradient',
  color_type = 'gradient',
  category = 'gradients',
  preview_class = 'bg-gradient-hero',
  optimal_text_color = 'white',
  sort_order = 1,
  active = true
WHERE css_var = '--gradient-hero';

-- Update Sunset Gradient
UPDATE color_tokens 
SET 
  label = 'Gradient Sunset',
  value = 'linear-gradient(135deg, hsl(249 67% 24%), hsl(266 85% 58%), hsl(25 95% 63%))',
  description = 'Federal blue → Purple → Orange (3-color blend)',
  color_type = 'gradient',
  category = 'gradients',
  preview_class = 'bg-gradient-sunset',
  optimal_text_color = 'white',
  sort_order = 2,
  active = true
WHERE css_var = '--gradient-sunset';

-- Insert or update Gradient Warmth (might not exist yet)
INSERT INTO color_tokens (
  css_var, label, value, description, color_type, category, 
  preview_class, optimal_text_color, sort_order, active
)
VALUES (
  '--gradient-warmth',
  'Gradient Warmth',
  'linear-gradient(135deg, hsl(266 85% 58%), hsl(321 59% 85%), hsl(25 95% 70%))',
  'Purple → Pink → Peach (soft, welcoming)',
  'gradient',
  'gradients',
  'bg-gradient-warmth',
  'white',
  3,
  true
)
ON CONFLICT (css_var) 
DO UPDATE SET
  label = EXCLUDED.label,
  value = EXCLUDED.value,
  description = EXCLUDED.description,
  color_type = EXCLUDED.color_type,
  category = EXCLUDED.category,
  preview_class = EXCLUDED.preview_class,
  optimal_text_color = EXCLUDED.optimal_text_color,
  sort_order = EXCLUDED.sort_order,
  active = EXCLUDED.active;

-- Update Ocean Gradient
UPDATE color_tokens 
SET 
  label = 'Gradient Ocean',
  value = 'linear-gradient(135deg, hsl(210 100% 50%), hsl(180 70% 45%), hsl(142 76% 50%))',
  description = 'Blue → Teal → Green (fresh, technical)',
  color_type = 'gradient',
  category = 'gradients',
  preview_class = 'bg-gradient-ocean',
  optimal_text_color = 'white',
  sort_order = 4,
  active = true
WHERE css_var = '--gradient-ocean';

-- Update Fire Gradient
UPDATE color_tokens 
SET 
  label = 'Gradient Fire',
  value = 'linear-gradient(135deg, hsl(25 95% 53%), hsl(266 85% 58%))',
  description = 'Orange → Purple (bold, energetic)',
  color_type = 'gradient',
  category = 'gradients',
  preview_class = 'bg-gradient-fire',
  optimal_text_color = 'white',
  sort_order = 5,
  active = true
WHERE css_var = '--gradient-fire';