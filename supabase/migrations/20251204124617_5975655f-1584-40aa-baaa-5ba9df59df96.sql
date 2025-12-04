-- BULLETPROOF FIX: Prevent approving unevaluated translations + fix bad data

-- Phase 1: Add trigger to prevent approving unevaluated translations
CREATE OR REPLACE FUNCTION prevent_unevaluated_approval()
RETURNS TRIGGER AS $$
BEGIN
    -- Allow approving if quality_score exists (has been evaluated)
    -- OR if it's English (source language, doesn't need evaluation)
    IF NEW.approved = true 
       AND NEW.quality_score IS NULL 
       AND NEW.language_code != 'en' THEN
        NEW.approved := false;
        RAISE WARNING 'Cannot approve unevaluated translation: %. Setting approved to false.', NEW.translation_key;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger (drop first if exists)
DROP TRIGGER IF EXISTS check_unevaluated_approval ON translations;
CREATE TRIGGER check_unevaluated_approval
    BEFORE INSERT OR UPDATE ON translations
    FOR EACH ROW
    EXECUTE FUNCTION prevent_unevaluated_approval();

-- Phase 2: Fix existing bad data - un-approve all unevaluated non-English translations
UPDATE translations 
SET approved = false, updated_at = now()
WHERE approved = true 
  AND quality_score IS NULL
  AND language_code != 'en';