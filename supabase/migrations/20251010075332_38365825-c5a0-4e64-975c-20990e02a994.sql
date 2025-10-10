-- Add Pricing Examples English translation keys
INSERT INTO public.translations (translation_key, language_code, translated_text, approved, page_location) VALUES
-- Pricing Examples
('pricing.examples.title', 'en', 'Example Pricing Scenarios', true, 'pricing'),
('pricing.examples.subtitle_base', 'en', 'See what businesses like yours typically pay (base pricing)', true, 'pricing'),
('pricing.examples.subtitle_monthly', 'en', 'See what businesses like yours typically pay (with monthly contract - Save 15%)', true, 'pricing'),
('pricing.examples.subtitle_yearly', 'en', 'See what businesses like yours typically pay (with yearly contract - Save 25%)', true, 'pricing'),
('pricing.examples.small.title', 'en', 'Small Business', true, 'pricing'),
('pricing.examples.small.label', 'en', '€1M total revenue', true, 'pricing'),
('pricing.examples.growing.title', 'en', 'Growing Business', true, 'pricing'),
('pricing.examples.growing.label', 'en', '€8M total (no mobile)', true, 'pricing'),
('pricing.examples.large.title', 'en', 'Large Business', true, 'pricing'),
('pricing.examples.large.label', 'en', '€10M total revenue', true, 'pricing'),
('pricing.examples.enterprise.title', 'en', 'Enterprise', true, 'pricing'),
('pricing.examples.enterprise.label', 'en', '€194M total revenue', true, 'pricing'),
('pricing.examples.label_garage', 'en', 'Garage', true, 'pricing'),
('pricing.examples.label_shop', 'en', 'Shop', true, 'pricing'),
('pricing.examples.label_mobile', 'en', 'Mobile', true, 'pricing'),
('pricing.examples.annual_cost', 'en', 'Annual Cost', true, 'pricing'),
('pricing.examples.save', 'en', 'Save', true, 'pricing'),
('pricing.examples.with_contract', 'en', 'with', true, 'pricing'),
('pricing.examples.contract', 'en', 'contract', true, 'pricing'),
('pricing.examples.effective_rate', 'en', 'Effective rate', true, 'pricing'),
('pricing.examples.disclaimer', 'en', 'These are examples only. Your actual rate depends on your exact revenue mix.', true, 'pricing')

ON CONFLICT (translation_key, language_code) DO NOTHING;