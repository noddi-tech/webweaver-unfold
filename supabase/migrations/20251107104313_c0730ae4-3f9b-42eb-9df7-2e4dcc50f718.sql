-- Add fit_mode column to image_carousel_settings
ALTER TABLE public.image_carousel_settings 
ADD COLUMN fit_mode TEXT DEFAULT 'contain' 
CHECK (fit_mode IN ('contain', 'cover'));

COMMENT ON COLUMN public.image_carousel_settings.fit_mode IS 
'How images fit inside the card container: "contain" shows full image with letterboxing, "cover" fills container and may crop';