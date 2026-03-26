

# Fix: CTA Button Color Resets After Save

## Root Cause

Two related problems cause the color reset:

1. **Stale context overwrites local state**: The `useEffect` at line 461 depends on `[stylesLoaded, backgroundStyles, textStyles]`. Whenever ANY `EditableCard` on the page saves (calling `refreshBackgroundStyles()`), the `backgroundStyles` reference changes, triggering `loadCardData` for ALL cards. This overwrites the locally-saved CTA color with stale data from `textStyles` (which was loaded once at page mount and never refreshed after CTA saves).

2. **Race condition on save**: `EditableButton` fires three separate async upserts to the same `text_content` row simultaneously (`onSave`, `onBgColorChange`, `onTextColorChange`) without awaiting each other.

## Fix

### File: `src/contexts/SiteStylesContext.tsx`
Add a `refreshTextStyles` function (similar to `refreshBackgroundStyles`) that reloads `text_content` from the database. Export it from the context.

### File: `src/components/ScrollingFeatureCards.tsx`

**Change 1**: In the CTA save handlers (`onBgColorChange` and `onTextColorChange`), call `refreshTextStyles()` after the upsert so the context stays in sync with the database.

**Change 2**: Guard `loadCardData` to avoid overwriting user-edited card data. Track which cards have been locally edited (using a ref like `editedCardsRef`). When the useEffect re-fires, skip `loadCardData` for cards that were just edited.

### File: `src/components/EditableButton.tsx`
No changes needed — the root cause is in the context staleness and unguarded effect, not in EditableButton itself.

## Summary of Changes

| File | Change |
|---|---|
| `src/contexts/SiteStylesContext.tsx` | Add `refreshTextStyles()` function and export it |
| `src/components/ScrollingFeatureCards.tsx` | (1) Call `refreshTextStyles()` after CTA saves. (2) Guard `loadCardData` with an `editedCardsRef` to prevent stale context from overwriting user changes |

