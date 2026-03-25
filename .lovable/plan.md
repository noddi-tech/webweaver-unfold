

# Implement Mobile Carousel for ScrollingFeatureCards

## Problem
The mobile carousel code (state, refs, IntersectionObserver) was added but the actual carousel JSX was never rendered. The cards still use a single `grid` layout for all breakpoints.

## Plan

### In `src/components/ScrollingFeatureCards.tsx`

**Split the cards grid (line 778-923) into two render paths:**

1. **Mobile carousel (`md:hidden`)** — new block before the existing grid:
   - Horizontal scroll container: `flex overflow-x-auto snap-x snap-mandatory gap-4 pb-4 -mx-4 px-4` with `ref={mobileScrollRef}` and inline styles to hide scrollbar
   - Each card: `data-slide-index={index}`, `snap-center flex-shrink-0 w-[85vw] rounded-3xl overflow-hidden bg-white shadow-lg`
   - Card layout: image on top (aspect-square with gradient background), then content below (badge + icon, title, description, CTA)
   - Reuse existing `renderMedia`, `EditableTranslation`, `EditableUniversalMedia`, card styling
   - Dot indicators below: `flex md:hidden gap-2 justify-center mt-4` with clickable dots that `scrollIntoView`

2. **Tablet + Desktop (`hidden md:grid`)** — wrap the existing grid with `hidden md:grid` instead of `grid`:
   - Change line 779 from `"relative grid gap-6"` to `"relative hidden md:grid gap-6"`
   - Everything else stays exactly the same

This approach reuses all existing card data, styling, and edit mode functionality.

## Files

| File | Change |
|---|---|
| `src/components/ScrollingFeatureCards.tsx` | Add mobile carousel JSX before existing grid; hide grid on mobile |

