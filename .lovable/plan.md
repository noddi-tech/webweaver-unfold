

# Add Reschedule Functionality to Manage Booking Page

## Summary

Add a "Reschedule Meeting" button alongside the existing "Cancel Meeting" button. When clicked, the guest is taken to a reschedule flow that reuses the existing booking page infrastructure (calendar, time slots, availability) but pre-fills their details and updates the existing booking instead of creating a new one.

## Approach

Rather than building a full inline reschedule UI on the manage page (complex, duplicates MeetMembers logic), the simplest robust approach is:

1. **Add a "Reschedule" button** on the ManageBooking page that links to a dedicated reschedule route
2. **Create a reschedule page** (`/book/reschedule/:bookingId?token=...`) that reuses the MeetMembers scheduling components but operates in "reschedule mode"
3. **Create a `reschedule-booking` edge function** that cancels the old booking (+ calendar event) and creates a new one with the same guest details, generating a new manage link

## Changes

### Frontend

| File | Change |
|------|--------|
| `src/pages/ManageBooking.tsx` | Add "Reschedule Meeting" outline button above the cancel button, linking to `/book/reschedule/:bookingId?token=...` |
| `src/pages/RescheduleBooking.tsx` | New page — loads booking details via `get-booking`, shows calendar + time slot picker (reusing availability logic from MeetMembers), then calls `reschedule-booking` edge function. Guest details are pre-filled and read-only. Shows confirmation on success. |
| `src/App.tsx` | Add `/book/reschedule/:bookingId` route |

### Backend

| File | Change |
|------|--------|
| `supabase/functions/reschedule-booking/index.ts` | New edge function: validates cancel_token, cancels old Google Calendar event, creates new booking + calendar event with same guest details at the new time, sends updated confirmation email with new manage link |

### Flow

1. Guest clicks "Reschedule Meeting" on manage page
2. Lands on reschedule page showing the team member(s) and duration from original booking
3. Picks a new date and time slot (availability fetched same as MeetMembers)
4. Clicks confirm — edge function handles cancel-old + create-new atomically
5. Guest sees confirmation with new date/time and receives updated email

### Edge Function Logic (`reschedule-booking`)

Accepts: `booking_id`, `cancel_token`, `new_start_time`, `duration_minutes`

1. Validate token against booking
2. Delete old Google Calendar event (reuse cancel-booking's calendar logic)
3. Update booking row: new `start_time`, `end_time`, new `cancel_token`, clear `cancelled_at`
4. Create new Google Calendar event
5. Send confirmation email with new details + new manage link
6. Return success with new booking details

This reuses the existing `cancel-booking` calendar deletion logic and `create-booking` calendar creation + email logic, keeping it DRY.

