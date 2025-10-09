-- Update Contact hero h1 heading to use foreground color instead of gradient
UPDATE text_content 
SET color_token = 'foreground', updated_at = now() 
WHERE page_location = 'contact' 
  AND section = 'hero' 
  AND element_type = 'h1';