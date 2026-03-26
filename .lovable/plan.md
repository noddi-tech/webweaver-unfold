

# Event-Type Availability Schedules

## Summary

Add per-event-type availability so you can control *when* each event type is bookable — either as recurring weekly days (e.g., demos on Tue/Thu) or specific date ranges (e.g., Autotechnica Mar 29–31). The final bookable slots are the intersection of member availability, event-type availability, and Google Calendar free/busy.

## Current behavior

- `availability_rules` table holds weekly schedules per team member (Mon–Fri, start/end times)
- `get-availability` edge function checks member rules + Google FreeBusy
- No concept of "this event type is only available on certain days/dates"

## Changes

### 1. New database table: `event_type_availability`

Supports two modes via a `type` column:

```sql
create table public.event_type_availability (
  id uuid primary key default gen_random_uuid(),
  event_type_id uuid references event_types(id) on delete cascade not null,
  type text not null check (type in ('recurring', 'date_range')),
  -- For recurring: day_of_week (0=Mon, 6=Sun), start_time, end_time
  day_of_week integer,
  start_time text,
  end_time text,
  -- For date_range: specific start/end dates
  date_start date,
  date_end date,
  created_at timestamptz default now()
);
```

- `recurring` rows: "Demos available Tue 09:00–17:00 and Thu 09:00–17:00"
- `date_range` rows: "Autotechnica available Mar 29–31" (uses member's normal start/end times, or optional override times)

RLS: public read, admin write.

### 2. CMS UI in BookingManager EventTypesTab

Add an "Availability" section inside the event type edit dialog:

- Toggle: "Limit availability for this event type" (off = always available when members are available, which is current behavior)
- When on, show two sub-sections:
  - **Recurring days**: checkboxes for Mon–Sun with start/end time selectors (like the member availability UI)
  - **Date ranges**: add specific date ranges with a date picker (start date + end date)
- Save writes to `event_type_availability` table

### 3. Edge function: `get-availability`

Update slot generation logic:

- After fetching member availability rules, also fetch `event_type_availability` for the requested event type
- If no rows exist → current behavior (no restriction)
- If rows exist → the requested date must match either:
  - A `recurring` row with matching `day_of_week`, AND the slot time falls within `start_time`–`end_time`
  - A `date_range` row where the date falls between `date_start` and `date_end`
- This acts as an additional filter on top of member availability + Google FreeBusy

### 4. Client-side fallback in BookMeeting.tsx

- Fetch `event_type_availability` alongside other data
- Apply same filtering logic in the client-side fallback slot generation
- Grey out calendar dates that have no event-type availability

## Files to change

| File | Change |
|------|--------|
| New migration | Create `event_type_availability` table with RLS |
| `src/components/design-system/BookingManager.tsx` | Add availability UI to event type edit dialog |
| `supabase/functions/get-availability/index.ts` | Filter slots by event-type availability |
| `src/pages/BookMeeting.tsx` | Fetch event-type availability, filter calendar dates |

## How it works for your examples

- **Autotechnica**: Add a `date_range` row: Mar 29–31. Only those 3 days show slots for that event type.
- **Product Demo**: Add `recurring` rows for e.g. Tuesday and Thursday. Only Tue/Thu show slots.
- **Intro Call**: No event-type availability rows → available any day members are available (current behavior preserved).

