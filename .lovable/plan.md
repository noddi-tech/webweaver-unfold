

# Replace HowItWorks Steps with Core Loop Illustration

## What
Replace the 4 step cards in the HowItWorks section with the same Core Loop illustration + 5-step stepper used on the Functions page. Keep the section heading and subtitle, keep the bottom caption block.

## Changes in `src/components/HowItWorks.tsx`

1. **Add imports**: `EditableUniversalMedia`, `supabase`, `coreLoopIllustration` asset (same as FunctionsHero)
2. **Add state + effect** for loading the CMS image URL from `image_carousel_settings` where `location_id = 'functions-core-loop'` (reuses the same CMS entry)
3. **Replace the desktop horizontal card grid and mobile vertical card list** with:
   - The Core Loop illustration via `EditableUniversalMedia` (same markup as FunctionsHero)
   - Mobile: ultra-compact inline stepper (1. Book — 2. Plan — 3. Execute — 4. Analyze — 5. Re-engage)
   - Desktop/Tablet: 5-column numbered step grid with gradient connecting lines, editable titles and descriptions using `core_loop.step_X` translation keys
4. **Remove**: `Card`, `CardContent`, `EditableBackground`, `EditableIcon`, `useAllowedBackgrounds` imports (no longer needed). Remove the old `steps` array and both desktop/mobile card renderings.
5. **Keep**: Section heading, subtitle, bottom caption block, scroll animation, `data-header-color="dark"`, all existing spacing patterns.

## Files

| File | Change |
|---|---|
| `src/components/HowItWorks.tsx` | Replace card-based steps with illustration + stepper from FunctionsHero |

