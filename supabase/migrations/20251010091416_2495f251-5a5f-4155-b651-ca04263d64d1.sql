-- Add quality scoring columns to translations table
ALTER TABLE public.translations
ADD COLUMN quality_score INTEGER CHECK (quality_score >= 0 AND quality_score <= 100),
ADD COLUMN quality_metrics JSONB,
ADD COLUMN review_status TEXT DEFAULT 'pending' CHECK (review_status IN ('pending', 'approved', 'needs_review', 'rejected')),
ADD COLUMN ai_reviewed_at TIMESTAMPTZ;

-- Create indexes for performance
CREATE INDEX idx_translations_quality_score ON public.translations(quality_score);
CREATE INDEX idx_translations_review_status ON public.translations(review_status);
CREATE INDEX idx_translations_language_quality ON public.translations(language_code, quality_score);

-- Update translation_stats view with quality metrics
DROP VIEW IF EXISTS public.translation_stats;

CREATE VIEW public.translation_stats AS
SELECT 
  l.code,
  l.name,
  l.enabled,
  l.sort_order,
  COUNT(t.id) as total_translations,
  COUNT(CASE WHEN t.approved = true THEN 1 END) as approved_translations,
  ROUND(
    CASE 
      WHEN COUNT(t.id) > 0 
      THEN (COUNT(CASE WHEN t.approved = true THEN 1 END)::numeric / COUNT(t.id)::numeric) * 100 
      ELSE 0 
    END, 
    2
  ) as approval_percentage,
  ROUND(AVG(t.quality_score), 1) as avg_quality_score,
  COUNT(CASE WHEN t.quality_score >= 85 THEN 1 END) as high_quality_count,
  COUNT(CASE WHEN t.quality_score >= 70 AND t.quality_score < 85 THEN 1 END) as medium_quality_count,
  COUNT(CASE WHEN t.quality_score < 70 AND t.quality_score IS NOT NULL THEN 1 END) as low_quality_count,
  COUNT(CASE WHEN t.review_status = 'needs_review' THEN 1 END) as needs_review_count
FROM 
  public.languages l
LEFT JOIN 
  public.translations t ON l.code = t.language_code
GROUP BY 
  l.code, l.name, l.enabled, l.sort_order
ORDER BY 
  l.sort_order;