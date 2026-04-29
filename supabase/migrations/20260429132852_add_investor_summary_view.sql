-- =====================================================
-- investor_summary_for_cms view
-- =====================================================
-- Pre-aggregates investor data for the CMS analytics list view.
-- Powers /cms/investors with one row per unique email plus
-- visit count, total dwell, NDA status, and pledge details.
-- Authenticated CMS users only — no anon access.

CREATE OR REPLACE VIEW public.investor_summary_for_cms AS
SELECT
  s.email,
  MAX(s.name) AS name,
  MAX(s.firm) AS firm,
  COUNT(s.id)::int AS total_visits,
  COALESCE(SUM(s.total_dwell_seconds), 0)::int AS total_dwell_seconds,
  MAX(s.last_seen_at) AS last_seen_at,
  MIN(s.started_at) AS first_seen_at,
  EXISTS (
    SELECT 1 FROM nda_acceptances na
    WHERE na.email = s.email
  ) AS has_accepted_nda,
  (
    SELECT MAX(na.accepted_at)
    FROM nda_acceptances na
    WHERE na.email = s.email
  ) AS nda_accepted_at,
  p.id IS NOT NULL AS has_pledge,
  p.amount_nok AS pledge_amount_nok,
  p.is_firm AS pledge_is_firm,
  p.updated_at AS pledge_updated_at
FROM investor_sessions s
LEFT JOIN investor_pledges p ON p.email = s.email
GROUP BY s.email, p.id, p.amount_nok, p.is_firm, p.updated_at;

-- Grant SELECT only to authenticated users (CMS context)
GRANT SELECT ON public.investor_summary_for_cms TO authenticated;

-- Anon role does not get access — pledge amounts and visit counts
-- must never leak to public.
