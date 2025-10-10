-- Fix security issues from previous migration

-- 1. Fix function search path for refresh_language_translation_stats
DROP FUNCTION IF EXISTS refresh_language_translation_stats();
CREATE OR REPLACE FUNCTION refresh_language_translation_stats()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY language_translation_stats;
END;
$$;

-- 2. Revoke API access from materialized view (keep it internal only)
REVOKE ALL ON language_translation_stats FROM anon, authenticated;

-- 3. Grant select only to authenticated users for specific use
GRANT SELECT ON language_translation_stats TO authenticated;

COMMENT ON FUNCTION refresh_language_translation_stats() IS 'Refreshes the language_translation_stats materialized view. Should be called after bulk translation updates.';