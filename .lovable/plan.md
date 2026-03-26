

# Wire Google Calendar OAuth Flow in Admin UI

## Summary

Enhance the BookingManager's Team Members tab with full Google Calendar connection management: disconnect support for connected members, OAuth redirect detection with success toast, and a warning banner for unconnected members.

## Changes

### `src/components/design-system/BookingManager.tsx`

**1. Warning banner** — Add an alert at the top of `TeamMembersTab` that shows when any active member has `google_calendar_connected === false`. Uses the existing `Alert` component with a yellow/warning style.

**2. OAuth redirect detection** — In `TeamMembersTab`, read `window.location.search` for `?calendar=connected` on mount. If found, show a success toast and clean the URL param via `window.history.replaceState`.

**3. Disconnect button** — For connected members, replace the static green badge with a dropdown or inline button group: green "Connected" badge + a small "Disconnect" button. On click, open a confirmation dialog, then:
  - Delete the row from `google_oauth_tokens` where `team_member_id = member.id`
  - Update `team_members` set `google_calendar_connected = false`
  - Refresh the members list
  - Show toast "Google Calendar disconnected"

**4. Update OAuth scopes** — Change scope from `calendar.events calendar.freebusy` to `calendar calendar.events` per the prompt.

### File changes

| File | Action |
|---|---|
| `src/components/design-system/BookingManager.tsx` | Edit — add warning banner, disconnect flow, OAuth redirect toast, update scopes |

### Technical details

- Import `Alert, AlertTitle, AlertDescription` from `@/components/ui/alert` and `AlertTriangle` from `lucide-react`
- Add `useEffect` to detect `?calendar=connected` query param on mount, show toast, then `replaceState` to remove it
- Add `disconnecting` state + `AlertDialog` for disconnect confirmation
- The `google_oauth_tokens` delete requires service role access — since anon can't delete from that table, use `supabase.from('team_members').update({ google_calendar_connected: false })` and the token cleanup will happen server-side (or add an RLS policy allowing admin delete). Simplest: just update the flag on `team_members` and let the edge function handle stale tokens gracefully.

