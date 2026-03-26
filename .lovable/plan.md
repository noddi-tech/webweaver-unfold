

# Calendar Booking System — Database Schema Migration

## Overview

Create 7 new tables for a meeting booking system with Google Calendar integration, plus seed data for the two co-founders and initial event types.

## Migration

A single SQL migration file will:

1. **Create tables**: `team_members`, `event_types`, `event_type_members`, `availability_rules`, `bookings`, `booking_members`, `google_oauth_tokens` — all with the exact columns, types, defaults, foreign keys, and unique constraints specified.

2. **Enable RLS** on all 7 tables.

3. **RLS policies**:
   - `team_members`, `event_types`, `event_type_members`, `availability_rules` — public SELECT (anon); full access for admins via `is_admin()`
   - `bookings` — public INSERT (anon can book); SELECT/UPDATE/DELETE for admins only
   - `booking_members` — public INSERT (anon, during booking creation); SELECT for admins
   - `google_oauth_tokens` — zero public/anon access; only admins + service_role

4. **Seed data** (inside the same migration):
   - Joachim (joachim@noddi.tech, slug "joachim", title "Co-founder")
   - Tom Arne (tomarne@noddi.tech, slug "tom-arne", title "Co-founder")
   - Event type: "Product Demo" (30 min, 15 min buffer)
   - Event type: "Intro Call" (15 min, 10 min buffer)
   - Link both members to "Product Demo"
   - Availability Mon–Fri 09:00–16:00 for both members

## Files

| File | Change |
|---|---|
| `supabase/migrations/<timestamp>.sql` | New migration: all 7 tables, RLS, seed data |

No application code changes in this step — this is schema-only.

