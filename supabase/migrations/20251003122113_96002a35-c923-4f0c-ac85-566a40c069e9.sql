-- Add Pricing page to pages table
INSERT INTO public.pages (
  name,
  slug,
  title,
  meta_description,
  default_background_token,
  default_text_token,
  default_padding_token,
  default_margin_token,
  default_max_width_token,
  layout_type,
  container_width,
  active,
  published
) VALUES (
  'Pricing',
  'pricing',
  'Pricing | Your Plans',
  'Choose the perfect plan for your needs. Flexible pricing options for individuals, businesses, and enterprises.',
  'background',
  'foreground',
  'section',
  'none',
  'container',
  'standard',
  'container',
  true,
  true
) ON CONFLICT (slug) DO NOTHING;