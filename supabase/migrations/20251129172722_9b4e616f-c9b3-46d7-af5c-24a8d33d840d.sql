-- Phase 1: Delete broken translation entries where translated_text equals translation_key
-- This removes placeholder entries that were incorrectly created
DELETE FROM translations 
WHERE translated_text = translation_key 
AND language_code != 'en';

-- Phase 5: Create trigger to auto-create placeholder entries when English translations are inserted
CREATE OR REPLACE FUNCTION sync_new_translation_to_languages()
RETURNS TRIGGER AS $$
BEGIN
  -- Only when English is inserted (not updated)
  IF NEW.language_code = 'en' AND TG_OP = 'INSERT' THEN
    -- Insert empty placeholders for all other enabled languages
    INSERT INTO translations (translation_key, language_code, translated_text, is_stale, review_status, approved, context, page_location)
    SELECT 
      NEW.translation_key,
      l.code,
      '', -- Empty string, not the key name!
      true,
      'needs_translation',
      false,
      NEW.context,
      NEW.page_location
    FROM languages l
    WHERE l.enabled = true AND l.code != 'en'
    ON CONFLICT (translation_key, language_code) DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER tr_sync_new_translation_to_languages
AFTER INSERT ON translations
FOR EACH ROW
EXECUTE FUNCTION sync_new_translation_to_languages();