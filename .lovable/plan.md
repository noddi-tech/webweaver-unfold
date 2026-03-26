

# Flexible Duration & Timezone-Compliant Booking

## Summary

Three changes: (1) confirm availability logic mirrors Google Calendar correctly (it already does — availability_rules define when you're available, Google FreeBusy removes conflicts), (2) add flexible duration ranges so guests can choose meeting length, (3) ensure all timezone math anchors on Navio's timezone (Europe/Oslo).

## Changes

### 1. Database Migration — Add duration range to `event_types`

```sql
ALTER TABLE event_types ADD COLUMN min_duration_minutes integer;
ALTER TABLE event_types ADD COLUMN max_duration_minutes integer;
ALTER TABLE event_types ADD COLUMN duration_step_minutes integer DEFAULT 15;
```

When `min_duration_minutes` and `max_duration_minutes` are both set, the guest picks a duration (in steps of `duration_step_minutes`). When only `duration_minutes` is set (existing behavior), it stays fixed. Example: min=30, max=60, step=15 → guest chooses 30, 45, or 60 min.

### 2. `src/components/design-system/BookingManager.tsx` — Event type editor

Add optional "Min duration" and "Max duration" fields to the event type create/edit form. When both are filled, `duration_minutes` becomes the default/display value. Add "Duration step" field (default 15 min).

### 3. `src/pages/BookMeeting.tsx` — Guest duration picker + timezone fixes

**Duration picker**: After selecting an event type with a duration range, show a duration selector (e.g. segmented control or dropdown: "30 min / 45 min / 60 min") before the calendar. The chosen duration is used for slot generation and booking.

**Timezone anchoring**: The current slot generation in `get-availability` uses the first member's timezone for wall-clock conversion. Ensure:
- Availability rules are always interpreted in the member's own timezone (already correct)
- Slots are returned as UTC ISO strings (already correct)
- The guest sees slots formatted in their selected timezone (already correct)
- The `timezone` parameter sent to get-availability is used for display only, not for slot calculation (already correct — slots are calculated in member timezone)

No major timezone fix needed — the current implementation is correct. The member's availability (e.g. 09:00-17:00 Europe/Oslo) is converted to UTC, Google FreeBusy is queried in UTC, and results are returned as UTC. The guest's timezone only affects display formatting.

### 4. `supabase/functions/get-availability/index.ts` — Duration from request

Accept `duration_override` parameter. When provided (guest chose a custom duration), use it instead of `eventType.duration_minutes` for slot generation. Validate that it falls within `[min_duration_minutes, max_duration_minutes]`.

### 5. `supabase/functions/create-booking/index.ts` — Custom duration

Accept optional `duration_minutes` in the request body. If provided, validate it against the event type's min/max range. Use it to calculate `end_time` instead of the default `duration_minutes`.

## File Summary

| File | Action |
|---|---|
| Migration SQL | Add `min_duration_minutes`, `max_duration_minutes`, `duration_step_minutes` to `event_types` |
| `BookingManager.tsx` | Add duration range fields to event type editor |
| `BookMeeting.tsx` | Add duration picker step, pass chosen duration to edge functions |
| `get-availability/index.ts` | Accept `duration_override`, validate against range |
| `create-booking/index.ts` | Accept `duration_minutes`, validate against range, use for end_time |

## Technical Notes

- Availability rules define WHEN team members are bookable (e.g. Mon-Fri 09:00-17:00 in their timezone). Google Calendar FreeBusy removes conflicts. This is already the correct behavior — availability_rules are the "open hours", Google Calendar provides the "busy blocks".
- All timezone math uses the member's timezone from the `employees.timezone` column (default `Europe/Oslo`). Guest timezone is only used for display formatting.
- Duration range is optional and backward-compatible — existing event types with only `duration_minutes` continue to work as fixed-duration meetings.

