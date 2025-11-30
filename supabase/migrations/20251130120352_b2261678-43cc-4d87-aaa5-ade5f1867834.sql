-- Phase 1: Complete Database Reset of Evaluation Data

-- Step 1: Clear all quality scores from translations (preserve content, reset evaluation metadata)
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
WHERE language_code != 'en';

-- Step 2: Reset all evaluation progress entries  
DELETE FROM evaluation_progress;

-- Step 3: Clear any evaluation batches
DELETE FROM evaluation_batches;