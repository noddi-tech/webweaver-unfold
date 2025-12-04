-- Insert English translations for all solution fields
-- Using underscore format for slugs in translation keys

-- TIRE SERVICES
INSERT INTO translations (language_code, translation_key, translated_text, page_location, approved)
VALUES 
  ('en', 'solutions.tire_services.title', 'Tire services', 'solutions', true),
  ('en', 'solutions.tire_services.subtitle', 'Dominate your market', 'solutions', true),
  ('en', 'solutions.tire_services.hero_title', 'Stand out with excellent customer experiences', 'solutions', true),
  ('en', 'solutions.tire_services.hero_subtitle', 'Next-level customer convenience', 'solutions', true),
  ('en', 'solutions.tire_services.hero_description', 'The Navio platform gives you access to best-in-class digital customer interactions, that streamlines your operations, and maximizes tire-sales conversions.', 'solutions', true),
  ('en', 'solutions.tire_services.hero_cta_text', 'Schedule demo', 'solutions', true),
  ('en', 'solutions.tire_services.description_heading', 'Grow sales, and cut operating costs', 'solutions', true),
  ('en', 'solutions.tire_services.description_text', 'With Navio, customer bookings are orchestrated like never before. Perfectly timed communication makes sure to minimize customer service calls. And automated, AI powered processing of inspection data helps convert sales opportunities.', 'solutions', true),
  ('en', 'solutions.tire_services.footer_heading', 'Ready to Get Started?', 'solutions', true),
  ('en', 'solutions.tire_services.footer_text', 'Contact us for a talk on how we can accelerate your business', 'solutions', true),
  ('en', 'solutions.tire_services.footer_cta_text', 'Schedule Appointment', 'solutions', true)
ON CONFLICT (language_code, translation_key) DO UPDATE SET translated_text = EXCLUDED.translated_text;

-- WINDSCREEN REPAIR
INSERT INTO translations (language_code, translation_key, translated_text, page_location, approved)
VALUES 
  ('en', 'solutions.windscreen_repair.title', 'Windscreen repair', 'solutions', true),
  ('en', 'solutions.windscreen_repair.subtitle', 'Unrivaled convenience', 'solutions', true),
  ('en', 'solutions.windscreen_repair.hero_title', 'Dominate windscreen repair, with unrivaled convenience.', 'solutions', true),
  ('en', 'solutions.windscreen_repair.hero_subtitle', 'The edge that makes the competition irrelevant.', 'solutions', true),
  ('en', 'solutions.windscreen_repair.hero_description', 'Use home-delivery of windscreen-repair as your unique selling point, to dominate your local windscreen repair and replacement market.', 'solutions', true),
  ('en', 'solutions.windscreen_repair.hero_cta_text', 'Schedule a chat', 'solutions', true),
  ('en', 'solutions.windscreen_repair.description_heading', 'Scale operations, without bloating property cost.', 'solutions', true),
  ('en', 'solutions.windscreen_repair.description_text', 'Winning markets shares in windscreen-repair requires prime-location service points. By adding mobile services to your menu you can offer maximum convenience and reach, while limiting your investment in real-estate.', 'solutions', true),
  ('en', 'solutions.windscreen_repair.footer_heading', 'Disruption starts here', 'solutions', true),
  ('en', 'solutions.windscreen_repair.footer_text', 'Don''t wait to be disrupted - you can be the one that redefine status-quo! Schedule a chat to learn more on how fast our team can have your mobile service division up and running.', 'solutions', true),
  ('en', 'solutions.windscreen_repair.footer_cta_text', 'Learn more', 'solutions', true)
ON CONFLICT (language_code, translation_key) DO UPDATE SET translated_text = EXCLUDED.translated_text;

-- CAR WASH
INSERT INTO translations (language_code, translation_key, translated_text, page_location, approved)
VALUES 
  ('en', 'solutions.car_wash.title', 'Car Wash', 'solutions', true),
  ('en', 'solutions.car_wash.subtitle', 'Deliver the VIP experience', 'solutions', true),
  ('en', 'solutions.car_wash.hero_title', 'Mobile Car Detailing', 'solutions', true),
  ('en', 'solutions.car_wash.hero_subtitle', 'Take your business on the road', 'solutions', true),
  ('en', 'solutions.car_wash.hero_description', 'Give your customers unrivaled convenience and VIP experience. Our booking platform automates appointment planning, so that you can spend your time on delivering quality.', 'solutions', true),
  ('en', 'solutions.car_wash.hero_cta_text', 'Learn more', 'solutions', true),
  ('en', 'solutions.car_wash.description_heading', 'The ultimate cleaning experience', 'solutions', true),
  ('en', 'solutions.car_wash.description_text', 'Your business needs prime location if you want to attract customers. And there is no more convenient location for the customer than you coming to them. Our platform ensures that booking coordination runs on autopilot, so that you can spend the time on what you are truly good at.', 'solutions', true),
  ('en', 'solutions.car_wash.footer_heading', 'Start building your mobile business today', 'solutions', true),
  ('en', 'solutions.car_wash.footer_text', 'Build your business on top of the worlds most powerful platform for mobile services.', 'solutions', true),
  ('en', 'solutions.car_wash.footer_cta_text', 'Contact us', 'solutions', true)
