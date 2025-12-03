-- Add translation keys for header navigation
INSERT INTO translations (language_code, translation_key, translated_text, approved, context, page_location)
VALUES 
  -- Main navigation items
  ('en', 'nav.solutions', 'Solutions', true, 'Main navigation dropdown trigger', 'header'),
  ('en', 'nav.functionality', 'Functionality', true, 'Main navigation link', 'header'),
  
  -- Solutions dropdown: Tire Services
  ('en', 'solutions.tire_services.title', 'Tire services', true, 'Solutions dropdown item title', 'header'),
  ('en', 'solutions.tire_services.subtitle', 'Dominate your market', true, 'Solutions dropdown item subtitle', 'header'),
  
  -- Solutions dropdown: Windscreen Repair
  ('en', 'solutions.windscreen_repair.title', 'Windscreen repair', true, 'Solutions dropdown item title', 'header'),
  ('en', 'solutions.windscreen_repair.subtitle', 'Unrivaled convenience', true, 'Solutions dropdown item subtitle', 'header'),
  
  -- Solutions dropdown: Car Wash
  ('en', 'solutions.car_wash.title', 'Car Wash', true, 'Solutions dropdown item title', 'header'),
  ('en', 'solutions.car_wash.subtitle', 'Deliver the VIP experience', true, 'Solutions dropdown item subtitle', 'header'),
  
  -- Solutions dropdown: Service & Diagnostics
  ('en', 'solutions.service_diagnostics.title', 'Service & Diagnostics', true, 'Solutions dropdown item title', 'header'),
  ('en', 'solutions.service_diagnostics.subtitle', 'Improve utilization', true, 'Solutions dropdown item subtitle', 'header'),
  
  -- Solutions dropdown: Warranty Recalls
  ('en', 'solutions.warranty_recalls.title', 'Warranty recalls', true, 'Solutions dropdown item title', 'header'),
  ('en', 'solutions.warranty_recalls.subtitle', 'Save your reputation', true, 'Solutions dropdown item subtitle', 'header')
ON CONFLICT (translation_key, language_code) DO UPDATE SET
  translated_text = EXCLUDED.translated_text,
  approved = EXCLUDED.approved,
  context = EXCLUDED.context,
  page_location = EXCLUDED.page_location;