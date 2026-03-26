-- Update existing secondary token
UPDATE color_tokens 
SET value = '250 57% 55%', 
    label = 'Vivid Purple', 
    description = 'Vivid purple for hover states, badges, accent borders', 
    optimal_text_color = 'white', 
    updated_at = now() 
WHERE css_var = '--secondary';

-- Insert new card-surface token
INSERT INTO color_tokens (css_var, value, label, description, category, color_type, optimal_text_color, preview_class, active, sort_order)
VALUES ('--card-surface', '258 72% 95%', 'Card Surface Lavender', 'Soft lavender for cards that pop against cream background', 'surfaces', 'solid', 'dark', 'bg-card-surface', true, 15)
ON CONFLICT (css_var) DO UPDATE SET value = EXCLUDED.value, label = EXCLUDED.label, description = EXCLUDED.description, updated_at = now();

-- Insert card-surface-foreground text token
INSERT INTO color_tokens (css_var, value, label, description, category, color_type, optimal_text_color, preview_class, active, sort_order)
VALUES ('--card-surface-foreground', '250 54% 39%', 'Card Surface Text', 'Dark purple text for card-surface lavender backgrounds', 'text', 'solid', 'auto', 'text-card-surface-foreground', true, 50)
ON CONFLICT (css_var) DO UPDATE SET value = EXCLUDED.value, label = EXCLUDED.label, description = EXCLUDED.description, updated_at = now();

-- Insert gradient-purple-depth
INSERT INTO color_tokens (css_var, value, label, description, category, color_type, optimal_text_color, preview_class, active, sort_order)
VALUES ('--gradient-purple-depth', 'linear-gradient(135deg, hsl(250 57% 55%) 0%, hsl(250 54% 39%) 50%, hsl(249 67% 24%) 100%)', 'Purple Depth Gradient', 'Three-stop premium purple gradient', 'gradients', 'gradient', 'white', 'bg-gradient-purple-depth', true, 25)
ON CONFLICT (css_var) DO UPDATE SET value = EXCLUDED.value, label = EXCLUDED.label, description = EXCLUDED.description, updated_at = now();