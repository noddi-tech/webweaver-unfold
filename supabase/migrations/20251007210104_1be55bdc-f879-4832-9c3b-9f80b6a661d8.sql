-- Update header navigation links to include Functions, Partners, Architecture
UPDATE header_settings 
SET navigation_links = jsonb_build_array(
  jsonb_build_object('title', 'Home', 'url', '/', 'active', true),
  jsonb_build_object('title', 'Functions', 'url', '/functions', 'active', true),
  jsonb_build_object('title', 'Partners', 'url', '/partners', 'active', true),
  jsonb_build_object('title', 'Architecture', 'url', '/architecture', 'active', true),
  jsonb_build_object('title', 'Pricing', 'url', '/pricing', 'active', true),
  jsonb_build_object('title', 'Contact', 'url', '/contact', 'active', true)
)
WHERE id IN (SELECT id FROM header_settings LIMIT 1);

-- Update footer settings with new company description and quick links
UPDATE footer_settings 
SET 
  company_description = 'Noddi Tech builds unified software for automotive service providers—where frontend and backend finally speak the same language.',
  quick_links = jsonb_build_array(
    jsonb_build_object('title', 'Functions', 'url', '/functions', 'active', true),
    jsonb_build_object('title', 'Partners', 'url', '/partners', 'active', true),
    jsonb_build_object('title', 'Architecture', 'url', '/architecture', 'active', true),
    jsonb_build_object('title', 'Pricing', 'url', '/pricing', 'active', true),
    jsonb_build_object('title', 'Contact', 'url', '/contact', 'active', true)
  )
WHERE id IN (SELECT id FROM footer_settings LIMIT 1);