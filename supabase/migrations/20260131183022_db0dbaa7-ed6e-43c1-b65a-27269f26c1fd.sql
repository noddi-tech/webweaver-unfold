-- Create live_translation_stats view for accurate real-time stats
CREATE OR REPLACE VIEW live_translation_stats AS
WITH english_keys AS (
  SELECT 
    COUNT(*) as total_english_keys,
    COUNT(CASE WHEN translated_text IS NOT NULL AND translated_text != '' THEN 1 END) as actual_english_keys
  FROM translations 
  WHERE language_code = 'en'
)
SELECT 
  l.code,
  l.name,
  l.enabled,
  l.show_in_switcher,
  l.sort_order,
  ek.total_english_keys as english_key_count,
  COUNT(t.id) as total_rows,
  COUNT(CASE WHEN t.translated_text IS NOT NULL AND t.translated_text != '' THEN 1 END) as actual_translations,
  COUNT(CASE WHEN t.translated_text IS NULL OR t.translated_text = '' THEN 1 END) as empty_count,
  COUNT(CASE WHEN t.is_stale = true THEN 1 END) as stale_count,
  COUNT(CASE WHEN t.approved = true THEN 1 END) as approved_count,
  COUNT(CASE WHEN t.quality_score IS NOT NULL AND t.quality_score >= 1 THEN 1 END) as evaluated_count,
  ROUND(AVG(CASE WHEN t.quality_score IS NOT NULL AND t.quality_score >= 1 THEN t.quality_score END)::numeric, 1) as avg_quality_score,
  ek.total_english_keys - COUNT(t.id) as missing_rows
FROM languages l
CROSS JOIN english_keys ek
LEFT JOIN translations t ON t.language_code = l.code
WHERE l.enabled = true
GROUP BY l.code, l.name, l.enabled, l.show_in_switcher, l.sort_order, ek.total_english_keys, ek.actual_english_keys
ORDER BY l.sort_order;