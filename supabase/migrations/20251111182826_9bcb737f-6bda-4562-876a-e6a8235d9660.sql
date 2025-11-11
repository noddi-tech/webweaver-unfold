-- Clean up duplicate carousel configs
-- First, temporarily remove the unique constraint if it exists
ALTER TABLE carousel_configs DROP CONSTRAINT IF EXISTS carousel_configs_name_key;

-- Delete duplicates, keeping only the 3 most recent unique carousels based on their images
WITH unique_carousels AS (
  SELECT DISTINCT ON (images::text) id
  FROM carousel_configs
  ORDER BY images::text, created_at DESC
)
DELETE FROM carousel_configs 
WHERE id NOT IN (SELECT id FROM unique_carousels);

-- Clean up carousel names by removing timestamp suffixes and ensuring uniqueness
WITH ranked_carousels AS (
  SELECT 
    id,
    CASE 
      WHEN name LIKE '%Booking%flow%' THEN 'Booking Flow'
      WHEN name LIKE '%Product%' THEN 'Product Gallery'  
      WHEN name LIKE '%Demo%' THEN 'Demo Carousel'
      ELSE regexp_replace(name, '\s*\([0-9]+\)', '', 'g')
    END as clean_name,
    ROW_NUMBER() OVER (
      PARTITION BY CASE 
        WHEN name LIKE '%Booking%flow%' THEN 'Booking Flow'
        WHEN name LIKE '%Product%' THEN 'Product Gallery'  
        WHEN name LIKE '%Demo%' THEN 'Demo Carousel'
        ELSE regexp_replace(name, '\s*\([0-9]+\)', '', 'g')
      END 
      ORDER BY created_at
    ) as rn
  FROM carousel_configs
  WHERE name ~ '\([0-9]+\)'
)
UPDATE carousel_configs 
SET name = CASE 
  WHEN ranked_carousels.rn = 1 THEN ranked_carousels.clean_name
  ELSE ranked_carousels.clean_name || ' ' || ranked_carousels.rn
END
FROM ranked_carousels
WHERE carousel_configs.id = ranked_carousels.id;

-- Update any orphaned references in image_carousel_settings
UPDATE image_carousel_settings 
SET carousel_config_id = (
  SELECT id FROM carousel_configs ORDER BY created_at DESC LIMIT 1
)
WHERE carousel_config_id IS NOT NULL 
AND carousel_config_id NOT IN (SELECT id FROM carousel_configs);