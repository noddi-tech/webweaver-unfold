

# Fix Booking Page: Calendar Connection Check, Layout, and Responsiveness

## Summary

Three fixes: (1) Don't show availability for members without a connected Google Calendar, (2) make the calendar component fill its container width, (3) ensure the layout works well on iPad and mobile.

## Changes

### 1. Only show availability for calendar-connected members

**`supabase/functions/get-availability/index.ts`**: Add `.eq('google_calendar_connected', true)` to the employees query. If no connected members remain, return empty slots. This ensures no availability is shown unless at least one assigned team member has connected their Google Calendar.

**`src/pages/BookMeeting.tsx`**: In the member fetch (line ~189-194), also add `.eq('google_calendar_connected', true)`. If no connected members are found for the event type, show a friendly message like "Calendar not yet available — please contact us" instead of the calendar/slots UI. The client-side fallback slot generation also depends on `members`, so filtering there prevents fallback slots too.

### 2. Calendar fills its container

**`src/pages/BookMeeting.tsx`** (line 517-523): The shadcn Calendar uses fixed `w-9` cells. Override with additional classNames to make it stretch:
- Add `[&_table]:w-full [&_.rdp-head_cell]:w-auto [&_.rdp-cell]:w-auto` to the Calendar className
- Wrap in a Card or just ensure the calendar's table uses `w-full` and cells flex/distribute evenly
- The simplest fix: add `[&_table]:w-full [&_.rdp-head_cell]:flex-1 [&_.rdp-cell]:flex-1 [&_.rdp-row]:w-full [&_.rdp-head_row]:w-full` so the calendar grid stretches to fill

### 3. Mobile and iPad optimization

**`src/pages/BookMeeting.tsx`**:
- Change the grid from `grid md:grid-cols-[280px_1fr]` to a stacked layout on mobile/tablet: `grid grid-cols-1 lg:grid-cols-[280px_1fr]`
- This means on iPad (typically ~768-1024px), it stacks vertically instead of cramming a narrow 2-column layout
- The info panel (event title, team) shows first, then calendar + slots below
- Time slot grid already uses `grid-cols-2 md:grid-cols-3` which is fine

## File Summary

| File | Action |
|---|---|
| `supabase/functions/get-availability/index.ts` | Filter employees by `google_calendar_connected = true` |
| `src/pages/BookMeeting.tsx` | Filter members by connected calendar, show empty state if none connected, fix calendar width, adjust grid breakpoint to `lg` |

## Technical Details

- The `google_calendar_connected` column was added to `employees` in the unification migration
- Edge function query changes from `.eq('active', true)` to `.eq('active', true).eq('google_calendar_connected', true)`
- Calendar CSS overrides target react-day-picker internal elements via Tailwind arbitrary selectors
- Breakpoint change from `md` (768px) to `lg` (1024px) ensures iPad portrait gets the stacked layout

