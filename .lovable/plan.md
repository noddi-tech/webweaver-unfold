

# Fix Contrast Issues on /book Page

## Problem

The CSS variable `--card` is set to Federal Blue (`249 67% 24%` — very dark purple). Components using `bg-card` (Calendar, Select, Input, Textarea, time slot buttons) render with a dark blue background but dark text, making everything unreadable.

## Fix

Replace `bg-card` with `bg-card-background` (which is `0 0% 98%` — near white) on all interactive elements in BookMeeting.tsx. The calendar component also inherits `bg-card` from its default styling, so override it explicitly.

### `src/pages/BookMeeting.tsx`

| Element | Current | Fix |
|---|---|---|
| Calendar | `bg-card` | `bg-card-background border` |
| SelectTrigger (timezone) | `bg-card` | `bg-card-background` |
| Input fields (×3) | `bg-card` | `bg-card-background` |
| Textarea | `bg-card` | `bg-card-background` |
| Time slot buttons (unselected) | `bg-card` | `bg-card-background` |

All 8 occurrences of `bg-card` in the page get changed to `bg-card-background`.

| File | Change |
|---|---|
| `src/pages/BookMeeting.tsx` | Replace `bg-card` → `bg-card-background` on all interactive elements |

