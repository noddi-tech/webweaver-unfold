

# Fix IntegrationStrip: Arrows, Badge Contrast, and CMS Editability

## Problems identified from screenshot

1. **SVG arrows are broken**: The split two-segment arrow lines (175→220 gap 280→325) create a visual mess — the gap between segments is too wide and the marker arrowheads look disconnected. The arrows need to be single continuous lines that route around the center sync circle.

2. **Tech badges have no visible text**: The badges render as solid dark purple pills with invisible text. The `bg-card` class combined with the current theme creates dark backgrounds where text disappears. Need proper contrast.

3. **No CMS editability**: The tech badges and partner pill are not wrapped in `EditableCard` — they can't be styled via the CMS. The section background itself also lacks CMS background editing.

## Changes

### 1. Fix SVG arrows — `src/components/IntegrationStrip.tsx`

Replace the broken 4-segment arrow approach with 2 clean curved paths that arc above and below the sync circle:

- **Top path** (→ right): Single path from left box (x=170) curving slightly above the sync circle to right box (x=330), with `markerEnd` arrowhead
- **Bottom path** (← left): Single path from right box curving below the sync circle back to left box, with `markerEnd` arrowhead
- Keep the animated `strokeDasharray` + `dash-flow` animation
- Position the "Bookings · Customers" and "Services · Reports" labels above/below the paths
- Increase the viewBox slightly if needed for breathing room

### 2. Fix tech badge contrast — `src/components/IntegrationStrip.tsx`

Replace the Badge components with proper styling that ensures readable text:
- Use `variant="outline"` with explicit classes: `bg-background border-border text-foreground shadow-sm`
- Remove `bg-card` which resolves to a dark fill in this theme
- Keep icons with `text-muted-foreground`

### 3. Add CMS editability for badges — `src/components/IntegrationStrip.tsx`

Wrap each tech badge in an `EditableCard` so background and icon can be styled via CMS:
- Each badge gets `elementIdPrefix="integrations-badge-{index}"`
- Use `EditableIcon` for the badge icons so they're individually styleable
- Wrap the partner "Eontyre" pill in `EditableCard` as well (`elementIdPrefix="integrations-partner-eontyre"`)

Add imports: `EditableCard`, `EditableIcon`

### 4. Add CMS background editing for the section

Wrap the section in `EditableBackground` so the section background (currently `bg-muted/50`) can be changed via CMS. Import `EditableBackground` and wrap the outer `<section>`.

## Files changed

| File | Change |
|---|---|
| `src/components/IntegrationStrip.tsx` | Fix SVG arrows to use curved single-line paths, fix badge contrast, add EditableCard/EditableIcon wrapping for CMS editability |

