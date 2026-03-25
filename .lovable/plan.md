

# Fix Three Security Findings

## 1. Restrict `interview_reminders` SELECT Policy

**Current state:** Two policies exist:
- `"Admins can manage interview reminders"` (ALL, `is_admin()`) -- good
- `"Anyone can view interview reminders"` (SELECT, `USING true`) -- bad

**Fix:** Drop the public SELECT policy and replace it with one restricted to admins or the interviewer themselves. The `interviewer_id` column exists on this table.

```sql
DROP POLICY "Anyone can view interview reminders" ON public.interview_reminders;

CREATE POLICY "Admins or interviewer can view reminders"
ON public.interview_reminders
FOR SELECT TO authenticated
USING (is_admin() OR interviewer_id = auth.uid());
```

**Impact:** No frontend code reads this table publicly. Only admin dashboards and edge functions (which use service role) access it.

---

## 2. Restrict `interview_slots` Write Access

**Current state:** Two policies:
- `"Anyone can view available slots with valid token"` (SELECT, `USING true`) -- needed for candidate booking page (unauthenticated candidates query by `booking_token`)
- `"Authenticated users can manage slots"` (ALL, `USING true`, `WITH CHECK true`) -- overly permissive

**Fix:** Keep the public SELECT policy (candidates need it for self-booking). Drop the ALL policy and replace with admin-only write policies.

```sql
DROP POLICY "Authenticated users can manage slots" ON public.interview_slots;

CREATE POLICY "Admins can insert slots"
ON public.interview_slots FOR INSERT TO authenticated
WITH CHECK (is_admin());

CREATE POLICY "Admins can update slots"
ON public.interview_slots FOR UPDATE TO authenticated
USING (is_admin()) WITH CHECK (is_admin());

CREATE POLICY "Admins can delete slots"
ON public.interview_slots FOR DELETE TO authenticated
USING (is_admin());
```

Note: The candidate booking flow updates `is_available` on a slot, but this happens via the `booking_token` match. We need to allow that. Looking at the booking page, it uses the anon client. We should add a policy allowing updates when matching a valid booking token:

```sql
CREATE POLICY "Candidates can book via valid token"
ON public.interview_slots FOR UPDATE TO anon, authenticated
USING (booking_token IS NOT NULL AND is_available = true)
WITH CHECK (is_available = false);
```

**Impact:** SlotManager.tsx only runs for admins. CandidateBooking.tsx continues working via the token-based update policy.

---

## 3. Remove SECURITY DEFINER from Views

Three views are flagged: `public_employees`, `employees_public`, `live_translation_stats`.

These are simple read-only views over public tables. They don't need SECURITY DEFINER. Replace them with SECURITY INVOKER (the default).

```sql
-- Recreate public_employees without SECURITY DEFINER
CREATE OR REPLACE VIEW public.public_employees
WITH (security_invoker = true) AS
SELECT id, name, title, image_url, image_object_position,
       section, section_id, sort_order, active, created_at, updated_at
FROM employees WHERE active = true;

-- Recreate employees_public without SECURITY DEFINER
CREATE OR REPLACE VIEW public.employees_public
WITH (security_invoker = true) AS
SELECT id, name, title, image_url, image_object_position,
       section, section_id, sort_order, active, created_at, updated_at
FROM employees WHERE active = true;

-- Recreate live_translation_stats without SECURITY DEFINER
-- (uses same definition, just without security definer)
CREATE OR REPLACE VIEW public.live_translation_stats
WITH (security_invoker = true) AS
<existing definition>;
```

**Impact:** These views query tables that already have permissive SELECT policies for public/authenticated users, so switching to SECURITY INVOKER won't break reads. The `language_translation_stats` materialized view is unaffected (materialized views don't have SECURITY DEFINER concerns in the same way).

---

## Summary

| Finding | Fix | Risk |
|---|---|---|
| interview_reminders public read | Replace with admin+interviewer policy | None -- only admin UI reads it |
| interview_slots unrestricted write | Admin-only write + token-based booking update | Low -- verify candidate booking flow |
| SECURITY DEFINER views | Recreate with `security_invoker = true` | None -- underlying tables have correct RLS |

**No frontend code changes needed.** All fixes are database migrations only.

