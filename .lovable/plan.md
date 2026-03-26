

# Ad-Hoc Personal Booking Links

## Summary

Create shareable booking links like `/en/meet/joachim` or `/en/meet/joachim,mattis,tom` that let external people find a time when all specified team members are free — without requiring a pre-configured event type. A partner gets a link, picks a duration, sees the combined availability, and books.

## How It Works

1. Visitor opens `/en/meet/joachim,mattis`
2. Page looks up employees by slug, shows their avatars/names
3. Visitor picks a duration (default options: 15, 30, 45, 60 min) and a date
4. System queries each member's **general weekly availability** + **Google Calendar** to find overlapping free windows
5. Visitor picks a slot, fills in details, and confirms — a booking is created with all specified members

This is intentionally **decoupled from event types**. No event type selection step. The edge function gets member IDs + date + duration and returns slots where everyone is free.

## Changes

### 1. New Edge Function: `get-member-availability`

A simpler variant of `get-availability` that takes `member_ids[]` instead of `event_type_id`:

- Fetches `availability_rules` for the given members
- Fetches Google Calendar FreeBusy for all members
- Fetches existing bookings
- Computes overlapping free slots for the requested duration
- Returns `{ slots: [{ start, end }] }`

### 2. New Page: `src/pages/MeetMembers.tsx`

A booking page similar to `BookMeeting.tsx` but streamlined:

- Reads `memberSlugs` param from URL, splits by comma
- Looks up employees by slug (name, image, title, timezone)
- Shows member avatars + "Book a meeting with X & Y" header
- Duration picker (15/30/45/60 min, default 30)
- Calendar + time slots (calls `get-member-availability`)
- Booking form (name, email, company, message)
- Calls existing `create-booking` to finalize (passing member IDs directly)

No event type selection step — the page goes straight to calendar.

### 3. Routes in `src/App.tsx`

- Add `/:lang/meet/:memberSlugs` route → `MeetMembers`
- Add `/meet/:memberSlugs` redirect via `LanguageRedirect`

### 4. CMS: Copy Link Button in `BookingManager.tsx`

In the team members tab, add a "Copy meeting link" button next to each member that copies `https://naviosolutions.com/en/meet/{slug}` to clipboard. For multi-member links, admins can construct them manually (comma-separated slugs).

### 5. Update `create-booking` Edge Function

Currently requires `event_type_id`. Add support for an alternative flow where `member_ids[]` + `duration` are passed directly (no event type). The function will:
- Skip event type validation when `member_ids` is provided
- Create the booking with the given members and duration
- Still create Google Calendar events for all members

## Files

| File | Change |
|------|--------|
| `supabase/functions/get-member-availability/index.ts` | New edge function for member-based availability |
| `src/pages/MeetMembers.tsx` | New booking page for ad-hoc member links |
| `src/App.tsx` | Add `/meet/:memberSlugs` routes |
| `supabase/functions/create-booking/index.ts` | Support `member_ids[]` without `event_type_id` |
| `src/components/design-system/BookingManager.tsx` | Add "Copy meeting link" button per team member |

No database changes needed — the existing `bookings` and `booking_members` tables support this.

