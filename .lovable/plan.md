

# Unify Booking Team Members with Employees Table

## Summary

Instead of maintaining a separate `team_members` table for the booking system, use the existing `employees` table as the single source of truth. This eliminates duplicate data (Joachim and Tom Arne exist in both tables) and lets you manage team members in one place.

## Approach

Add booking-specific columns to `employees`, migrate FK references, then update all code that queries `team_members` to query `employees` instead.

## Changes

### 1. Database Migration

Add booking columns to `employees`:
```sql
ALTER TABLE employees ADD COLUMN slug TEXT;
ALTER TABLE employees ADD COLUMN timezone TEXT DEFAULT 'Europe/Oslo';
ALTER TABLE employees ADD COLUMN google_calendar_connected BOOLEAN DEFAULT false;
```

Generate slugs for existing employees. Update all FK references:
- `availability_rules.team_member_id` → reference `employees(id)`
- `event_type_members.team_member_id` → reference `employees(id)`
- `booking_members.team_member_id` → reference `employees(id)`
- `google_oauth_tokens.team_member_id` → reference `employees(id)`

Migrate existing data: match Joachim and Tom Arne by email between the two tables, re-point their `availability_rules`, `event_type_members`, `booking_members`, and `google_oauth_tokens` rows to the corresponding `employees.id`. Then drop the `team_members` table.

### 2. `src/components/design-system/BookingManager.tsx`

**TeamMembersTab**: Remove "Add Team Member" button and create/edit dialog. Instead, fetch from `employees` table. The tab becomes read-only for member management (members are managed in the Employees tab). Keep: Google Calendar connect/disconnect, availability editor, active toggle (using `employees.active`).

**EventTypesTab**: Change `team_members` query to `employees` (for member assignment).

**BookingsTab**: Change `team_members` query to `employees` (for displaying member names).

### 3. Edge Functions (4 files)

Update all edge functions that query `team_members` to query `employees` instead:
- `get-availability/index.ts` — `from('employees')`
- `create-booking/index.ts` — `from('employees')`
- `get-booking/index.ts` — join on `employees` instead of `team_members`
- `google-auth-callback/index.ts` — update `employees` instead of `team_members`

### 4. `src/pages/BookMeeting.tsx`

Update the `team_members` query to `employees`.

### 5. `src/integrations/supabase/types.ts`

Will auto-update after migration runs.

## File Summary

| File | Action |
|---|---|
| Migration SQL | Add columns to `employees`, migrate FKs, drop `team_members` |
| `src/components/design-system/BookingManager.tsx` | Replace all `team_members` references with `employees` |
| `src/pages/BookMeeting.tsx` | Replace `team_members` with `employees` |
| `supabase/functions/get-availability/index.ts` | `team_members` → `employees` |
| `supabase/functions/create-booking/index.ts` | `team_members` → `employees` |
| `supabase/functions/get-booking/index.ts` | `team_members` → `employees` |
| `supabase/functions/google-auth-callback/index.ts` | `team_members` → `employees` |

## Technical Notes

- The `employees` table uses `active` (not `is_active`) — all code referencing `is_active` must change
- `employees.email` is nullable — the booking system requires email, so we filter on `email IS NOT NULL` where needed
- The "Add Team Member" flow is removed from the Booking tab — members are added via the existing Employees manager in the CMS tab
- Existing availability rules and bookings are preserved by re-pointing FKs to matching employee IDs before dropping `team_members`

