

# Add Time Fields to Date Ranges + Fix Availability Save

## Summary

Date ranges currently only capture dates but not times. For events like trade fairs, you need to specify opening hours (e.g., 09:00–17:00). The recurring days already have time selectors — date ranges need them too.

## Changes

### `src/components/design-system/BookingManager.tsx`

**1. Extend dateRanges state type** to include `start_time` and `end_time`:
- Change from `{ date_start: string; date_end: string }[]` to `{ date_start: string; date_end: string; start_time: string; end_time: string }[]`
- Default new entries to `start_time: "09:00", end_time: "17:00"`

**2. Add time selectors to date range UI rows** (lines 640-653):
- After each date range's date inputs, add two time Select dropdowns (using the existing `TIME_OPTIONS`) for start and end time
- Layout: `[date_start] to [date_end] | [start_time] – [end_time] [X]`

**3. Update save logic** (line 434):
- Include `start_time` and `end_time` when inserting `date_range` rows:
  ```
  { event_type_id, type: 'date_range', date_start, date_end, start_time: dr.start_time, end_time: dr.end_time }
  ```

**4. Update load logic** (line 378):
- Map `start_time` and `end_time` from existing rows:
  ```
  { date_start, date_end, start_time: r.start_time || '09:00', end_time: r.end_time || '17:00' }
  ```

### `supabase/functions/get-availability/index.ts`

The edge function already supports `start_time`/`end_time` on date-range rows and constrains the time window. No changes needed — it already reads `matchingEtRecurring?.start_time` and has the date-range matching logic. However, we need to also apply the date-range's time constraints (currently only recurring times constrain the window). Add logic so that when a `date_range` row matches, its `start_time`/`end_time` also constrain `windowStart`/`windowEnd`.

### `src/pages/BookMeeting.tsx`

Update the client-side fallback slot generation to also apply date-range time constraints (mirror the edge function fix).

## Files to change

| File | Change |
|------|--------|
| `src/components/design-system/BookingManager.tsx` | Add `start_time`/`end_time` to date range state, UI, load, and save |
| `supabase/functions/get-availability/index.ts` | Apply date-range time constraints to slot window |
| `src/pages/BookMeeting.tsx` | Same date-range time constraint in client-side fallback |

