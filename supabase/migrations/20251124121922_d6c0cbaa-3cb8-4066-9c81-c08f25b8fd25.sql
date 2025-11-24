-- Add comprehensive text color system to color_tokens table

-- Phase 1: Core Feedback Text Colors (AAA contrast on white backgrounds)
INSERT INTO color_tokens (css_var, value, label, description, color_type, category, optimal_text_color, active, sort_order)
VALUES
  ('--text-success', '142 76% 36%', 'Success Text', 'Green text for success states and confirmations', 'solid', 'text', 'auto', true, 100),
  ('--text-error', '0 84% 45%', 'Error Text', 'Red text for errors and destructive actions', 'solid', 'text', 'auto', true, 101),
  ('--text-warning', '38 92% 35%', 'Warning Text', 'Orange text for warnings and cautions', 'solid', 'text', 'auto', true, 102),
  ('--text-info', '221 83% 40%', 'Info Text', 'Blue text for informational messages', 'solid', 'text', 'auto', true, 103),

-- Phase 2: Hierarchy & States Text Colors
  ('--text-disabled', '0 0% 60%', 'Disabled Text', 'Gray text for disabled UI elements', 'solid', 'text', 'auto', true, 110),
  ('--text-placeholder', '0 0% 50%', 'Placeholder Text', 'Gray text for input placeholders', 'solid', 'text', 'auto', true, 111),

-- Phase 3: Interactive Text Colors
  ('--text-link', '249 67% 50%', 'Link Text', 'Blue text for clickable links', 'solid', 'text', 'auto', true, 120),
  ('--text-link-hover', '249 67% 40%', 'Link Hover Text', 'Darker blue for link hover state', 'solid', 'text', 'auto', true, 121),

-- Phase 4: Specialized Text Colors
  ('--text-code', '266 85% 45%', 'Code Text', 'Purple text for code snippets and technical content', 'solid', 'text', 'auto', true, 130),
  ('--text-quote', '0 0% 40%', 'Quote Text', 'Dark gray text for blockquotes and citations', 'solid', 'text', 'auto', true, 131)

ON CONFLICT (css_var) DO UPDATE SET
  value = EXCLUDED.value,
  label = EXCLUDED.label,
  description = EXCLUDED.description,
  color_type = EXCLUDED.color_type,
  category = EXCLUDED.category,
  optimal_text_color = EXCLUDED.optimal_text_color,
  active = EXCLUDED.active,
  sort_order = EXCLUDED.sort_order,
  updated_at = now();