ON CONFLICT (language_code, translation_key) DO UPDATE SET translated_text = EXCLUDED.translated_text;

-- SERVICE DIAGNOSTICS
INSERT INTO translations (language_code, translation_key, translated_text, page_location, approved)
VALUES 
  ('en', 'solutions.service_diagnostics.title', 'Service & Diagnostics', 'solutions', true),
  ('en', 'solutions.service_diagnostics.subtitle', 'Improve utilization', 'solutions', true),
  ('en', 'solutions.service_diagnostics.hero_title', 'Mobile services & diagnostics', 'solutions', true),
  ('en', 'solutions.service_diagnostics.hero_subtitle', 'Improve utilization', 'solutions', true),
  ('en', 'solutions.service_diagnostics.hero_description', 'Stop forcing your customers to come in for minor repair & diagnostic jobs. Mobile services gives lets you optimize utilization of your service bays, and give customers top-level convenience experiences.', 'solutions', true),
  ('en', 'solutions.service_diagnostics.hero_cta_text', 'Get a demo', 'solutions', true),
  ('en', 'solutions.service_diagnostics.description_heading', 'Keep your service bay open for high-revenue jobs', 'solutions', true),
  ('en', 'solutions.service_diagnostics.description_text', 'Your service bay should be reserved for complex and high-margin jobs. With mobile services you can move jobs such as diagnostics and light repairs out to the customers location, and keep your service bay open for more comprehensive repair work.', 'solutions', true),
  ('en', 'solutions.service_diagnostics.footer_heading', 'Efficiency starts here', 'solutions', true),
  ('en', 'solutions.service_diagnostics.footer_text', 'Schedule a talk with our team to learn how we can have you up and running with basic mobile services in a matter of days', 'solutions', true),
  ('en', 'solutions.service_diagnostics.footer_cta_text', 'Schedule a demo', 'solutions', true)
ON CONFLICT (language_code, translation_key) DO UPDATE SET translated_text = EXCLUDED.translated_text;

-- WARRANTY RECALLS
INSERT INTO translations (language_code, translation_key, translated_text, page_location, approved)
VALUES 
  ('en', 'solutions.warranty_recalls.title', 'Warranty recalls', 'solutions', true),
  ('en', 'solutions.warranty_recalls.subtitle', 'Save your reputation', 'solutions', true),
  ('en', 'solutions.warranty_recalls.hero_title', 'Mobile recall services', 'solutions', true),
  ('en', 'solutions.warranty_recalls.hero_subtitle', 'Save the relationship before it breaks', 'solutions', true),
  ('en', 'solutions.warranty_recalls.hero_description', 'Nothing damages your brand like a mass-recall. Mobile services helps save your reputation, and keep your service lanes open for regular business. With Navio you get a white label platform to keep your customers happy with their purchase.', 'solutions', true),
  ('en', 'solutions.warranty_recalls.hero_cta_text', 'Learn more', 'solutions', true),
  ('en', 'solutions.warranty_recalls.description_heading', 'Mobile service scheduling', 'solutions', true),
  ('en', 'solutions.warranty_recalls.description_text', 'With automatic VIN number matching we make sure that you are in full control of where, and what customers, can schedule on-site services. You simply upload the data, and notifies your customer about your mobile alternative.', 'solutions', true),
  ('en', 'solutions.warranty_recalls.footer_heading', 'Step up your game today', 'solutions', true),
  ('en', 'solutions.warranty_recalls.footer_text', 'Don''t wait for a recall to be announced before taking action. Schedule a chat with out team today to learn how the Navio plattform can future-proof your customer relationships.', 'solutions', true),
  ('en', 'solutions.warranty_recalls.footer_cta_text', 'Contact us', 'solutions', true)
ON CONFLICT (language_code, translation_key) DO UPDATE SET translated_text = EXCLUDED.translated_text;

-- Page-level translations
INSERT INTO translations (language_code, translation_key, translated_text, page_location, approved)
VALUES 
  ('en', 'solutions.page.title', 'Solutions', 'solutions', true),
  ('en', 'solutions.page.loading', 'Loading solutions...', 'solutions', true),
  ('en', 'solutions.page.empty', 'No solutions available yet. Check back soon!', 'solutions', true),
  ('en', 'solutions.page.not_found_title', 'Solution Not Found', 'solutions', true),
  ('en', 'solutions.page.not_found_text', 'The solution you''re looking for doesn''t exist.', 'solutions', true),
  ('en', 'solutions.page.view_all', 'View All Solutions', 'solutions', true),
  ('en', 'solutions.page.learn_more', 'Learn More', 'solutions', true),
  ('en', 'nav.home', 'Home', 'navigation', true),
  ('en', 'nav.solutions', 'Solutions', 'navigation', true)
ON CONFLICT (language_code, translation_key) DO UPDATE SET translated_text = EXCLUDED.translated_text;