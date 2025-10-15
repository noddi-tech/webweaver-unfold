-- Footer Internationalization: Add translation keys (avoiding hierarchy conflicts)

-- Delete any conflicting parent keys that would prevent child key insertion
DELETE FROM translations 
WHERE translation_key IN ('footer.legal', 'footer.links', 'footer.contact')
AND language_code IN (SELECT code FROM languages WHERE enabled = true);

-- Insert English translations for footer content
INSERT INTO translations (translation_key, language_code, translated_text, page_location, context, approved) VALUES
-- Company info (already exists, skip)
-- ('footer.company_name', 'en', 'Noddi Tech', 'footer', 'Company name in footer', true),
-- ('footer.company_description', 'en', 'already exists', 'footer', 'Company description in footer', true),
-- ('footer.copyright', 'en', 'already exists', 'footer', 'Copyright text in footer', true),

-- Section headers
('footer.quick_links_heading', 'en', 'Quick Links', 'footer', 'Quick links section heading', true),
('footer.legal_heading', 'en', 'Legal', 'footer', 'Legal section heading', true),

-- Contact labels
('footer.contact.email_label', 'en', '', 'footer', 'Email contact label (empty to show icon only)', true),
('footer.contact.location_label', 'en', '', 'footer', 'Location contact label (empty to show icon only)', true),
('footer.contact.phone_label', 'en', '', 'footer', 'Phone contact label (empty to show icon only)', true),

-- Common link titles
('footer.links.home', 'en', 'Home', 'footer', 'Home page link', true),
('footer.links.functions', 'en', 'Functions', 'footer', 'Functions page link', true),
('footer.links.partners', 'en', 'Partners', 'footer', 'Partners page link', true),
('footer.links.architecture', 'en', 'Architecture', 'footer', 'Architecture page link', true),
('footer.links.pricing', 'en', 'Pricing', 'footer', 'Pricing page link', true),
('footer.links.contact', 'en', 'Contact', 'footer', 'Contact page link', true),
('footer.links.team', 'en', 'Team', 'footer', 'Team page link', true),

-- Legal links
('footer.legal.privacy_policy', 'en', 'Privacy Policy', 'footer', 'Privacy policy link', true),
('footer.legal.terms_of_service', 'en', 'Terms of Service', 'footer', 'Terms of service link', true),
('footer.legal.cookie_policy', 'en', 'Cookie Policy', 'footer', 'Cookie policy link', true)

ON CONFLICT (translation_key, language_code) DO NOTHING;