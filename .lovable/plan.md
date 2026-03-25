

# Tighten Spacing and Visual Rhythm Across the Homepage

## Problem
Sections feel like isolated islands separated by ~120px (`py-section = 7.5rem = 120px`) of whitespace. The page should flow as a continuous story with tighter, purposeful gaps.

## Changes

### 1. Reduce `--spacing-section` CSS variable
**File: `src/index.css` (line 135)**

Change from `7.5rem` (120px) to `5rem` (80px). This is the global default used by `py-section` across the entire site.

```css
--spacing-section: 5rem;  /* 80px — tighter default */
```

This single change tightens all sections using `lg:py-section` site-wide.

### 2. Tighten specific homepage sections

**`src/components/ScrollingFeatureCards.tsx` (line 655)**
- Change `py-12 md:py-16 lg:py-section` → `py-10 md:py-12 lg:py-16`
- This section is scroll-driven with its own internal height; it doesn't need large outer padding

**`src/components/WhyNavio.tsx` (line 32)**
- Already `py-8 md:py-12 lg:py-16` — keep as-is (already tight)

**`src/components/HowItWorks.tsx` (line 22)**
- Already `py-8 md:py-12 lg:py-16` — keep as-is

**`src/components/IntegrationStrip.tsx` (line 25)**
- Change `py-16 md:py-24` → `py-10 md:py-16`
- Tighter padding since it's a supporting strip, not a hero section

**`src/components/CustomerTestimonial.tsx` (line 56)**
- Change `py-20 md:py-28 lg:py-36` → `py-16 md:py-20 lg:py-24`
- Still has more breathing room than standard sections (it's a "breathing room" section) but not 144px

**`src/components/FinalCTA.tsx` (line 190)**
- Change `py-12 md:py-16 lg:py-section` → `py-16 md:py-20 lg:py-24`
- Breathing room section: slightly more than default but not 120px

### 3. Fix sticky behavior in ScrollingFeatureCards

**File: `src/components/ScrollingFeatureCards.tsx` (line 665)**

The sticky left column uses `xl:sticky xl:top-32 xl:self-start` but has no height constraint — it stays sticky past the section end if the browser allows.

Add `xl:max-h-[calc(100vh-8rem)]` to ensure it doesn't overstay. The sticky element is already inside the grid which is inside the section, so it should naturally unstick when the section scrolls past. Verify the `self-start` is correct (it is — this anchors the sticky element to the top of its grid cell).

Actually, the sticky behavior is controlled by the parent grid container. Since the section has `minHeight` set dynamically and the grid contains the sticky element, it will unstick when the grid row ends. The current implementation should be correct. Will verify and only add a fix if the grid's implicit row doesn't constrain properly.

### 4. Standardize eyebrow labels

All eyebrows should use identical classes. Current pattern across sections:

```tsx
<span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
```

**Sections to verify/fix:**
- ScrollingFeatureCards: ✅ matches (line 667)
- WhyNavio: ✅ matches (line 36)
- HowItWorks: ✅ matches (line 27)
- IntegrationStrip: Check if it has an eyebrow — it doesn't currently. Add one with key `integrations_strip.eyebrow`, fallback "INTEGRATIONS"
- CustomerTestimonial: ✅ matches (line 59)
- FinalCTA: Check if it has an eyebrow — needs verification

**`src/components/IntegrationStrip.tsx`**: Add eyebrow label above the heading, using the standard pattern with `EditableTranslation` wrapper and key `integrations_strip.eyebrow`.

**`src/components/FinalCTA.tsx`**: Add eyebrow "GET STARTED" if not present, with key `final_cta.eyebrow`.

## Summary of spacing targets achieved

| Section | Before | After |
|---|---|---|
| ScrollingFeatureCards | 48/64/120px | 40/48/64px |
| WhyNavio | 32/48/64px | 32/48/64px (unchanged) |
| HowItWorks | 32/48/64px | 32/48/64px (unchanged) |
| IntegrationStrip | 64/96px | 40/64px |
| CustomerTestimonial | 80/112/144px | 64/80/96px |
| FinalCTA | 48/64/120px | 64/80/96px |
| All other `py-section` | 120px | 80px |

## Files changed
| File | Change |
|---|---|
| `src/index.css` | Reduce `--spacing-section` from 7.5rem to 5rem |
| `src/components/ScrollingFeatureCards.tsx` | Tighten outer padding |
| `src/components/IntegrationStrip.tsx` | Tighten padding, add eyebrow |
| `src/components/CustomerTestimonial.tsx` | Reduce padding |
| `src/components/FinalCTA.tsx` | Adjust padding, add eyebrow if missing |

