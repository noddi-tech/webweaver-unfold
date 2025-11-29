-- Phase 1: Add tracking columns to translations table
ALTER TABLE translations 
ADD COLUMN IF NOT EXISTS source_hash TEXT,
ADD COLUMN IF NOT EXISTS source_updated_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS is_stale BOOLEAN DEFAULT false;

-- Phase 2: Create trigger function to flag stale translations
CREATE OR REPLACE FUNCTION flag_stale_translations()
RETURNS TRIGGER AS $$
BEGIN
  -- Only run when English is updated and text actually changed
  IF NEW.language_code = 'en' AND (OLD.translated_text IS DISTINCT FROM NEW.translated_text) THEN
    -- Compute new hash of English text
    NEW.source_hash := MD5(NEW.translated_text);
    NEW.source_updated_at := NOW();
    NEW.is_stale := false;
    
    -- Mark all other language translations for this key as stale
    UPDATE translations 
    SET is_stale = true,
        review_status = 'stale'
    WHERE translation_key = NEW.translation_key 
    AND language_code != 'en';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger on translations table
DROP TRIGGER IF EXISTS tr_flag_stale_translations ON translations;
CREATE TRIGGER tr_flag_stale_translations
BEFORE UPDATE ON translations
FOR EACH ROW
EXECUTE FUNCTION flag_stale_translations();

-- Backfill source_hash for existing English translations
UPDATE translations 
SET source_hash = MD5(translated_text),
    source_updated_at = updated_at,
    is_stale = false
WHERE language_code = 'en';

-- Mark existing non-English translations as potentially stale
UPDATE translations
SET is_stale = true
WHERE language_code != 'en' 
AND approved = false;