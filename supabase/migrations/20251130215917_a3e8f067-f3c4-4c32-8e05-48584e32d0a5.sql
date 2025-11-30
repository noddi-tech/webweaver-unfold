-- Function to automatically sync styling from English to all other languages
CREATE OR REPLACE FUNCTION sync_translation_styling()
RETURNS TRIGGER AS $$
BEGIN
  -- Only trigger when English styling is updated
  IF NEW.language_code = 'en' AND (
    OLD.color_token IS DISTINCT FROM NEW.color_token OR
    OLD.font_size IS DISTINCT FROM NEW.font_size OR
    OLD.font_size_mobile IS DISTINCT FROM NEW.font_size_mobile OR
    OLD.font_size_tablet IS DISTINCT FROM NEW.font_size_tablet OR
    OLD.font_size_desktop IS DISTINCT FROM NEW.font_size_desktop OR
    OLD.font_weight IS DISTINCT FROM NEW.font_weight OR
    OLD.is_italic IS DISTINCT FROM NEW.is_italic OR
    OLD.is_underline IS DISTINCT FROM NEW.is_underline
  ) THEN
    -- Update all non-English translations with the same key
    UPDATE translations
    SET 
      color_token = NEW.color_token,
      font_size = NEW.font_size,
      font_size_mobile = NEW.font_size_mobile,
      font_size_tablet = NEW.font_size_tablet,
      font_size_desktop = NEW.font_size_desktop,
      font_weight = NEW.font_weight,
      is_italic = NEW.is_italic,
      is_underline = NEW.is_underline,
      updated_at = now()
    WHERE translation_key = NEW.translation_key
      AND language_code != 'en';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create the trigger
DROP TRIGGER IF EXISTS tr_sync_translation_styling ON translations;
CREATE TRIGGER tr_sync_translation_styling
AFTER UPDATE ON translations
FOR EACH ROW
EXECUTE FUNCTION sync_translation_styling();

-- One-time sync: Update all existing non-English translations with English styling
UPDATE translations t
SET 
  color_token = en.color_token,
  font_size = en.font_size,
  font_size_mobile = en.font_size_mobile,
  font_size_tablet = en.font_size_tablet,
  font_size_desktop = en.font_size_desktop,
  font_weight = en.font_weight,
  is_italic = en.is_italic,
  is_underline = en.is_underline,
  updated_at = now()
FROM translations en
WHERE en.translation_key = t.translation_key
  AND en.language_code = 'en'
  AND t.language_code != 'en'
  AND t.color_token IS NULL;