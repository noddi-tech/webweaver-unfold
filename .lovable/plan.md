

# Fix IntegrationStrip Arrows & Update Soft Linen Color

## 1. SVG arrows — remove arrowhead markers, fix text spacing

Remove the `markerEnd` arrowhead markers from both curved paths. The dashed lines alone communicate the flow well (as seen in the screenshot). Adjust the text `y` positions to add more spacing between the dotted paths and their labels:
- Top label ("Bookings · Customers"): move from `y="88"` to `y="75"` — more clearance above the curve
- Bottom label ("Services · Reports"): move from `y="215"` to `y="225"` — more clearance below the curve

Remove the `<marker>` definitions from `<defs>` since they're no longer used.

**File**: `src/components/IntegrationStrip.tsx`

## 2. Update Soft Linen to #EAE7E1

Convert #EAE7E1 to HSL: approximately `36 12% 90%`.

Update `--background` in `src/index.css` line 58 from `49 41% 92%` to `36 12% 90%`.

Also update the database migration to use the corrected value.

**File**: `src/index.css`

## 3. Update database color token

New migration to update the existing `--color-soft-linen` token value from `49 41% 92%` to `36 12% 90%` and description to reference `#EAE7E1`.

**File**: New migration SQL

## Files changed

| File | Change |
|---|---|
| `src/components/IntegrationStrip.tsx` | Remove arrow markers, adjust text spacing |
| `src/index.css` | Update `--background` to `36 12% 90%` (#EAE7E1) |
| New migration | Update soft linen color token value |

