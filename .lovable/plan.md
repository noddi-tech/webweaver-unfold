

# Full-Width Calendar & Larger Team Member Text

## Problem
1. Calendar cells use fixed `w-9 h-9` sizing in `calendar.tsx`, preventing the calendar from filling the card width despite the `w-full` and `flex-1` overrides in BookMeeting.
2. Team member names use `text-sm` and titles use `text-xs` — too small.

## Changes

### 1. Calendar full-width (`src/components/ui/calendar.tsx`)
Change the fixed-size classes to flex-based sizing so the calendar stretches to fill its container:
- `head_cell`: replace `w-9` with `flex-1`
- `cell`: replace `h-9 w-9` with `flex-1 h-11`
- `day`: replace `h-9 w-9` with `h-11 w-full`

This makes the calendar respect its container width. The existing `w-full` on table/row already supports this.

### 2. Simplify BookMeeting calendar overrides (`src/pages/BookMeeting.tsx`)
Remove the verbose `[&_...]` override classes on the Calendar since the base component will now handle full-width natively. Keep `rounded-lg border bg-card-background p-4 w-full`.

### 3. Larger team member text (`src/pages/BookMeeting.tsx`)
- Avatar: `w-8 h-8` → `w-10 h-10`
- Name: `text-sm` → `text-base`
- Title: `text-xs` → `text-sm`
- "TEAM" label: `text-xs` → `text-sm`

| File | Change |
|------|--------|
| `src/components/ui/calendar.tsx` | Make cells flex-based instead of fixed w-9 |
| `src/pages/BookMeeting.tsx` | Remove redundant calendar overrides, enlarge team member text |

