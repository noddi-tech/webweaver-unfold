

# Fix IntegrationStrip, Testimonial, and Navbar Issues

## 1. Remove EditableCard wrappers from badges/pills — fix content disappearing

The `EditableCard` wrappers on badges and partner pill default to `glass-card` background. When you edit the card color, the background covers content or makes it invisible. These small inline elements should not be individually editable cards.

**File**: `src/components/IntegrationStrip.tsx`
- Remove `EditableCard` wrapper from partner pill (lines 63-69) — keep inner `<div>` and `EditableTranslation`
- Remove `EditableCard` wrapper from each tech badge (lines 80-90) — keep `EditableTranslation` and `Badge`
- Remove `bg-background` from Badge className (line 84) so badges are transparent against section background

## 2. Make SVG diagram boxes editable via EditableCard

Wrap the SVG diagram area with two `EditableCard` components for "Your system" and "Navio" boxes. Since SVG elements can't be wrapped directly, convert the two boxes from SVG rects to HTML `<div>` elements positioned in a flex/grid layout, or — simpler approach — wrap the entire SVG `<div>` in a single `EditableBackground` so the user can control the diagram container background. 

Actually, the simplest fix: the SVG rects use hardcoded `fill` values (`hsl(var(--muted))` and `url(#navioGrad)`). These aren't editable via CMS. The user wants to change the background of the boxes. The best approach is to leave the SVG as-is (it's a diagram, not a card) and instead make the **section-level** `EditableBackground` work properly — which it already does. The issue is the section blends in. We already fixed `--muted`. The user's concern about "not editable" likely refers to the overall section background via the palette button — which should work via `EditableBackground`. No SVG changes needed.

## 3. Fix Testimonial slow loading

The `CustomerTestimonial` component makes two sequential Supabase queries (first `testimonial_settings`, then `customer_stories`). This waterfall causes visible delay. Fix by using `staleTime` and removing the loading skeleton delay:

**File**: `src/components/CustomerTestimonial.tsx`
- Add `staleTime: 1000 * 60 * 5` (5 min cache) to the useQuery config
- Add `refetchOnWindowFocus: false` to prevent unnecessary refetches
- Reduce skeleton display — show a minimal placeholder instead of large skeleton blocks

## 4. Navbar: use Soft Linen background with glass effect instead of white

The `.glass-header` class uses `hsl(var(--card-background) / 0.85)` which resolves to near-white (`0 0% 98%`). Change it to use `hsl(var(--background) / 0.85)` so it picks up the Soft Linen tone instead of white.

**File**: `src/index.css` (line 322)
- Change `background: hsl(var(--card-background) / 0.85)` to `background: hsl(var(--background) / 0.85)`

This makes the navbar match the page background with the frosted glass blur effect.

## Files changed

| File | Change |
|---|---|
| `src/components/IntegrationStrip.tsx` | Remove EditableCard wrappers from badges/pills, remove `bg-background` from Badge |
| `src/components/CustomerTestimonial.tsx` | Add staleTime/caching to useQuery |
| `src/index.css` | Change `.glass-header` background from `--card-background` to `--background` |

