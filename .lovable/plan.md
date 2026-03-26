

# Fix: Calendar Disables Dates That Have Date-Range Overrides

## Problem
March 29 (Saturday) is disabled in the calendar even though a date-range override exists for it. The `isDateDisabled` function checks general weekly availability first (line 437-438) and disables weekends because no team member has Saturday availability configured. The date-range override check on line 442-446 never gets a chance to run.

This is the same "intersection vs override" bug, but on the **client-side calendar** rather than in the slot generation.

## Fix in `src/pages/BookMeeting.tsx`

**Reorder the `isDateDisabled` logic** — check for date-range overrides first. If a date-range match exists, the date is allowed regardless of general weekly availability.

### Current logic (lines 431-449):
1. Check past/future → disable
2. Check general weekly availability → disable if weekday not in rules
3. Check event-type availability → disable if no recurring/date-range match

### Fixed logic:
1. Check past/future → disable
2. If event-type availability exists, check for date-range match first → **if match found, allow immediately** (return false)
3. Check general weekly availability → disable if weekday not in rules
4. Check event-type recurring constraints → disable if no recurring match

One change, ~10 lines modified. No backend changes needed — the edge function already handles this correctly.

| File | Change |
|------|--------|
| `src/pages/BookMeeting.tsx` | Reorder `isDateDisabled` to check date-range overrides before general availability |

