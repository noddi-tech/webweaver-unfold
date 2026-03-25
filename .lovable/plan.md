

# Fix Three Security Findings

## 1. Restrict `icon_styles` and `image_sections` Write Access

**Current state:** Both tables have an overly permissive ALL policy (`auth.uid() IS NOT NULL`) alongside the admin ALL policy. Any authenticated user can write to these tables.

**Fix:** Drop the permissive ALL policies. The admin ALL policy already covers legitimate writes. Public SELECT policies remain for reads.

```sql
DROP POLICY "Icon styles manageable by authenticated users" ON public.icon_styles;
DROP POLICY "Image sections can be managed by authenticated users" ON public.image_sections;
```

**Impact:** `useIconStyle.ts`, `UnifiedStyleModal.tsx`, and `SiteStylesContext.tsx` only read `icon_styles` publicly (covered by existing SELECT policy). Writes happen in edit mode which requires admin. `SectionsManager.tsx` reads `image_sections` and is admin-only. No breakage.

---

## 2. Restrict `referral_sources` Write Access

**Current state:** An ALL policy with `USING true` / `WITH CHECK true` lets any authenticated user modify referral sources.

**Fix:** Drop the permissive policy and replace with admin-only write + public SELECT for reads (the `ApplicationForm.tsx` needs to read active sources for the dropdown).

```sql
DROP POLICY "Authenticated users can manage referral sources" ON public.referral_sources;

CREATE POLICY "Admins can manage referral sources"
ON public.referral_sources FOR ALL TO authenticated
USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY "Referral sources are viewable by everyone"
ON public.referral_sources FOR SELECT TO public
USING (true);
```

**Impact:** `SourceTrackingManager.tsx` is admin-only UI — writes continue working. `ApplicationForm.tsx` only reads active sources — covered by the new SELECT policy.

---

## 3. Security Definer View (Residual Finding)

The previous migration already recreated all three views (`public_employees`, `employees_public`, `live_translation_stats`) with `security_invoker = true` and excluded sensitive columns (email, phone, linkedin_url). The Supabase linter may need a re-scan to clear this finding. No additional migration needed unless the scanner still flags them after re-scan — in which case we'll investigate further.

---

## Summary

| Finding | Fix | Risk |
|---|---|---|
| icon_styles / image_sections open write | Drop permissive ALL policies | None — admin policy covers writes |
| referral_sources open write | Replace with admin-only write + public read | None — admin UI writes, form reads |
| Security Definer View | Already fixed in prior migration | None |

**Single migration file. No frontend code changes needed.**

