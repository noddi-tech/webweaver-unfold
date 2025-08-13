-- Remove the features section from demo page as it doesn't exist
DELETE FROM public.sections 
WHERE page_location = 'demo' AND name = 'features';