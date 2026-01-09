-- Fix overly permissive policy - require at least user_id to be set or null
DROP POLICY IF EXISTS "Anyone can apply to jobs" ON public.job_applications;

-- More restrictive policy: if user is logged in, user_id must match; if not logged in, user_id must be null
CREATE POLICY "Users can apply to jobs" ON public.job_applications
  FOR INSERT WITH CHECK (
    (auth.uid() IS NOT NULL AND auth.uid() = user_id) OR
    (auth.uid() IS NULL AND user_id IS NULL)
  );