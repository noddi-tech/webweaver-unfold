

# Mobile Carousel for ScrollingFeatureCards

## What
On mobile (below `xl` breakpoint), convert the vertically stacked feature cards into a horizontal swipeable carousel with dot indicators. Desktop stays exactly as-is.

## Current State
- `ScrollingFeatureCards.tsx` (892 lines) has a two-column layout: sticky left text + scrolling cards right
- Below `xl`, the left text becomes a static centered block above the cards — already handled (lines 728-739)
- Below `xl`, cards render in a `grid-cols-1 md:grid-cols-2` vertical/grid layout (line 742)
- Each card is a white rounded box with content left + image right (on xl) or stacked (below xl)

## Changes in `src/components/ScrollingFeatureCards.tsx`

### 1. Add mobile carousel state
- Add `activeSlide` state and a `scrollContainerRef` for the snap container
- Add an `IntersectionObserver` to track which card is centered (updates dot indicator)

### 2. Split the card grid into two render paths

**Mobile (`md:hidden`)**: Horizontal scroll-snap carousel
- Container: `flex overflow-x-auto snap-x snap-mandatory` with `scrollbar-hide` styling
- Each card: `snap-center flex-shrink-0 w-[85vw]` — full-width slides with slight peek of next card
- Card layout: image on top (aspect-square), then number badge + icon + title + description + CTA below
- Dot indicators below: filled circle for active, outlined for others, using `bg-primary` / `border-primary`
- Hide scrollbar via inline style `scrollbarWidth: 'none', msOverflowStyle: 'none'` plus a `[&::-webkit-scrollbar]` utility

**Tablet (`hidden md:grid xl:hidden`)**: Keep existing 2-column grid (unchanged)

**Desktop (`hidden xl:grid`)**: Keep existing single-column scroll-animated layout (unchanged)

### 3. Dot indicators component
- Simple `div` with `flex gap-2 justify-center mt-6`
- 5 dots, each `w-2.5 h-2.5 rounded-full transition-colors`
- Active: `bg-primary`, inactive: `border border-primary/50 bg-transparent`

### 4. Card order in mobile slides
- Image on top (using existing `renderMedia`)
- Below: badge number + icon row, title, description, CTA button

## Files

| File | Change |
|---|---|
| `src/components/ScrollingFeatureCards.tsx` | Add mobile carousel render path with scroll-snap + dot indicators |

