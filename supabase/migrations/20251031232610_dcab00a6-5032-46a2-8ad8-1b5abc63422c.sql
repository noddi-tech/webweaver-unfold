-- Fix security definer views by recreating them with security_invoker=on
-- This ensures views respect RLS policies of the querying user, not the view creator

-- Drop and recreate employees_public view
DROP VIEW IF EXISTS public.employees_public;

CREATE VIEW public.employees_public
WITH (security_invoker=on)
AS
SELECT 
  id,
  name,
  title,
  image_url,
  image_object_position,
  section,
  section_id,
  sort_order,
  active,
  created_at,
  updated_at
FROM employees
WHERE active = true;

-- Drop and recreate page_meta_stats view
DROP VIEW IF EXISTS public.page_meta_stats;

CREATE VIEW public.page_meta_stats
WITH (security_invoker=on)
AS
SELECT 
  l.code,
  l.name,
  l.enabled,
  l.sort_order,
  COUNT(DISTINCT p.slug) AS total_pages,
  COUNT(pm.id) AS completed_entries,
  (COUNT(DISTINCT p.slug) - COUNT(pm.id)) AS missing_entries,
  ROUND(AVG(pm.quality_score)) AS avg_quality_score,
  COUNT(CASE WHEN pm.review_status = 'needs_review' THEN 1 END) AS needs_review_count,
  COUNT(CASE WHEN pm.review_status = 'approved' THEN 1 END) AS approved_count
FROM languages l
CROSS JOIN (
  SELECT DISTINCT slug FROM pages WHERE published = true
) p
LEFT JOIN page_meta_translations pm ON pm.language_code = l.code AND pm.page_slug = p.slug
WHERE l.enabled = true
GROUP BY l.code, l.name, l.enabled, l.sort_order
ORDER BY l.sort_order;

-- Drop and recreate translation_stats view
DROP VIEW IF EXISTS public.translation_stats;

CREATE VIEW public.translation_stats
WITH (security_invoker=on)
AS
SELECT 
  l.code,
  l.name,
  l.enabled,
  l.sort_order,
  COUNT(t.id)::integer AS total_translations,
  COUNT(CASE WHEN t.approved = true THEN 1 END)::integer AS approved_translations,
  ROUND(
    (COUNT(CASE WHEN t.approved = true THEN 1 END)::numeric / NULLIF(COUNT(t.id), 0)::numeric) * 100,
    2
  ) AS approval_percentage,
  ROUND(AVG(t.quality_score), 2) AS avg_quality_score,
  COUNT(CASE WHEN t.quality_score >= 85 THEN 1 END)::integer AS high_quality_count,
  COUNT(CASE WHEN t.quality_score >= 70 AND t.quality_score < 85 THEN 1 END)::integer AS medium_quality_count,
  COUNT(CASE WHEN t.quality_score < 70 AND t.quality_score IS NOT NULL THEN 1 END)::integer AS low_quality_count,
  COUNT(CASE WHEN t.review_status = 'needs_review' THEN 1 END)::integer AS needs_review_count
FROM languages l
LEFT JOIN translations t ON l.code = t.language_code
GROUP BY l.code, l.name, l.enabled, l.sort_order
ORDER BY l.sort_order;