-- Add Stories to header navigation_links with active = false
UPDATE header_settings 
SET navigation_links = navigation_links || '[{"title": "Stories", "url": "/stories", "active": false}]'::jsonb,
    updated_at = now()
WHERE id = 'a15967b1-5dd7-4af5-823a-2189ee7069be';

-- Add Stories to footer quick_links with active = false
UPDATE footer_settings 
SET quick_links = quick_links || '[{"title": "Stories", "url": "/stories", "active": false}]'::jsonb,
    updated_at = now()
WHERE id = '957127e8-fd0a-4d8d-8ef2-928e6cd59acf';