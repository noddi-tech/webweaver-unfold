-- Restore White Label Booking carousel connection to Card 1
UPDATE image_carousel_settings 
SET 
  display_type = 'carousel',
  carousel_config_id = 'b6919e5f-bff1-423d-946d-efdfed81d6b9'
WHERE location_id = 'scrolling-card-1';