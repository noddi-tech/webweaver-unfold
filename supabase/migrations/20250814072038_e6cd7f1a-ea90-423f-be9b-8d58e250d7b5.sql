-- Import all existing pages from the application routes
INSERT INTO public.pages (name, slug, title, meta_description, default_background_token, default_text_token, active, published) VALUES
  ('Homepage', 'homepage', 'Software that transforms car maintenance', 'Brick-and-mortar services are facing its Kodak moment, as the car maintenance industry falls behind on customer centricity.', 'background', 'foreground', true, true),
  ('Features', 'features', 'Platform Features - Noddi Tech', 'Discover the comprehensive features of our mobile car maintenance platform designed to transform your business operations.', 'background', 'foreground', true, true),
  ('Contact', 'contact', 'Contact Us - Noddi Tech', 'Get in touch with our team to learn more about how we can help transform your car maintenance business.', 'background', 'foreground', true, true),
  ('Demo', 'demo', 'Live Demo - Noddi Tech', 'See our platform in action with live demos and interactive tutorials showcasing our mobile service capabilities.', 'background', 'foreground', true, true),
  ('Team', 'team', 'Our Team - Noddi Tech', 'Meet the experienced team behind Noddi Tech who are dedicated to revolutionizing the car maintenance industry.', 'background', 'foreground', true, true),
  ('Auth', 'auth', 'Sign In - Noddi Tech', 'Access your Noddi Tech account to manage your mobile car maintenance business operations.', 'background', 'foreground', true, false),
  ('Admin', 'admin', 'Admin Dashboard - Noddi Tech', 'Administrative dashboard for managing content and design system settings.', 'background', 'foreground', true, false)

-- Handle conflict with existing homepage entry
ON CONFLICT (slug) 
DO UPDATE SET 
  title = EXCLUDED.title,
  meta_description = EXCLUDED.meta_description,
  active = EXCLUDED.active,
  published = EXCLUDED.published,
  updated_at = now();

-- Create additional pages for common website sections
INSERT INTO public.pages (name, slug, title, meta_description, default_background_token, default_text_token, active, published) VALUES
  ('About', 'about', 'About Us - Noddi Tech', 'Learn about our mission to transform the car maintenance industry with innovative mobile service solutions.', 'background', 'foreground', false, false),
  ('Blog', 'blog', 'Blog - Noddi Tech', 'Stay updated with the latest insights, tips, and news from the mobile car maintenance industry.', 'background', 'foreground', false, false),
  ('Pricing', 'pricing', 'Pricing - Noddi Tech', 'Transparent pricing for our mobile car maintenance platform and services.', 'background', 'foreground', false, false),
  ('Privacy Policy', 'privacy-policy', 'Privacy Policy - Noddi Tech', 'Our commitment to protecting your privacy and personal information.', 'background', 'foreground', false, false),
  ('Terms of Service', 'terms-of-service', 'Terms of Service - Noddi Tech', 'Terms and conditions for using our mobile car maintenance platform.', 'background', 'foreground', false, false)

ON CONFLICT (slug) DO NOTHING;