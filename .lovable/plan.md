

# Fix: ScrollingFeatureCards Spacing at Low Zoom / Large Viewports

## Problem
The `min-height: ${100 + (cards.length * 20)}vh` (200vh for 5 cards) creates excessive empty space when the browser is zoomed out, because `vh` units scale with the viewport — a zoomed-out browser has a much taller effective viewport, making 200vh enormous.

## Fix

**File: `src/components/ScrollingFeatureCards.tsx` (line 657)**

Replace the pure `vh`-based min-height with a clamped value that caps the maximum height, preventing runaway spacing at low zoom levels:

```ts
// Before
style={isXlScreen ? { minHeight: `${100 + (cards.length * 20)}vh` } : undefined}

// After
style={isXlScreen ? { minHeight: `min(${100 + (cards.length * 20)}vh, ${1200 + (cards.length * 300)}px)` } : undefined}
```

This uses CSS `min()` to take the smaller of the vh-based value and a fixed pixel cap (~2700px for 5 cards). At normal zoom, the vh value wins and the scroll animation works identically. At low zoom (where vh becomes very large), the px cap prevents excessive whitespace.

| File | Change |
|---|---|
| `src/components/ScrollingFeatureCards.tsx` | Line 657: wrap min-height in CSS `min()` with a px cap |

