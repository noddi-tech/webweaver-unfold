-- Add button styling columns to solutions table
ALTER TABLE solutions 
  ADD COLUMN IF NOT EXISTS footer_cta_bg_color TEXT DEFAULT 'primary',
  ADD COLUMN IF NOT EXISTS footer_cta_icon TEXT DEFAULT '',
  ADD COLUMN IF NOT EXISTS footer_cta_text_color TEXT DEFAULT 'white',
  ADD COLUMN IF NOT EXISTS hero_cta_bg_color TEXT DEFAULT 'primary',
  ADD COLUMN IF NOT EXISTS hero_cta_icon TEXT DEFAULT '',
  ADD COLUMN IF NOT EXISTS hero_cta_text_color TEXT DEFAULT 'white';