-- Clean up orphaned translations that don't exist in English baseline

-- Delete orphaned translations in Italian (2 keys)
DELETE FROM translations 
WHERE language_code = 'it' 
AND translation_key IN (
  ':team_highlight.expertise_2.title',  -- Invalid key with leading colon
  'why_i_noddi.before.item_3'           -- Typo: "why_i_noddi" instead of "why_noddi"
);

-- Delete orphaned translation in Danish (1 key)
DELETE FROM translations
WHERE language_code = 'da'
AND translation_key = 'why_it_mattes.pain_points.sync.problem'; -- Typo: "mattes" instead of "matters"

-- Verify cleanup (this will show counts after deletion)
SELECT 
  language_code,
  COUNT(*) as translation_count
FROM translations
WHERE language_code IN ('en', 'it', 'da')
GROUP BY language_code
ORDER BY language_code;