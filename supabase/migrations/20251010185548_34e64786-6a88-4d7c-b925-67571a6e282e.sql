-- Add indexes for optimizing translation queries
CREATE INDEX IF NOT EXISTS idx_translations_language_quality 
ON translations(language_code, quality_score);

CREATE INDEX IF NOT EXISTS idx_translations_language_key 
ON translations(language_code, translation_key);

CREATE INDEX IF NOT EXISTS idx_translations_review_status 
ON translations(review_status);

-- Add indexes for evaluation_progress queries
CREATE INDEX IF NOT EXISTS idx_evaluation_progress_language 
ON evaluation_progress(language_code);

CREATE INDEX IF NOT EXISTS idx_evaluation_progress_status 
ON evaluation_progress(status);

-- Add columns to evaluation_progress for enhanced tracking
ALTER TABLE evaluation_progress 
ADD COLUMN IF NOT EXISTS batch_size integer DEFAULT 20,
ADD COLUMN IF NOT EXISTS current_batch integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS error_count integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_error text;

-- Create evaluation_batches table for granular tracking
CREATE TABLE IF NOT EXISTS evaluation_batches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  language_code text NOT NULL,
  batch_number integer NOT NULL,
  batch_size integer NOT NULL DEFAULT 20,
  evaluated_count integer NOT NULL DEFAULT 0,
  failed_count integer NOT NULL DEFAULT 0,
  started_at timestamp with time zone NOT NULL DEFAULT now(),
  completed_at timestamp with time zone,
  UNIQUE(language_code, batch_number)
);

-- Enable RLS on evaluation_batches
ALTER TABLE evaluation_batches ENABLE ROW LEVEL SECURITY;

-- Create policies for evaluation_batches
CREATE POLICY "Evaluation batches viewable by everyone" 
ON evaluation_batches FOR SELECT 
USING (true);

CREATE POLICY "Evaluation batches manageable by authenticated users" 
ON evaluation_batches FOR ALL 
USING (auth.uid() IS NOT NULL)
WITH CHECK (auth.uid() IS NOT NULL);

-- Add indexes for evaluation_batches
CREATE INDEX IF NOT EXISTS idx_evaluation_batches_language 
ON evaluation_batches(language_code);

CREATE INDEX IF NOT EXISTS idx_evaluation_batches_status 
ON evaluation_batches(language_code, completed_at);

-- Create materialized view for language statistics (faster queries)
CREATE MATERIALIZED VIEW IF NOT EXISTS language_translation_stats AS
SELECT 
  l.code,
  l.name,
  l.enabled,
  l.sort_order,
  COUNT(t.id) as total_translations,
  COUNT(t.id) FILTER (WHERE t.approved = true) as approved_translations,
  ROUND(COUNT(t.id) FILTER (WHERE t.approved = true)::numeric / NULLIF(COUNT(t.id), 0) * 100, 2) as approval_percentage,
  ROUND(AVG(t.quality_score), 2) as avg_quality_score,
  COUNT(t.id) FILTER (WHERE t.quality_score >= 80) as high_quality_count,
  COUNT(t.id) FILTER (WHERE t.quality_score >= 60 AND t.quality_score < 80) as medium_quality_count,
  COUNT(t.id) FILTER (WHERE t.quality_score < 60) as low_quality_count,
  COUNT(t.id) FILTER (WHERE t.review_status = 'pending') as needs_review_count
FROM languages l
LEFT JOIN translations t ON t.language_code = l.code
GROUP BY l.code, l.name, l.enabled, l.sort_order;

-- Create index on materialized view
CREATE UNIQUE INDEX IF NOT EXISTS idx_language_translation_stats_code 
ON language_translation_stats(code);

-- Function to refresh materialized view
CREATE OR REPLACE FUNCTION refresh_language_translation_stats()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY language_translation_stats;
END;
$$;

COMMENT ON MATERIALIZED VIEW language_translation_stats IS 'Cached statistics for language translations. Refresh using refresh_language_translation_stats() function.';