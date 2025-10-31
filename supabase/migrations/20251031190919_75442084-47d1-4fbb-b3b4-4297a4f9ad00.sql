-- Insert default hero carousel configuration
INSERT INTO carousel_configs (name, description, autoplay, autoplay_delay, show_navigation, show_dots, images)
VALUES (
  'Hero Booking Flow',
  'Customer booking flow showcase for hero section',
  true,
  3500,
  true,
  true,
  '[
    {"url": "/src/assets/noddi-location-screen.png", "alt": "Noddi location selection screen showing saved addresses and search functionality", "title": "Noddi"},
    {"url": "/src/assets/tiamat-location-screen.png", "alt": "Tiamat Dekk location selection screen with address delivery confirmation", "title": "Tiamat Dekk"},
    {"url": "/src/assets/hurtigruta-location-screen.png", "alt": "Hurtigruta Carglass location selection screen with address delivery options", "title": "Hurtigruta Carglass"}
  ]'::jsonb
);

-- Set up hero section to use carousel by default
INSERT INTO image_carousel_settings (
  location_id,
  display_type,
  carousel_config_id
)
SELECT 
  'homepage-hero',
  'carousel',
  id
FROM carousel_configs
WHERE name = 'Hero Booking Flow'
LIMIT 1;