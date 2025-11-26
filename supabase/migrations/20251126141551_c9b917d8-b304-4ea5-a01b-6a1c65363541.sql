-- Add object_position column to image_carousel_settings table
ALTER TABLE image_carousel_settings 
ADD COLUMN object_position text DEFAULT 'center' CHECK (object_position IN ('top', 'center', 'bottom'));

COMMENT ON COLUMN image_carousel_settings.object_position IS 'Vertical focal point for cover mode images: top, center, or bottom';
