-- Update Pricing page to use gradient-hero background (matching Contact, Team, Demo, Features)
UPDATE pages 
SET default_background_token = 'gradient-hero'
WHERE slug = 'pricing';