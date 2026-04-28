-- =====================================================
-- Rate-limit support for the investor portal gate
-- =====================================================
-- Tracks each call to validate-portal-access so the function
-- can refuse IPs with too many recent failed attempts.
-- =====================================================

CREATE TABLE public.access_attempts (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ip_address   inet NOT NULL,
  email        text,
  success      boolean NOT NULL,
  attempted_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_access_attempts_ip_time
  ON public.access_attempts (ip_address, attempted_at DESC);

ALTER TABLE public.access_attempts ENABLE ROW LEVEL SECURITY;

-- Service role bypasses RLS, so the Edge Function writes freely.
-- Admins can inspect attempts via the CMS.
CREATE POLICY "Admins read access attempts"
  ON public.access_attempts FOR SELECT
  TO authenticated
  USING (public.is_admin());

CREATE POLICY "Admins delete access attempts"
  ON public.access_attempts FOR DELETE
  TO authenticated
  USING (public.is_admin());

-- Hourly prune of rows older than 24h. Matches the existing
-- pg_cron pattern used for blog publishing.
SELECT cron.schedule(
  'prune-access-attempts',
  '0 * * * *',
  $$DELETE FROM public.access_attempts WHERE attempted_at < now() - interval '24 hours'$$
);
