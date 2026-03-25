-- 1. Fix interview_reminders: restrict SELECT to admins or the interviewer
DROP POLICY IF EXISTS "Anyone can view interview reminders" ON public.interview_reminders;

CREATE POLICY "Admins or interviewer can view reminders"
ON public.interview_reminders
FOR SELECT TO authenticated
USING (public.is_admin() OR interviewer_id = auth.uid());

-- 2. Fix interview_slots: replace permissive ALL policy with scoped policies
DROP POLICY IF EXISTS "Authenticated users can manage slots" ON public.interview_slots;

CREATE POLICY "Admins can insert slots"
ON public.interview_slots FOR INSERT TO authenticated
WITH CHECK (public.is_admin());

CREATE POLICY "Admins can update slots"
ON public.interview_slots FOR UPDATE TO authenticated
USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY "Admins can delete slots"
ON public.interview_slots FOR DELETE TO authenticated
USING (public.is_admin());

-- Allow candidates (anon or authenticated) to book a slot via valid token
CREATE POLICY "Candidates can book via valid token"
ON public.interview_slots FOR UPDATE TO anon, authenticated
USING (booking_token IS NOT NULL AND is_available = true)
WITH CHECK (is_available = false);

-- 3. Fix SECURITY DEFINER views: recreate with security_invoker = true
DROP VIEW IF EXISTS public.public_employees;
CREATE VIEW public.public_employees
WITH (security_invoker = true) AS
SELECT id, name, title, image_url, image_object_position,
       section, section_id, sort_order, active, created_at, updated_at
FROM employees WHERE active = true;

DROP VIEW IF EXISTS public.employees_public;
CREATE VIEW public.employees_public
WITH (security_invoker = true) AS
SELECT id, name, title, image_url, image_object_position,
       section, section_id, sort_order, active, created_at, updated_at
FROM employees WHERE active = true;

DROP VIEW IF EXISTS public.live_translation_stats;
CREATE VIEW public.live_translation_stats
WITH (security_invoker = true) AS
WITH english_keys AS (
  SELECT count(*) AS total_english_keys,
    count(CASE WHEN translated_text IS NOT NULL AND translated_text <> '' THEN 1 END) AS actual_english_keys
  FROM translations WHERE language_code = 'en'
)
SELECT l.code, l.name, l.enabled, l.show_in_switcher, l.sort_order,
  ek.total_english_keys AS english_key_count,
  count(t.id) AS total_rows,
  count(CASE WHEN t.translated_text IS NOT NULL AND t.translated_text <> '' THEN 1 END) AS actual_translations,
  count(CASE WHEN t.translated_text IS NULL OR t.translated_text = '' THEN 1 END) AS empty_count,
  count(CASE WHEN t.is_stale = true THEN 1 END) AS stale_count,
  count(CASE WHEN t.approved = true THEN 1 END) AS approved_count,
  count(CASE WHEN t.quality_score IS NOT NULL AND t.quality_score >= 1 THEN 1 END) AS evaluated_count,
  round(avg(CASE WHEN t.quality_score IS NOT NULL AND t.quality_score >= 1 THEN t.quality_score END), 1) AS avg_quality_score,
  (ek.total_english_keys - count(t.id)) AS missing_rows
FROM languages l
CROSS JOIN english_keys ek
LEFT JOIN translations t ON t.language_code = l.code
WHERE l.enabled = true
GROUP BY l.code, l.name, l.enabled, l.show_in_switcher, l.sort_order, ek.total_english_keys, ek.actual_english_keys
ORDER BY l.sort_order;