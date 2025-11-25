-- Update logo-marquee sort order to move it to the top of dropdowns
UPDATE sections 
SET sort_order = 0 
WHERE name = 'logo-marquee';

-- Make Hero sections distinguishable by page location
UPDATE sections 
SET display_name = 'Hero Section (Homepage)' 
WHERE name = 'hero' AND page_location = 'homepage';

UPDATE sections 
SET display_name = 'Hero Section (Features Page)' 
WHERE name = 'hero' AND page_location = 'features';

UPDATE sections 
SET display_name = 'Hero Section (Demo Page)' 
WHERE name = 'hero' AND page_location = 'demo';

-- Make Features sections distinguishable
UPDATE sections 
SET display_name = 'Features (Homepage)' 
WHERE name = 'features' AND page_location = 'homepage';