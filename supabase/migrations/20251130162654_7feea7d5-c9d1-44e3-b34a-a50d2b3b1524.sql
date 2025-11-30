-- Create view for evaluated counts by language (bypasses Supabase row limit)
CREATE OR REPLACE VIEW evaluated_counts_by_language AS
SELECT 
  language_code,
  COUNT(*) FILTER (WHERE quality_score IS NOT NULL) as evaluated_count,
  COUNT(*) as total_count
FROM translations
WHERE language_code != 'en'
GROUP BY language_code;