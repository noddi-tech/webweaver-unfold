

# Fix: CTA Button Editing & WhyNavio Card Background

## Two Issues

### Issue 1: ScrollingFeatureCards — Card CTA buttons not editable
The individual card CTA buttons (e.g., "Learn More", "Explore Features") are plain `<Button>` elements without an `EditableButton` wrapper. They render colors from database (`cardData[index].ctaBgColor`) but provide no edit UI to change them. The main section CTA ("Book a Demo") has `EditableButton` but the per-card CTAs do not.

**Fix**: Wrap each per-card CTA `<Button>` in `<EditableButton>` in both the mobile/tablet view (line ~837) and the desktop/xl view (line ~964). Wire `onBgColorChange` and `onTextColorChange` to save to the `text_content` table using the per-card element IDs (e.g., `scrolling-features-card-0-cta`).

### Issue 2: WhyNavio — CTA button not editable for bg color
The "See How It Works" button (line 130) is a plain `<Button>` inside `EditableTranslation` — text is editable but background color is not. Similarly, the comparison does not use `EditableButton`.

**Fix**: Wrap the CTA in `EditableButton` with `onBgColorChange`/`onTextColorChange` handlers that persist to `text_content`.

### Issue 3: WhyNavio — "With Navio" card background not changing
The `EditableCard` at line 92 uses `defaultBackground="bg-card"`. When the user selects "brand peach" in the modal, `handleSave` fires, resets local state to null, and calls `refreshBackgroundStyles()`. However, the card has `className` with hardcoded `border-2 border-primary shadow-lg lg:scale-105` and a decorative overlay div (`bg-gradient-to-br from-primary/10`) that covers the background. The overlay with `absolute inset-0` sits on top of the card background, masking any peach color with a primary gradient wash.

**Fix**: Make the decorative gradient overlay respect the saved background — if a custom background is saved, hide or reduce the overlay opacity so the chosen background shows through.

## Files to Change

| File | Changes |
|---|---|
| `src/components/ScrollingFeatureCards.tsx` | Wrap per-card CTA buttons in `EditableButton` (2 locations: mobile ~line 837, desktop ~line 964) with save handlers |
| `src/components/WhyNavio.tsx` | (1) Wrap "See How It Works" button in `EditableButton` with persistence. (2) Conditionally hide decorative gradient overlay on "With Navio" card when custom background is applied |

