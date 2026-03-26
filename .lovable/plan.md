

# Fix: Logo Marquee Empty Gap on Wide Desktops

## Root Cause

In `LogoMarquee.tsx` lines 77-83, the strip is capped at 6 logos:

```ts
const stripLogos = baseLogos.length >= 6
  ? baseLogos  // uses original array (e.g. 9 logos)
  : /* pad to 6 */
```

When there are 6+ logos, it uses them as-is. But if there are, say, 9 logos at ~100px each + 56px gaps = ~1400px per strip, that's narrower than a 1952px viewport. The `translateX(-50%)` animation moves the combined container left by half its width, but since each strip is narrower than the viewport, a gap appears before the second strip scrolls in.

## Fix

**File: `src/components/LogoMarquee.tsx`**

Replace the strip duplication logic to ensure each strip is wide enough to cover the viewport. Instead of capping at 6, duplicate the base logos enough times so each strip is at least ~2000px wide (accounting for logo width + gap). A safe heuristic: repeat logos until we have at least 12 items per strip.

```ts
// Ensure enough logos per strip to fill wide viewports
const minLogosPerStrip = Math.max(12, baseLogos.length);
const stripLogos = baseLogos.length > 0
  ? Array.from({ length: Math.ceil(minLogosPerStrip / baseLogos.length) }, () => baseLogos)
      .flat()
      .slice(0, minLogosPerStrip)
  : baseLogos;
```

This guarantees at least 12 logo slots per strip (~1800px+), covering even ultrawide displays. With two strips rendered, the seamless `-50%` loop works without gaps.

| File | Change |
|---|---|
| `src/components/LogoMarquee.tsx` | Lines 77-83: replace strip sizing logic to ensure minimum 12 logos per strip |

