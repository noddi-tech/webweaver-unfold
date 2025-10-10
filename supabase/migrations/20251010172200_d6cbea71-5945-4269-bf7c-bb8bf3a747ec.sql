-- Phase 5: Create evaluation_progress tracking table
CREATE TABLE IF NOT EXISTS public.evaluation_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  language_code TEXT NOT NULL,
  total_keys INTEGER NOT NULL DEFAULT 0,
  evaluated_keys INTEGER NOT NULL DEFAULT 0,
  last_evaluated_key TEXT,
  started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE,
  status TEXT NOT NULL DEFAULT 'idle' CHECK (status IN ('idle', 'in_progress', 'completed', 'paused', 'error')),
  error_message TEXT,
  UNIQUE(language_code)
);

-- Enable RLS
ALTER TABLE public.evaluation_progress ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Evaluation progress viewable by everyone"
  ON public.evaluation_progress FOR SELECT
  USING (true);

CREATE POLICY "Evaluation progress manageable by authenticated users"
  ON public.evaluation_progress FOR ALL
  USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);

-- Create view for page meta statistics
CREATE OR REPLACE VIEW public.page_meta_stats AS
SELECT 
  l.code,
  l.name,
  l.enabled,
  l.sort_order,
  COUNT(DISTINCT p.slug) as total_pages,
  COUNT(pm.id) as completed_entries,
  COUNT(DISTINCT p.slug) - COUNT(pm.id) as missing_entries,
  ROUND(AVG(pm.quality_score)) as avg_quality_score,
  COUNT(CASE WHEN pm.review_status = 'needs_review' THEN 1 END) as needs_review_count,
  COUNT(CASE WHEN pm.review_status = 'approved' THEN 1 END) as approved_count
FROM languages l
CROSS JOIN (SELECT DISTINCT slug FROM pages WHERE published = true) p
LEFT JOIN page_meta_translations pm 
  ON pm.language_code = l.code 
  AND pm.page_slug = p.slug
WHERE l.enabled = true
GROUP BY l.code, l.name, l.enabled, l.sort_order
ORDER BY l.sort_order;

-- Create trigger to update evaluation_progress timestamp
CREATE OR REPLACE FUNCTION public.update_evaluation_progress_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER update_evaluation_progress_updated_at
BEFORE UPDATE ON public.evaluation_progress
FOR EACH ROW
EXECUTE FUNCTION public.update_evaluation_progress_timestamp();