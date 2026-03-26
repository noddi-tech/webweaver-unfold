

# Add Booking Management to Admin Panel

## Summary

Add a new "Booking" top-level tab to the existing Admin page (`/cms`) with three sub-tabs: Team Members, Event Types, and Bookings. Create a single new component file for the booking admin UI.

## Approach

Follow the existing Admin.tsx pattern: add a 7th top-level tab "Booking" alongside CMS, Translations, Design, Career, Sales, Communications. The booking management UI lives in a new `BookingManager` component with internal sub-tabs.

## Files

### 1. `src/components/design-system/BookingManager.tsx` (Create)

Single component with 3 internal tabs managed via Shadcn Tabs:

**Tab 1: Team Members**
- Fetch `team_members` table, display in a Table (name, email, title, Google Calendar status badge, active Switch toggle)
- "Add Team Member" Button opens a Dialog with form: name, email, title, slug (auto-generated from name via `toLowerCase().replace(/\s+/g, '-')`)
- Edit button per row opens same Dialog pre-filled
- "Connect Google Calendar" button shows toast placeholder
- "Edit Availability" button opens a Sheet/drawer

**Availability Editor (Sheet):**
- Monday–Friday rows, each with a Switch toggle
- If enabled: two Select dropdowns (start/end time) with 15-min increments from 07:00–20:00
- On save: upsert `availability_rules` for that team member (delete removed days, insert/update enabled days)
- Pre-populate from existing `availability_rules` data

**Tab 2: Event Types**
- Fetch `event_types`, display in Table (title, duration badge, assigned members as avatar group, active Switch)
- "Add Event Type" Dialog: title, slug (auto-gen), description textarea, duration Select (15/30/45/60), buffer Select (0/5/10/15), requires_all_members Switch, color input
- Assigned members section: checkboxes for each team member + "required" checkbox per member
- On save: insert/update `event_types` + upsert `event_type_members`
- Soft delete via is_active toggle

**Tab 3: Bookings**
- Fetch `bookings` joined with `event_types` and `booking_members` → `team_members`
- Table: guest name, guest email, event type title, date/time (formatted), team member names, status badge
- Sort by `start_time` descending
- Filters: status Select (all/confirmed/cancelled/completed), event type Select, date range (two date inputs)
- Cancel button opens AlertDialog confirmation → updates `bookings.status = 'cancelled'` and sets `cancelled_at`
- Note in UI: "Past confirmed bookings should be marked as completed"

### 2. `src/pages/Admin.tsx` (Edit)

- Import `BookingManager`
- Add `grid-cols-7` to the top-level TabsList (line 173)
- Add `<TabsTrigger value="booking">Booking</TabsTrigger>`
- Add `<TabsContent value="booking"><BookingManager /></TabsContent>`
- Add booking tab routing support in `getDefaultTabs` (handle `?section=team-members` etc.)

| File | Action |
|---|---|
| `src/components/design-system/BookingManager.tsx` | Create — full booking admin with 3 tabs |
| `src/pages/Admin.tsx` | Edit — add 7th top-level "Booking" tab |

