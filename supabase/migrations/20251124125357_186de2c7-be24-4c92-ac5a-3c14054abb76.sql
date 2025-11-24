-- Phase 2: Update preview_class for all text colors
UPDATE color_tokens SET preview_class = 'text-success' WHERE css_var = '--text-success';
UPDATE color_tokens SET preview_class = 'text-error' WHERE css_var = '--text-error';
UPDATE color_tokens SET preview_class = 'text-warning' WHERE css_var = '--text-warning';
UPDATE color_tokens SET preview_class = 'text-info' WHERE css_var = '--text-info';
UPDATE color_tokens SET preview_class = 'text-disabled' WHERE css_var = '--text-disabled';
UPDATE color_tokens SET preview_class = 'text-placeholder' WHERE css_var = '--text-placeholder';
UPDATE color_tokens SET preview_class = 'text-link' WHERE css_var = '--text-link';
UPDATE color_tokens SET preview_class = 'text-link-hover' WHERE css_var = '--text-link-hover';
UPDATE color_tokens SET preview_class = 'text-code' WHERE css_var = '--text-code';
UPDATE color_tokens SET preview_class = 'text-quote' WHERE css_var = '--text-quote';

-- Phase 3: Add missing text variants from brand/feedback colors
INSERT INTO color_tokens (css_var, value, label, description, category, color_type, preview_class, optimal_text_color, sort_order, active)
VALUES 
  ('--text-destructive', '0 84% 40%', 'Destructive Text', 'AAA-compliant destructive red text', 'text', 'solid', 'text-destructive', 'white', 100, true),
  ('--text-vibrant-purple', '266 85% 45%', 'Vibrant Purple Text', 'Vibrant purple for interactive text', 'text', 'solid', 'text-vibrant-purple', 'white', 101, true),
  ('--text-brand-orange', '25 95% 45%', 'Brand Orange Text', 'Darker orange for AAA text', 'text', 'solid', 'text-brand-orange', 'white', 102, true),
  ('--text-brand-teal', '180 70% 35%', 'Brand Teal Text', 'Darker teal for AAA text', 'text', 'solid', 'text-brand-teal', 'white', 103, true)
ON CONFLICT (css_var) DO NOTHING;