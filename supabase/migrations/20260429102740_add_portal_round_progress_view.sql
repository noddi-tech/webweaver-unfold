-- =====================================================
-- portal_round_progress view
-- =====================================================
-- Aggregates pledge totals against the active round size for the
-- progress bar in the investor portal header. The view aggregates
-- so no individual pledge is exposed to portal readers.

CREATE OR REPLACE VIEW public.portal_round_progress AS
SELECT
  COALESCE(SUM(CASE WHEN p.is_firm THEN p.amount_nok ELSE 0 END), 0)::bigint
    AS total_pledged_firm_nok,
  COALESCE(SUM(p.amount_nok), 0)::bigint
    AS total_pledged_all_nok,
  COUNT(p.id)::int AS pledge_count,
  (SELECT round_size_max_nok
     FROM public.portal_round_terms
     WHERE is_active = true
     LIMIT 1)::bigint AS round_size_max_nok
FROM public.investor_pledges p;

GRANT SELECT ON public.portal_round_progress TO anon, authenticated;
