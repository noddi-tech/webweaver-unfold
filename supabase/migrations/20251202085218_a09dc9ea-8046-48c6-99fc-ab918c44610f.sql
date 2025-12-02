-- Restrict evaluation metrics to authenticated users only
-- This prevents public access to internal translation quality metrics

-- Drop the overly permissive public SELECT policies
DROP POLICY IF EXISTS "Evaluation progress viewable by everyone" ON evaluation_progress;
DROP POLICY IF EXISTS "Evaluation batches viewable by everyone" ON evaluation_batches;

-- Create new policies that restrict to authenticated users (CMS editors)
CREATE POLICY "Evaluation progress viewable by authenticated users"
ON evaluation_progress FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Evaluation batches viewable by authenticated users" 
ON evaluation_batches FOR SELECT
TO authenticated
USING (true);