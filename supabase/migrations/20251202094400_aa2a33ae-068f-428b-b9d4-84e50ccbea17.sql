-- Add warmth gradient text color to CMS
INSERT INTO color_tokens (
  css_var, 
  value, 
  label, 
  description, 
  color_type, 
  category, 
  preview_class, 
  optimal_text_color,
  sort_order,
  active
) VALUES (
  'text-gradient-warmth',
  'linear-gradient(135deg, hsl(var(--vibrant-purple)) 0%, hsl(var(--brand-orange)) 100%)',
  'Warmth Gradient',
  'Warm purple to orange gradient text like the Navio logo',
  'gradient',
  'text',
  'bg-gradient-warmth bg-clip-text text-transparent',
  'auto',
  100,
  true
);