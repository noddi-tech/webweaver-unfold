-- Add new columns for card layout controls to image_carousel_settings
ALTER TABLE image_carousel_settings 
ADD COLUMN IF NOT EXISTS card_height text DEFAULT 'h-[500px]',
ADD COLUMN IF NOT EXISTS card_width text DEFAULT 'w-full',
ADD COLUMN IF NOT EXISTS card_border_radius text DEFAULT 'rounded-2xl',
ADD COLUMN IF NOT EXISTS card_gap text DEFAULT 'gap-8';

-- Add comment explaining the new columns
COMMENT ON COLUMN image_carousel_settings.card_height IS 'Tailwind height class for card container (e.g., h-[500px])';
COMMENT ON COLUMN image_carousel_settings.card_width IS 'Tailwind width class for card container (e.g., w-full)';
COMMENT ON COLUMN image_carousel_settings.card_border_radius IS 'Tailwind border radius class for card container (e.g., rounded-2xl)';
COMMENT ON COLUMN image_carousel_settings.card_gap IS 'Tailwind gap class for spacing between cards (e.g., gap-8)';