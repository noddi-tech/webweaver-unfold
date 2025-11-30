-- Phase 1: Reset stuck evaluations and clean orphaned Greek translations

-- Reset Spanish, Italian, Portuguese from 'in_progress' to 'idle'
UPDATE evaluation_progress
SET 
  status = 'idle',
  updated_at = now()
WHERE language_code IN ('es', 'it', 'pt')
AND status = 'in_progress';

-- Clean up orphaned Greek translations (translations without English source)
DELETE FROM translations
WHERE language_code = 'el'
AND translation_key NOT IN (
  SELECT translation_key 
  FROM translations 
  WHERE language_code = 'en'
);