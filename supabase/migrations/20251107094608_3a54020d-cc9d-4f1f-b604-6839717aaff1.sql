-- Add aspect_ratio field to image_carousel_settings
ALTER TABLE public.image_carousel_settings 
ADD COLUMN IF NOT EXISTS aspect_ratio TEXT DEFAULT 'auto' 
CHECK (aspect_ratio IN ('auto', '9:16', '10:16', '3:4', '1:1', '4:3', '16:10', '16:9', '21:9'));

-- Add comment explaining the field
COMMENT ON COLUMN public.image_carousel_settings.aspect_ratio IS 
'Aspect ratio for the image/carousel container. "auto" detects from first image. Options: auto, 9:16 (phone portrait), 10:16 (tablet), 3:4 (portrait), 1:1 (square), 4:3 (classic), 16:10 (desktop), 16:9 (widescreen), 21:9 (ultrawide)';