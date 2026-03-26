

# Add Event-Type Availability to Team Member Sheet

## Problem
The team member "Availability" sheet only shows general weekly availability (Mon–Fri). There's no way to set a member's availability for a specific event type — e.g., "Joachim is available for the Trade Fair on Mar 29–31, 09:00–17:00."

Event-type availability already exists in the `event_type_availability` table and is editable from the Event Types dialog. But team members should also be able to see and manage their event-specific schedules from their own availability panel.

## Design
Extend the team member Availability sheet to show two sections:

1. **General Weekly Availability** (existing) — the Mon–Fri toggles with time selectors
2. **Event-Type Availability** (new) — a section below that lists all event types the member is assigned to, with their current event-type availability rules, and lets the admin add/edit per-event availability directly

## Changes to `src/components/design-system/BookingManager.tsx`

### In `TeamMembersTab`, inside `openAvailability`:
- Fetch event types the member is assigned to via `event_type_members`
- Fetch corresponding `event_type_availability` rows for those event types
- Store in new state: `memberEventAvail`

### New state variables:
```
memberEventTypes: { eventType: EventType; availability: EventTypeAvailability[] }[]
```

### New UI section in the Availability Sheet (below "Save Availability"):
- **"Event-Specific Availability"** heading
- For each assigned event type, show a collapsible card:
  - Event type title + color badge
  - Recurring days: toggle + time selectors (same pattern as general availability)
  - Date ranges: date + time inputs with add/remove
  - Individual "Save" button per event type
- Save writes to `event_type_availability` table (delete + re-insert for that event type)

### Data flow:
- Load: query `event_type_members` for the member → get event type IDs → fetch `event_types` and `event_type_availability` for those IDs
- Save: for each event type, delete existing `event_type_availability` rows for that `event_type_id`, insert new ones

| File | Change |
|------|--------|
| `src/components/design-system/BookingManager.tsx` | Add event-type availability section to team member sheet |

No backend or edge function changes needed — the `event_type_availability` table already supports this data.

