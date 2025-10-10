-- Clean up invalid placeholder translations where translation_key equals translated_text
-- These are invalid records that were never properly translated
DELETE FROM translations
WHERE translated_text = translation_key 
  AND quality_score = 0 
  AND review_status = 'needs_review';