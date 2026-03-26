

# Only Show Active Sections in Event-Specific Availability

## Problem
The event-specific availability cards on team members always show both "Recurring Days" and "Date Ranges" sections, even when nothing is configured. This clutters the UI — if the event only uses date ranges (like a trade fair), the recurring days section is unnecessary noise.

## Solution
Only display sections that have active data from the event type's configuration. Show a compact summary instead of all 7 day toggles when nothing is enabled.

## Changes to `src/components/design-system/BookingManager.tsx`

### Recurring Days section (lines 390-412)
- Only render if at least one recurring day is enabled (`entry.recurring.some(r => r.enabled)`)
- If none enabled, hide the entire "Recurring Days" block

### Date Ranges section (lines 414-439)
- Only render the date range list if `entry.dateRanges.length > 0`
- Always show the "Add Date Range" button so the user can add one
- If no date ranges exist, just show the button without the "Date Ranges" label

### Add toggle to reveal recurring days
- Add a small "Add Recurring Days" button (similar to "Add Date Range") that appears only when no recurring days are active, so the user can opt in to adding them

This keeps the cards clean — showing only what's configured in the event type — while still allowing the user to add either type of availability.

| File | Change |
|------|--------|
| `src/components/design-system/BookingManager.tsx` | Conditionally render recurring/date-range sections based on active data |

