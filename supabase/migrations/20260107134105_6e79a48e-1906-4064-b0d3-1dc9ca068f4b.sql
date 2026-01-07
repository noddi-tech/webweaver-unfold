-- Insert navigation translations (English base)
INSERT INTO translations (translation_key, language_code, translated_text, approved, page_location, context)
VALUES
  ('nav.about', 'en', 'About', true, 'header', 'Main navigation dropdown for About section'),
  ('nav.about_us', 'en', 'About Us', true, 'header', 'Navigation link to About Us page'),
  ('nav.newsroom', 'en', 'Newsroom', true, 'header', 'Navigation link to Newsroom page'),
  ('nav.blog', 'en', 'Navio Blog', true, 'header', 'Navigation link to Blog'),
  ('nav.careers', 'en', 'Careers', true, 'header', 'Navigation link to Careers page'),
  ('nav.stories', 'en', 'Stories', true, 'header', 'Navigation link to customer stories'),
  ('nav.pricing', 'en', 'Pricing', true, 'header', 'Navigation link to Pricing page'),
  ('nav.contact', 'en', 'Contact', true, 'header', 'Navigation link to Contact page'),
  ('nav.team', 'en', 'Team', true, 'header', 'Navigation link to Team page')
ON CONFLICT (translation_key, language_code) DO NOTHING;

-- Insert About page translations
INSERT INTO translations (translation_key, language_code, translated_text, approved, page_location, context)
VALUES
  ('about.meta.title', 'en', 'About Us – Navio', true, 'about', 'Meta title for About page'),
  ('about.meta.description', 'en', 'Learn about Navio, our mission, and the team building the future of automotive services.', true, 'about', 'Meta description for About page'),
  ('about.hero.title', 'en', 'About Navio', true, 'about', 'Hero section title'),
  ('about.hero.subtitle', 'en', 'Building the future of automotive services', true, 'about', 'Hero section subtitle'),
  ('about.mission.title', 'en', 'Our Mission', true, 'about', 'Mission section title'),
  ('about.mission.description', 'en', 'We''re on a mission to transform how automotive services are booked and delivered. By connecting drivers with trusted service providers through seamless technology, we''re making car care simpler, faster, and more transparent.', true, 'about', 'Mission section description'),
  ('about.values.title', 'en', 'Our Values', true, 'about', 'Values section title'),
  ('about.values.innovation.title', 'en', 'Innovation', true, 'about', 'Value card title'),
  ('about.values.innovation.description', 'en', 'We constantly push boundaries to create better solutions for our customers and partners.', true, 'about', 'Value card description'),
  ('about.values.trust.title', 'en', 'Trust', true, 'about', 'Value card title'),
  ('about.values.trust.description', 'en', 'Transparency and reliability are at the core of everything we do.', true, 'about', 'Value card description'),
  ('about.values.partnership.title', 'en', 'Partnership', true, 'about', 'Value card title'),
  ('about.values.partnership.description', 'en', 'We succeed when our partners and customers succeed.', true, 'about', 'Value card description'),
  ('about.story.title', 'en', 'Our Story', true, 'about', 'Story section title'),
  ('about.story.description', 'en', 'Founded with the vision of modernizing the automotive aftermarket, Navio has grown from a small startup to a trusted platform serving thousands of customers across multiple markets. Our journey is just beginning.', true, 'about', 'Story section description')
ON CONFLICT (translation_key, language_code) DO NOTHING;

-- Insert Newsroom page translations
INSERT INTO translations (translation_key, language_code, translated_text, approved, page_location, context)
VALUES
  ('newsroom.meta.title', 'en', 'Newsroom – Navio', true, 'newsroom', 'Meta title for Newsroom page'),
  ('newsroom.meta.description', 'en', 'Latest news, press releases, and announcements from Navio.', true, 'newsroom', 'Meta description for Newsroom page'),
  ('newsroom.hero.title', 'en', 'Newsroom', true, 'newsroom', 'Hero section title'),
  ('newsroom.hero.subtitle', 'en', 'Latest news and announcements', true, 'newsroom', 'Hero section subtitle'),
  ('newsroom.press.title', 'en', 'Press Releases', true, 'newsroom', 'Press releases section title'),
  ('newsroom.press.coming_soon', 'en', 'Press releases coming soon. Stay tuned for the latest updates from Navio.', true, 'newsroom', 'Placeholder text'),
  ('newsroom.media.title', 'en', 'Media Kit', true, 'newsroom', 'Media kit section title'),
  ('newsroom.media.description', 'en', 'Download our brand assets, logos, and press materials for your publications.', true, 'newsroom', 'Media kit description'),
  ('newsroom.contact.title', 'en', 'Press Contact', true, 'newsroom', 'Contact section title'),
  ('newsroom.contact.description', 'en', 'For media inquiries, please contact our press team.', true, 'newsroom', 'Contact section description')
