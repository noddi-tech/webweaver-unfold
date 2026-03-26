

# Fix: Event Date Ranges Should Override General Availability

## Problem
Event-type date ranges currently **intersect with** (constrain by) general weekly availability. They should **replace** it. When you say "Trade fair Mar 30, 10:00–20:00", that means the member is available 10–20 on that date — their normal Mon–Fri 09:00–16:00 schedule is irrelevant.

Two bugs:
1. Date-range times use `Math.max`/`Math.min` with general rules, so the window shrinks to the overlap (10:00–16:00 instead of 10:00–20:00)
2. If no general `availability_rules` exist for that weekday (e.g., Saturday trade fair), the function returns empty — even if the event has a date range covering it

## Solution

### `supabase/functions/get-availability/index.ts`

**When a date-range match exists**, bypass the general availability requirement and use the date-range times as the bookable window directly:

1. **Move date-range detection earlier** (before fetching `availability_rules`)
2. **If date-range match found**: skip the `availability_rules` query; use `matchingDateRange.start_time`/`end_time` as the window; treat all assigned members as available within that window (skip per-member `rule.start_time`/`end_time` check in the slot loop)
3. **If no date-range match**: keep existing logic (general rules + optional recurring constraint)

Specifically:
- Lines 149-164: Make general `availability_rules` fetch conditional — only required when no date-range override applies
- Lines 291-295: When date-range active, set `windowStart`/`windowEnd` from the date range directly (not intersected)
- Lines 331-334: When date-range active, skip the per-member `mStart`/`mEnd` check (members are available per the event override)

### `src/pages/BookMeeting.tsx`

Mirror the same logic in the client-side fallback slot generation.

### Re-deploy edge function

Deploy updated `get-availability`.

## Files to change

| File | Change |
|------|--------|
| `supabase/functions/get-availability/index.ts` | Date-range overrides general availability instead of constraining it |
| `src/pages/BookMeeting.tsx` | Mirror same override logic in client fallback |

