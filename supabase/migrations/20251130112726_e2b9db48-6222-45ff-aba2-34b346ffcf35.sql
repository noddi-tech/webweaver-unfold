-- Phase 1: Delete orphaned translations with empty English source
DELETE FROM translations
WHERE translation_key IN (
  'footer.contact.email_label',
  'footer.contact.location_label', 
  'footer.contact.phone_label'
);

-- Phase 3: Fix the database trigger to prevent empty source placeholders
CREATE OR REPLACE FUNCTION public.sync_new_translation_to_languages()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Only when English is inserted (not updated) AND the text is not empty
  IF NEW.language_code = 'en' AND TG_OP = 'INSERT' AND TRIM(NEW.translated_text) != '' THEN
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
$function$;