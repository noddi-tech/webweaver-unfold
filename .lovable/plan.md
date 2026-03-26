
## Summary

The CTA color is reverting because this card section has two competing edit paths, and one of them is still writing the old gradient value back into the database.

The affected section is `src/components/ScrollingFeatureCards.tsx` — the same area as the uploaded screenshot with the “See How” card CTA.

## What I found

- The CTA button color is persisted in `text_content.button_bg_color` using element IDs like:
  - `scrolling-card-1-cta`
  - `scrolling-card-2-cta`
  - etc.
- In the database right now, all of those rows still store:
  - `button_bg_color = 'bg-gradient-warmth'`
- The component also loads card-level styling from:
  - `background_styles` for `scrolling-card-%-background`
- Those card backgrounds are also all currently `bg-gradient-warmth`, which matches what you keep seeing visually.

## Root cause

There are two editing mechanisms on these cards:

1. The inline `EditableButton` on each CTA
2. The larger `UnifiedStyleModal` for the whole card

Both can save CTA styling, but they are not kept in sync well enough.

### Specific issue
In `ScrollingFeatureCards.tsx`:
- `onBgColorChange` updates local state and writes `button_bg_color`
- but the card can still later be reloaded from stale/default card data or from the unified modal path
- the defaults for these cards heavily favor gradient CTA styles
- this makes the button appear to “go back” to the gradient

There is also an inconsistency in token handling:
- some places expect values like `primary`
- some fallback/default values are `bg-gradient-warmth`
- some rendering logic checks `includes('gradient')`
- some modal previews strip `bg-`, while some card render paths don’t normalize as consistently

That mix makes persistence fragile for CTA backgrounds in this section.

## Plan

### 1. Make `text_content` the single source of truth for these CTA buttons
In `src/components/ScrollingFeatureCards.tsx`:
- ensure CTA render always prefers the saved `text_content.button_bg_color`
- remove any fallback path that can overwrite a saved CTA color with the card’s default gradient after refresh

### 2. Normalize CTA background token handling
Standardize CTA background tokens in this section so they are handled the same way everywhere:
- support both existing values like `bg-gradient-warmth`
- and solid tokens like `primary`, `secondary`, etc.
- use one normalization helper before rendering preview/save state

This prevents “purple saved, gradient rendered” mismatches.

### 3. Keep both editing flows synchronized
Update the interaction between:
- inline `EditableButton`
- `UnifiedStyleModal`

So when either saves CTA styling:
- local `cardData[index].ctaBgColor` updates immediately
- subsequent reloads use the same saved value
- no stale modal/default state can push the gradient back

### 4. Harden the render logic for card CTAs
Refactor the CTA button style rendering in `ScrollingFeatureCards.tsx` so it uses one shared rule:
- gradient token → `backgroundImage`
- solid token → `backgroundColor`
- text color → resolved with the existing `resolveTextColor()` pattern

That will make the visual result deterministic.

### 5. Preserve current database content but stop future regressions
I would not change the whole card-background system here. I’d limit the fix to CTA buttons only, so:
- card backgrounds can remain gradient if desired
- CTA buttons can stay solid purple when you choose that
- future edits no longer revert

## Files to update

- `src/components/ScrollingFeatureCards.tsx`
- possibly `src/components/UnifiedStyleModal.tsx` if CTA save/load sync needs a small fix
- optionally `src/components/ButtonEditModal.tsx` only if token normalization should be shared from there too

## Expected result

After this fix:
- when you set the CTA inside these cards to the new purple color, it stays purple
- refreshing or reopening edit mode will not switch it back to the gradient
- card background and CTA background will behave independently
- this will remain consistent across desktop, iPad, and mobile because the issue is persistence/state logic, not just layout

## Technical notes

- Current DB rows show `scrolling-card-%-cta.button_bg_color = bg-gradient-warmth`
- Current card background rows show `scrolling-card-%-background.background_class = bg-gradient-warmth`
- The bug appears localized to `ScrollingFeatureCards`, not the simpler CTA implementation in `WhyNavio.tsx`, which already follows a cleaner save/render pattern
