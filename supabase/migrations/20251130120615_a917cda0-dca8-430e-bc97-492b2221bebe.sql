-- Clear French quality scores to reset evaluation
UPDATE translations
SET 
  quality_score = NULL,
  quality_metrics = NULL,
  ai_reviewed_at = NULL,
  review_status = CASE 
    WHEN is_stale = true THEN 'stale'
    WHEN is_intentionally_empty = true THEN 'approved'
    ELSE 'pending'
  END
WHERE language_code = 'fr';