ON CONFLICT (translation_key, language_code) DO NOTHING;

-- Insert Careers page translations
INSERT INTO translations (translation_key, language_code, translated_text, approved, page_location, context)
VALUES
  ('careers.meta.title', 'en', 'Careers – Navio', true, 'careers', 'Meta title for Careers page'),
  ('careers.meta.description', 'en', 'Join our team and help build the future of automotive services.', true, 'careers', 'Meta description for Careers page'),
  ('careers.hero.title', 'en', 'Join Our Team', true, 'careers', 'Hero section title'),
  ('careers.hero.subtitle', 'en', 'Help us transform the automotive industry', true, 'careers', 'Hero section subtitle'),
  ('careers.why.title', 'en', 'Why Join Navio?', true, 'careers', 'Why join section title'),
  ('careers.benefits.growth.title', 'en', 'Growth', true, 'careers', 'Benefit card title'),
  ('careers.benefits.growth.description', 'en', 'Continuous learning and career development opportunities', true, 'careers', 'Benefit card description'),
  ('careers.benefits.culture.title', 'en', 'Culture', true, 'careers', 'Benefit card title'),
  ('careers.benefits.culture.description', 'en', 'Inclusive, collaborative, and innovation-driven environment', true, 'careers', 'Benefit card description'),
  ('careers.benefits.team.title', 'en', 'Team', true, 'careers', 'Benefit card title'),
  ('careers.benefits.team.description', 'en', 'Work with talented people who are passionate about what they do', true, 'careers', 'Benefit card description'),
  ('careers.benefits.flexibility.title', 'en', 'Flexibility', true, 'careers', 'Benefit card title'),
  ('careers.benefits.flexibility.description', 'en', 'Flexible work arrangements to support work-life balance', true, 'careers', 'Benefit card description'),
  ('careers.positions.title', 'en', 'Open Positions', true, 'careers', 'Open positions section title'),
  ('careers.positions.empty', 'en', 'No open positions at the moment. Check back soon or send us your CV for future opportunities.', true, 'careers', 'Empty state text'),
  ('careers.contact.title', 'en', 'Get in Touch', true, 'careers', 'Contact section title'),
  ('careers.contact.description', 'en', 'Interested in joining us? Send your CV and a brief introduction to our careers team.', true, 'careers', 'Contact section description')
ON CONFLICT (translation_key, language_code) DO NOTHING;

-- Insert new pages into pages table
INSERT INTO pages (name, slug, title, meta_description, active, published, default_background_token, default_text_token)
VALUES
  ('About Us', 'about-us', 'About Us – Navio', 'Learn about Navio, our mission, and the team building the future of automotive services.', true, true, 'background', 'foreground'),
  ('Newsroom', 'newsroom', 'Newsroom – Navio', 'Latest news, press releases, and announcements from Navio.', true, true, 'background', 'foreground'),
  ('Careers', 'careers', 'Careers – Navio', 'Join our team and help build the future of automotive services.', true, true, 'background', 'foreground')
ON CONFLICT (slug) DO NOTHING;

-- Update header_settings to add About dropdown
-- First get the current navigation_links and append the new About dropdown
UPDATE header_settings
SET navigation_links = navigation_links || '[
  {
    "title": "About",
    "type": "static-dropdown",
    "active": true,
    "children": [
      {"title": "About Us", "url": "/about-us", "description": "Our story and mission", "active": true},
      {"title": "Newsroom", "url": "/newsroom", "description": "Press releases and news", "active": true},
      {"title": "Navio Blog", "url": "/blog", "description": "Insights and updates", "active": true},
      {"title": "Careers", "url": "/careers", "description": "Join our team", "active": true},
      {"title": "Stories", "url": "/stories", "description": "Customer success stories", "active": true}
    ]
  }
]'::jsonb
WHERE id = (SELECT id FROM header_settings ORDER BY created_at LIMIT 1);