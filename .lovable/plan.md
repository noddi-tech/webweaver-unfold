

# Fix: ManageBooking Page Contrast

## Problem
The ManageBooking page uses `bg-card` for info cards, which resolves to dark purple (Federal Blue). Text uses `text-foreground`, `text-muted-foreground`, and `text-primary` — all dark colors. Result: invisible text and icons on dark backgrounds, as shown in the screenshot.

## Solution
Replace `bg-card` with a light background and keep existing text colors, matching the site's standard card styling pattern used elsewhere.

### Changes in `src/pages/ManageBooking.tsx`

1. **Meeting details card (line 197)**: Change `bg-card border border-border` → `bg-white/80 border border-border/50`
2. **Your Details card (line 237)**: Same change
3. **Icons inside cards**: Change `text-primary` → `text-primary` (keep, works on light bg) and `text-muted-foreground` icons stay as-is
4. **Header bar (line 136)**: Change `bg-card` → `bg-white border-b border-border`

This ensures all text remains readable with proper contrast on light card surfaces, consistent with the rest of the site.

| File | Change |
|------|--------|
| `src/pages/ManageBooking.tsx` | Replace dark `bg-card` with light backgrounds on header and info cards |

