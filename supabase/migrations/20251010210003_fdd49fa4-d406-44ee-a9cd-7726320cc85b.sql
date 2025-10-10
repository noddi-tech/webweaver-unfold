-- Fix SEO & Meta page slug inconsistencies and add missing pages

-- 1. Clean up duplicate entries (keep non-slash versions)
DELETE FROM page_meta_translations 
WHERE page_slug IN ('/contact', '/features', '/pricing');

-- 2. Standardize homepage slug to '/' - handle existing '/' entries
-- First, delete any existing '/' entries that might conflict
DELETE FROM page_meta_translations 
WHERE page_slug = '/' 
AND EXISTS (
  SELECT 1 FROM page_meta_translations 
  WHERE page_slug = 'homepage' 
  AND language_code = page_meta_translations.language_code
);

-- Now update 'homepage' to '/'
UPDATE page_meta_translations 
SET page_slug = '/' 
WHERE page_slug = 'homepage';

-- 3. Update pages table: standardize homepage slug
UPDATE pages 
SET slug = '/' 
WHERE slug = 'homepage';

-- 4. Add check constraint to prevent leading slash (except for '/')
ALTER TABLE page_meta_translations 
ADD CONSTRAINT page_slug_format_check 
CHECK (page_slug = '/' OR page_slug NOT LIKE '/%');

-- 5. Add missing pages that exist as routes but not in database
INSERT INTO pages (
  name, 
  slug, 
  title, 
  active, 
  published,
  default_background_token,
  default_text_token,
  default_padding_token,
  default_margin_token,
  default_max_width_token,
  layout_type,
  container_width
) VALUES 
  (
    'Functions',
    'functions',
    'Functions - Noddi',
    true,
    true,
    'background',
    'foreground',
    'section',
    'none',
    'container',
    'standard',
    'container'
  ),
  (
    'Partners',
    'partners',
    'Partners - Noddi',
    true,
    true,
    'background',
    'foreground',
    'section',
    'none',
    'container',
    'standard',
    'container'
  ),
  (
    'Architecture',
    'architecture',
    'Architecture - Noddi',
    true,
    true,
    'background',
    'foreground',
    'section',
    'none',
    'container',
    'standard',
    'container'
  )
ON CONFLICT (slug) DO NOTHING;