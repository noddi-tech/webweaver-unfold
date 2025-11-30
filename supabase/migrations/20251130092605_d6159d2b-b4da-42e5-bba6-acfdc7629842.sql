-- Phase 1: Add missing translation keys for all enabled languages
-- Insert any English keys that don't exist in other languages
INSERT INTO translations (translation_key, language_code, translated_text, is_stale, review_status, approved)
SELECT 
  e.translation_key,
  l.code,
  '', -- Empty, needs translation
  true,
  'pending', -- Use valid review_status value
  false
FROM translations e
CROSS JOIN languages l
LEFT JOIN translations t ON e.translation_key = t.translation_key AND l.code = t.language_code
WHERE e.language_code = 'en'
AND l.code != 'en'
AND l.enabled = true
AND t.id IS NULL;

-- Phase 2: Add UPDATE trigger for quality_score changes
-- This ensures evaluation_progress updates when translations are evaluated
CREATE OR REPLACE TRIGGER sync_evaluation_on_quality_update
  AFTER UPDATE OF quality_score ON translations
  FOR EACH ROW
  EXECUTE FUNCTION sync_evaluation_progress();

-- Phase 3: Remove duplicate INSERT trigger
-- Keep only sync_evaluation_on_translation_change
DROP TRIGGER IF EXISTS sync_evaluation_progress_trigger ON translations;