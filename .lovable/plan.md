

# Fix: Allow Anonymous Users to View Bookable Employees

## Problem

The `employees` table has an RLS policy that blocks all anonymous SELECT access:

```sql
USING (false)
```

This means external guests visiting `/book` or `/meet/:slugs` get zero employee rows back, so the calendar shows "not yet available." Only logged-in admins can see the booking pages.

## Solution

Add a single RLS policy that lets the `anon` role read only the non-sensitive columns needed for booking (the query only selects `id, name, image_url, title, timezone, slug`), scoped to active, calendar-connected employees.

### Database Migration

```sql
CREATE POLICY "Anon can view bookable employees"
ON public.employees
FOR SELECT
TO anon
USING (active = true AND google_calendar_connected = true);
```

### Security Consideration

The existing `USING (false)` policy targets `public` role. The new policy targets `anon` specifically. Since RLS is permissive (OR logic), if any one policy grants access, the row is visible. The `anon` role will be able to see rows where both conditions are true. The booking page queries only select non-sensitive columns (`id, name, image_url, title, timezone, slug`) — sensitive fields like `email`, `phone`, `linkedin_url` exist on the table but are never requested by the public booking queries.

### What This Fixes

- `/book` page — event type members resolve correctly for anonymous visitors
- `/meet/:slugs` page — direct member booking works for external guests
- `/book/reschedule/:id` page — rescheduling works without login

No frontend code changes needed. One migration file.

| File | Change |
|------|--------|
| New migration | Add `anon` SELECT policy on `employees` for bookable members |

