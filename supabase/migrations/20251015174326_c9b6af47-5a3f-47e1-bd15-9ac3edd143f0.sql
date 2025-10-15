-- Phase 1: Fix translation_stats VIEW to include ALL required columns
DROP VIEW IF EXISTS translation_stats CASCADE;

CREATE VIEW translation_stats AS
SELECT 
  l.code,
  l.name,
  l.enabled,
  l.sort_order,
  COUNT(t.id)::integer as total_translations,
  COUNT(CASE WHEN t.approved = true THEN 1 END)::integer as approved_translations,
  ROUND(
    COUNT(CASE WHEN t.approved = true THEN 1 END)::NUMERIC 
    / NULLIF(COUNT(t.id), 0) * 100, 
    2
  ) as approval_percentage,
  ROUND(AVG(t.quality_score), 2) as avg_quality_score,
  COUNT(CASE WHEN t.quality_score >= 85 THEN 1 END)::integer as high_quality_count,
  COUNT(CASE WHEN t.quality_score >= 70 AND t.quality_score < 85 THEN 1 END)::integer as medium_quality_count,
  COUNT(CASE WHEN t.quality_score < 70 AND t.quality_score IS NOT NULL THEN 1 END)::integer as low_quality_count,
  COUNT(CASE WHEN t.review_status = 'needs_review' THEN 1 END)::integer as needs_review_count
FROM languages l
LEFT JOIN translations t ON l.code = t.language_code
GROUP BY l.code, l.name, l.enabled, l.sort_order
ORDER BY l.sort_order;

-- Phase 2: Reset stuck evaluations (mark as paused instead of deleting)
UPDATE evaluation_progress
SET status = 'paused',
    error_message = 'Evaluation appeared stuck and was auto-paused. Resume to continue.',
    updated_at = NOW()
WHERE status = 'in_progress' 
AND updated_at < NOW() - INTERVAL '15 minutes';

-- Phase 3: Create automatic sync trigger for evaluation_progress
CREATE OR REPLACE FUNCTION sync_evaluation_progress()
RETURNS TRIGGER AS $$
DECLARE
  lang_code text;
  total_evaluated integer;
  total_translations integer;
BEGIN
  -- Determine which language was affected
  lang_code := COALESCE(NEW.language_code, OLD.language_code);
  
  -- Skip if English (no evaluation needed)
  IF lang_code = 'en' THEN
    RETURN NEW;
  END IF;
  
  -- Count translations with quality scores for this language
  SELECT COUNT(*) INTO total_evaluated
  FROM translations 
  WHERE language_code = lang_code 
  AND quality_score IS NOT NULL;
  
  -- Get total English translations as baseline
  SELECT COUNT(*) INTO total_translations
  FROM translations
  WHERE language_code = 'en';
  
  -- Upsert evaluation_progress
  INSERT INTO evaluation_progress (
    language_code, 
    total_keys, 
    evaluated_keys, 
    status,
    updated_at
  )
  VALUES (
    lang_code,
    total_translations,
    total_evaluated,
    CASE 
      WHEN total_evaluated >= total_translations THEN 'completed'
      WHEN total_evaluated > 0 THEN 'in_progress'
      ELSE 'idle'
    END,
    NOW()
  )
  ON CONFLICT (language_code)
  DO UPDATE SET
    total_keys = EXCLUDED.total_keys,
    evaluated_keys = EXCLUDED.evaluated_keys,
    status = EXCLUDED.status,
    updated_at = NOW();
    
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing trigger if exists
DROP TRIGGER IF EXISTS sync_evaluation_progress_trigger ON translations;

-- Create trigger on translations table
CREATE TRIGGER sync_evaluation_progress_trigger
AFTER INSERT OR UPDATE OR DELETE ON translations
FOR EACH ROW
EXECUTE FUNCTION sync_evaluation_progress();

-- Phase 4: Manually sync all evaluation_progress records with actual data
WITH lang_stats AS (
  SELECT 
    l.code as language_code,
    (SELECT COUNT(*) FROM translations WHERE language_code = 'en') as total_keys,
    COUNT(CASE WHEN t.quality_score IS NOT NULL THEN 1 END)::integer as evaluated_keys
  FROM languages l
  LEFT JOIN translations t ON l.code = t.language_code
  WHERE l.code != 'en'
  GROUP BY l.code
)
INSERT INTO evaluation_progress (language_code, total_keys, evaluated_keys, status, updated_at)
SELECT 
  language_code,
  total_keys,
  evaluated_keys,
  CASE 
    WHEN evaluated_keys >= total_keys THEN 'completed'
    WHEN evaluated_keys > 0 THEN 'in_progress'
    ELSE 'idle'
  END,
  NOW()
FROM lang_stats
ON CONFLICT (language_code)
DO UPDATE SET
  total_keys = EXCLUDED.total_keys,
  evaluated_keys = EXCLUDED.evaluated_keys,
  status = EXCLUDED.status,
  updated_at = NOW();