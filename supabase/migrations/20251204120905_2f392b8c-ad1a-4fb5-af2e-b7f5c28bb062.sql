-- Add CHECK constraint to prevent quality_score = 0 at database level
-- This is the final safety net - even if buggy code tries to insert 0, the database will reject it
ALTER TABLE translations 
ADD CONSTRAINT quality_score_valid_range 
CHECK (quality_score IS NULL OR quality_score >= 1);