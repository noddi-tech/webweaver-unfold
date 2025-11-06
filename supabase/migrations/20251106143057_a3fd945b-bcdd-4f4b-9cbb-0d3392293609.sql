-- Add semantic feedback color tokens for admin components
INSERT INTO color_tokens (css_var, label, value, description, color_type, category, preview_class, optimal_text_color, sort_order, active) VALUES
  ('--success', 'Success', '142 76% 36%', 'Success states and positive feedback', 'solid', 'feedback', 'bg-success', 'white', 1, true),
  ('--warning', 'Warning', '38 92% 50%', 'Warning states and caution messages', 'solid', 'feedback', 'bg-warning', 'dark', 2, true),
  ('--info', 'Info', '221 83% 53%', 'Information states and notifications', 'solid', 'feedback', 'bg-info', 'white', 3, true);