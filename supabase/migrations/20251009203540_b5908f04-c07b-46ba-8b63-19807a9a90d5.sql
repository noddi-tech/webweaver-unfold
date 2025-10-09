-- Insert initial English translations for Hero component
INSERT INTO translations (translation_key, language_code, translated_text, approved, page_location) 
VALUES 
  ('hero.title', 'en', 'One platform. Every function.', true, 'homepage'),
  ('hero.subtitle', 'en', 'Booking to billing. Built for automotive services.', true, 'homepage'),
  ('hero.metrics.nps', 'en', 'Industry leading', true, 'homepage'),
  ('hero.metrics.bookings', 'en', 'Bookings completed', true, 'homepage'),
  ('hero.cta', 'en', 'Get a Demo', true, 'homepage')
ON CONFLICT (translation_key, language_code) DO NOTHING;