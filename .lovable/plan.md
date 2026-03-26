

# Use Edge Functions for Real Availability

## Summary

The current code already calls the edge functions and handles most scenarios. Three gaps remain: (1) edge function errors don't fall back to client-side logic, (2) time slot buttons don't show which team member is available, and (3) the confirmation screen doesn't differentiate between successful calendar creation and graceful degradation.

## Changes — `src/pages/BookMeeting.tsx`

### 1. Fix fallback on edge function error

Line 215 currently sets `setServerSlots([])` on error, which shows "no slots" instead of falling back to client-side calculation. Change to `setServerSlots(null)` so the `availableSlots` memo uses the client-side path.

### 2. Show member names on time slot buttons

Store the full server slot data (with `available_members` arrays) alongside the Date-based slots. When `requires_all_members` is false, render a subtle label under each time showing the available member name(s) by looking up the `members` array.

### 3. Improve confirmation screen messaging

- If `bookingResult.meet_link` exists: show "A calendar invite has been sent to your email." + the Meet join link
- If `bookingResult.meet_link` is absent but booking succeeded: show "Meeting confirmed! We'll send you a calendar invite shortly." (graceful degradation)

### 4. Better 409 handling

The current catch block already handles errors, but refine it: detect 409-specific messages ("already been booked" / "slot") and show the specific toast "That time slot was just booked by someone else. Please pick another time." then navigate back to step 2 with the same date preserved.

## Technical details

| Area | Current | Fix |
|---|---|---|
| Edge function error (line 215) | `setServerSlots([])` | `setServerSlots(null)` — triggers client fallback |
| Slot rendering (lines 514-531) | Shows time only | Add member name subtitle from `serverSlots[i].available_members` |
| Confirmation (lines 629-656) | Generic message | Conditional: meet_link present → "invite sent" / absent → "invite shortly" |

| File | Action |
|---|---|
| `src/pages/BookMeeting.tsx` | Edit — fix fallback, add member labels, improve confirmation |

