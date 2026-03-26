

# Phase 7: Booking Email Notifications & Guest Management Page

## Summary

Add a branded confirmation email sent after booking creation, and a public booking management page where guests can view and cancel their meeting without authentication, secured by a hash token.

## Changes

### 1. Database Migration

Add `cancel_token` column to `bookings` table — a unique hash generated at booking time for unauthenticated access.

```sql
ALTER TABLE bookings ADD COLUMN cancel_token TEXT UNIQUE;
```

Add RLS policy allowing anonymous SELECT on bookings by cancel_token:
```sql
CREATE POLICY "Public can view booking by cancel_token"
  ON bookings FOR SELECT TO anon
  USING (cancel_token IS NOT NULL AND cancel_token = current_setting('request.headers', true)::json->>'x-cancel-token');
```

Actually simpler: the management page will call an edge function (not query directly), so no new RLS needed.

### 2. Edge Function: `cancel-booking`

New file: `supabase/functions/cancel-booking/index.ts`

- Accepts `{ booking_id, cancel_token }`
- Validates the token matches the booking's `cancel_token`
- Updates booking status to `cancelled`
- If `google_calendar_event_id` exists, deletes the Google Calendar event via the Calendar API (using the first connected team member's token, same pattern as create-booking)
- Returns `{ success: true }`

Add to `supabase/config.toml`: `[functions.cancel-booking]` with `verify_jwt = false`

### 3. Update `create-booking` Edge Function

After successful booking insert:
- Generate a `cancel_token` (SHA-256 hash of `booking.id + secret`): `crypto.randomUUID()` is sufficient
- Update the booking row with the cancel_token
- Send a branded confirmation email via Resend (using existing `RESEND_API_KEY` secret) containing:
  - Meeting details (title, date/time, attendees)
  - Google Meet link (if available)
  - Manage/cancel link: `https://naviosolutions.com/book/manage/{booking_id}?token={cancel_token}`

### 4. New Page: `src/pages/ManageBooking.tsx`

Public page at `/book/manage/:bookingId` (no auth required):
- Reads `bookingId` from URL params and `token` from query string
- Calls an edge function to fetch booking details by ID + token validation
- Shows: event type title, date/time, team members, guest info
- "Cancel Meeting" button with confirmation dialog
- On cancel: calls `cancel-booking` edge function, shows "Meeting cancelled. The team has been notified."
- Error states: invalid token, already cancelled, booking not found

### 5. Edge Function: `get-booking`

New file: `supabase/functions/get-booking/index.ts`

- Accepts `{ booking_id, cancel_token }`
- Validates token matches
- Returns booking details with event type and team member names (joined)
- Returns 404 if not found or token mismatch

Add to `supabase/config.toml`: `[functions.get-booking]` with `verify_jwt = false`

### 6. Route Registration in `App.tsx`

Add route: `<Route path="/book/manage/:bookingId" element={<ManageBooking />} />`
(No language prefix — this is a token-based link shared via email)

## File Summary

| File | Action |
|---|---|
| Migration | Add `cancel_token` column to `bookings` |
| `supabase/functions/create-booking/index.ts` | Edit — generate cancel_token, send confirmation email via Resend |
| `supabase/functions/get-booking/index.ts` | Create — fetch booking by ID + token |
| `supabase/functions/cancel-booking/index.ts` | Create — cancel booking + delete Calendar event |
| `supabase/config.toml` | Add cancel-booking and get-booking functions |
| `src/pages/ManageBooking.tsx` | Create — public booking management page |
| `src/App.tsx` | Add route for /book/manage/:bookingId |

## Technical Details

- Cancel token: `crypto.randomUUID()` stored on booking row at creation time
- Email uses existing Resend integration (RESEND_API_KEY already configured)
- Email template: inline HTML matching existing Navio brand style (Federal Blue gradient header, clean body)
- Calendar event deletion reuses the same `getAccessToken`/`decrypt` pattern from create-booking
- ManageBooking page uses minimal header (same as BookMeeting — logo + back link)
- All edge functions use service role key internally, verify_jwt = false

