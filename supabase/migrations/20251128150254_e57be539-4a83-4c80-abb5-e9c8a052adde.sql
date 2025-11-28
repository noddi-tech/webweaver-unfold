-- Seed default CTA button text for all 5 scrolling feature cards
-- Use INSERT without ON CONFLICT since there's no unique constraint
DELETE FROM text_content WHERE element_id IN (
  'scrolling-card-1-cta',
  'scrolling-card-2-cta', 
  'scrolling-card-3-cta',
  'scrolling-card-4-cta',
  'scrolling-card-5-cta'
);

INSERT INTO text_content (element_id, element_type, section, page_location, content, button_bg_color, button_url)
VALUES 
  ('scrolling-card-1-cta', 'button', 'scrolling-cards', 'homepage', 'Learn More', 'primary', '/demo'),
  ('scrolling-card-2-cta', 'button', 'scrolling-cards', 'homepage', 'Explore Features', 'primary', '/functions'),
  ('scrolling-card-3-cta', 'button', 'scrolling-cards', 'homepage', 'See How', 'primary', '/solutions'),
  ('scrolling-card-4-cta', 'button', 'scrolling-cards', 'homepage', 'View Analytics', 'primary', '/architecture'),
  ('scrolling-card-5-cta', 'button', 'scrolling-cards', 'homepage', 'Discover More', 'primary', '/pricing');