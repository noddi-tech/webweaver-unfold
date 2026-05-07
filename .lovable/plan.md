## Goal
Make AI proactively apply style references on every draft, not only when explicitly invoked.

## Changes

### 1. `supabase/functions/draft-slide/index.ts` (line 66)
Replace the single-line `STYLE REFERENCES:` paragraph in `SYSTEM_PROMPT` with the new multi-step directive (mandatory application, 4-step process, anti-pattern enforcement, "respect editor's curated taste by default"). All other prompt sections (DESIGN PRINCIPLES, OUTPUT LANGUAGE, OUTPUT FORMAT) untouched.

### 2. `supabase/functions/refine-slide-draft/index.ts` (line 99)
Identical replacement of the `STYLE REFERENCES:` paragraph with the same new wording.

### 3. Deploy
Redeploy both `draft-slide` and `refine-slide-draft` edge functions via `supabase--deploy_edge_functions`.

## Verification
User will generate a fresh `product-one-liner` draft with no editor direction and confirm output reflects Linear/YC/Apple-style opinionated choices.

## Out of scope
No schema changes, no audit-log changes, no UI changes.