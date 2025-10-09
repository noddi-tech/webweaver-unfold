-- Insert common navigation and UI translations
INSERT INTO translations (translation_key, language_code, translated_text, approved, page_location) 
VALUES 
  -- Navigation
  ('nav.home', 'en', 'Home', true, 'global'),
  ('nav.functions', 'en', 'Functions', true, 'global'),
  ('nav.partners', 'en', 'Partners', true, 'global'),
  ('nav.architecture', 'en', 'Architecture', true, 'global'),
  ('nav.pricing', 'en', 'Pricing', true, 'global'),
  ('nav.contact', 'en', 'Contact', true, 'global'),
  ('nav.team', 'en', 'Team', true, 'global'),
  ('nav.demo', 'en', 'Demo', true, 'global'),
  
  -- Common UI
  ('common.sign_in', 'en', 'Sign In', true, 'global'),
  ('common.sign_out', 'en', 'Sign Out', true, 'global'),
  ('common.get_started', 'en', 'Get Started', true, 'global'),
  ('common.learn_more', 'en', 'Learn More', true, 'global'),
  ('common.book_demo', 'en', 'Book a Demo', true, 'global'),
  
  -- Footer
  ('footer.company_description', 'en', 'Noddi Tech builds unified software for automotive service providers—where frontend and backend finally speak the same language.', true, 'global'),
  ('footer.quick_links', 'en', 'Quick Links', true, 'global'),
  ('footer.legal', 'en', 'Legal', true, 'global'),
  ('footer.copyright', 'en', '© 2024 Noddi Tech. All rights reserved. Built with ❤️ by the Noddi Tech team.', true, 'global')
ON CONFLICT (translation_key, language_code) DO NOTHING;