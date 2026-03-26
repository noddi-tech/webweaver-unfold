

# Phase 4: Google Calendar Integration Edge Functions

## Summary

Create three edge functions for Google Calendar integration: OAuth callback, availability checking with FreeBusy API, and booking creation with Calendar event + Meet link. Also wire the admin UI's "Connect Google Calendar" button to initiate the OAuth flow, and update the booking page to use server-side availability.

## Prerequisites — Missing Secret

A `FERNET_KEY` secret is needed for encrypting/decrypting OAuth tokens. The existing secrets include `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, and `GOOGLE_REDIRECT_URL` but no `FERNET_KEY`. I will prompt you to add this secret before proceeding.

Note: The existing secret is named `GOOGLE_REDIRECT_URL` — the edge function code in your message references `GOOGLE_REDIRECT_URI`. I will use `GOOGLE_REDIRECT_URL` to match what is already configured.

## Files to Create

### 1. `supabase/functions/google-auth-callback/index.ts`

- Receives `?code=...&state=<team_member_id>` from Google OAuth redirect
- Exchanges authorization code for access + refresh tokens
- Encrypts tokens using AES-GCM with `FERNET_KEY`
- Upserts into `google_oauth_tokens` table
- Updates `team_members.google_calendar_connected = true`
- Redirects to `/cms?tab=booking&calendar=connected`
- Config: `verify_jwt = false` (OAuth redirect callback, no JWT possible)

### 2. `supabase/functions/get-availability/index.ts`

- Accepts POST `{ event_type_id, date, timezone }`
- Fetches event type + assigned members + availability rules
- For each Google-connected member: decrypts tokens, refreshes if expired, queries Google Calendar FreeBusy API
- Merges FreeBusy busy periods with existing DB bookings
- Generates time slots within availability windows, filtering out conflicts
- Returns `{ slots: [{ start, end, available_members }] }`
- Config: `verify_jwt = false` (public-facing booking page)
- CORS: `Access-Control-Allow-Origin: *`

### 3. `supabase/functions/create-booking/index.ts`

- Accepts POST with booking details (event_type_id, start_time, guest info)
- Re-validates slot availability (FreeBusy + DB check for race conditions)
- Inserts booking + booking_members in DB
- Creates Google Calendar event on first connected member's calendar with:
  - All team members + guest as attendees
  - Google Meet link (`conferenceDataVersion=1`)
  - Email reminders (60 min) and popup reminders (15 min)
- Returns booking confirmation or 409 if slot was taken
- Updates booking record with `google_calendar_event_id` and `meet_link`
- Config: `verify_jwt = false`

## Files to Edit

### 4. `src/components/design-system/BookingManager.tsx`

- Replace the "Connect Google Calendar" placeholder toast with an actual link that opens:
  ```
  https://accounts.google.com/o/oauth2/v2/auth?
    client_id=<GOOGLE_CLIENT_ID>&
    redirect_uri=<GOOGLE_REDIRECT_URL>&
    response_type=code&
    scope=https://www.googleapis.com/auth/calendar.events https://www.googleapis.com/auth/calendar.freebusy&
    access_type=offline&
    prompt=consent&
    state=<team_member_id>
  ```
- The `GOOGLE_CLIENT_ID` is not a VITE env var, so hardcode it or fetch from a config edge function. Simplest: add `VITE_GOOGLE_CLIENT_ID` to `.env` so the frontend can construct the OAuth URL. Alternatively, create a tiny edge function that returns the OAuth URL.

### 5. `src/pages/BookMeeting.tsx`

- Replace the client-side availability calculation with a call to the `get-availability` edge function
- Replace the direct DB insert in `handleSubmit` with a call to `create-booking` edge function
- Display the Google Meet link in the confirmation step (step 4)

### 6. `supabase/config.toml`

- Add `verify_jwt = false` for all three new functions

## Database Changes

A migration to add `google_calendar_event_id` and `meet_link` columns to the `bookings` table (if not already present).

| File | Action |
|---|---|
| `supabase/functions/google-auth-callback/index.ts` | Create — OAuth callback handler |
| `supabase/functions/get-availability/index.ts` | Create — FreeBusy + DB availability check |
| `supabase/functions/create-booking/index.ts` | Create — booking + Calendar event creation |
| `supabase/config.toml` | Add verify_jwt = false for 3 new functions |
| `src/components/design-system/BookingManager.tsx` | Wire Google Calendar OAuth button |
| `src/pages/BookMeeting.tsx` | Use edge functions instead of client-side logic |
| Migration | Add google_calendar_event_id, meet_link to bookings |

