-- Add configurable logo image height to brand settings
ALTER TABLE public.brand_settings
ADD COLUMN IF NOT EXISTS logo_image_height INTEGER NOT NULL DEFAULT 32;