-- Fix stuck translations that have quality_score = 0 (preventing re-evaluation)
-- These translations were incorrectly marked as evaluated with score 0
-- Resetting to NULL allows them to be evaluated again

UPDATE translations 
SET 
  quality_score = NULL, 
  ai_reviewed_at = NULL,
  review_status = 'pending'
WHERE quality_score = 0;