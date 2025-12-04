-- Drop and recreate the translation_stats view with actual/missing translation counts
DROP VIEW IF EXISTS translation_stats;

CREATE VIEW translation_stats AS
SELECT 
  l.code,
  l.name,
  l.enabled,
  l.sort_order,
  -- Total rows (includes empty placeholders)
  count(t.id)::integer AS total_translations,
  -- NEW: Count only rows with actual translated text (non-empty)
  count(CASE WHEN t.translated_text IS NOT NULL AND t.translated_text != '' THEN 1 END)::integer AS actual_translations,
  -- NEW: Count empty/missing translations
  count(CASE WHEN t.translated_text IS NULL OR t.translated_text = '' THEN 1 END)::integer AS missing_translations,
  -- Approved count
  count(CASE WHEN t.approved = true THEN 1 END)::integer AS approved_translations,
  -- Approval percentage (of actual translations, not total rows)
  CASE 
    WHEN count(CASE WHEN t.translated_text IS NOT NULL AND t.translated_text != '' THEN 1 END) > 0 
    THEN round(
      (count(CASE WHEN t.approved = true THEN 1 END)::numeric / 
       count(CASE WHEN t.translated_text IS NOT NULL AND t.translated_text != '' THEN 1 END)::numeric) * 100, 2
    )
    ELSE 0 
  END AS approval_percentage,
  -- Quality metrics
  round(avg(t.quality_score)::numeric, 2) AS avg_quality_score,
  count(CASE WHEN t.quality_score >= 85 THEN 1 END)::integer AS high_quality_count,
  count(CASE WHEN t.quality_score >= 70 AND t.quality_score < 85 THEN 1 END)::integer AS medium_quality_count,
  count(CASE WHEN t.quality_score < 70 THEN 1 END)::integer AS low_quality_count,
  count(CASE WHEN t.review_status = 'needs_review' THEN 1 END)::integer AS needs_review_count
FROM languages l
LEFT JOIN translations t ON l.code = t.language_code
WHERE l.enabled = true
GROUP BY l.code, l.name, l.enabled, l.sort_order
ORDER BY l.sort_order;