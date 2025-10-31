-- Add detailed content fields to solutions table
ALTER TABLE solutions
ADD COLUMN IF NOT EXISTS hero_title TEXT,
ADD COLUMN IF NOT EXISTS hero_subtitle TEXT,
ADD COLUMN IF NOT EXISTS hero_description TEXT,
ADD COLUMN IF NOT EXISTS hero_image_url TEXT,
ADD COLUMN IF NOT EXISTS hero_cta_text TEXT,
ADD COLUMN IF NOT EXISTS hero_cta_url TEXT,
ADD COLUMN IF NOT EXISTS description_heading TEXT,
ADD COLUMN IF NOT EXISTS description_text TEXT,
ADD COLUMN IF NOT EXISTS key_benefits JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS footer_heading TEXT,
ADD COLUMN IF NOT EXISTS footer_text TEXT,
ADD COLUMN IF NOT EXISTS footer_cta_text TEXT,
ADD COLUMN IF NOT EXISTS footer_cta_url TEXT;

-- Add comment for key_benefits structure
COMMENT ON COLUMN solutions.key_benefits IS 'Array of objects with: heading (string), text (string), image_url (string)';