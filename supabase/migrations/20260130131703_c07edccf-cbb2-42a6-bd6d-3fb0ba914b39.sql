
-- Mark the 4 empty English detail keys as intentionally empty
UPDATE translations 
SET is_intentionally_empty = true, 
    review_status = 'approved',
    updated_at = now()
WHERE language_code = 'en' 
  AND translation_key IN (
    'how_it_works.step_1.details',
    'how_it_works.step_2.details', 
    'how_it_works.step_3.details',
    'how_it_works.step_4.details'
  )
  AND (translated_text IS NULL OR translated_text = '');

-- Also mark the corresponding non-English placeholders as intentionally empty
UPDATE translations 
SET is_intentionally_empty = true,
    review_status = 'approved',
    updated_at = now()
WHERE language_code != 'en' 
  AND translation_key IN (
    'how_it_works.step_1.details',
    'how_it_works.step_2.details', 
    'how_it_works.step_3.details',
    'how_it_works.step_4.details'
  );
