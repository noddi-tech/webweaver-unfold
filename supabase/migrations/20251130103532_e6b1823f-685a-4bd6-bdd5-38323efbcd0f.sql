-- ✅ Phase 4: Database Cleanup - Reset Timestamps
-- Normalize started_at and completed_at timestamps for evaluation_progress

UPDATE evaluation_progress
SET 
  completed_at = CASE 
    WHEN evaluated_keys >= total_keys THEN now()
    ELSE NULL
  END,
  started_at = CASE 
    -- Reset old "idle" records to have recent started_at
    WHEN status = 'idle' AND started_at < now() - INTERVAL '7 days' THEN now()
    ELSE started_at
  END,
  updated_at = now();