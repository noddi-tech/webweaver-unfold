

# Create /book Meeting Booking Page

## Summary

Build a new public-facing multi-step booking page at `/book` where external visitors can select an event type, pick a date/time, fill in their details, and confirm a meeting.

## Files to Create

### 1. `src/pages/BookMeeting.tsx` — Main page component

Single-file page with 4 steps managed via state:

**Step 1 — Event Type Selection**
- Fetch `event_types` where `is_active = true`
- Render as cards with colored left border, title, description, duration badge
- Click advances to step 2, stores selected event type

**Step 2 — Date & Time Selection**
- Fetch assigned team members via `event_type_members` joined with `team_members`
- Left panel: event info, member avatars/names, back button
- Right panel: Shadcn Calendar (tomorrow to +4 weeks), timezone dropdown (auto-detected via `Intl.DateTimeFormat`), time slots
- Availability logic:
  - Get `availability_rules` for assigned members for selected day_of_week
  - Generate slots based on `duration_minutes + buffer_minutes`
  - Fetch existing confirmed `bookings` for that date range
  - Filter out overlapping slots
  - If `requires_all_members`: all members must be free. Otherwise: at least one.
- Time slots shown in visitor's selected timezone

**Step 3 — Booking Form**
- Name (required), Email (required), Company (optional), Message textarea (optional)
- Confirm button with primary styling
- On submit: insert into `bookings` (UTC times) + `booking_members`

**Step 4 — Confirmation**
- Checkmark animation, booking summary in guest timezone
- "Book another meeting" reset link

**UI details:**
- Step indicator dots at top (1-2-3-4)
- Smooth transitions between steps (CSS transitions)
- Max-w-3xl centered, bg-background
- Navio logo at top
- `pointer-events-auto` on Calendar

### 2. `src/App.tsx` — Add route

Add `/book` route (no language prefix, no auth required):
```
<Route path="/book" element={<BookMeeting />} />
```

## No database changes needed

Schema and RLS policies already exist from the previous migration.

| File | Action |
|---|---|
| `src/pages/BookMeeting.tsx` | Create — full booking page with 4 steps |
| `src/App.tsx` | Add `/book` route |

