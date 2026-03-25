

# Rework "How It Works" into Sanna-Inspired Vertical Alternating Timeline

## What changes
Replace the current horizontal 5-step stepper + repeated illustration with a vertical alternating timeline layout inspired by Sanna.no's numbered process steps.

## File: `src/components/HowItWorks.tsx` — Full rewrite of section body

### Remove
- The `EditableUniversalMedia` illustration block (lines 61-78) — duplicate of hero image
- The subtitle paragraph (lines 54-58) — repeats hero messaging
- The horizontal 5-column grid stepper (lines 100-139)
- The mobile compact inline stepper (lines 80-98)
- The `imageUrl` state, `loadMediaSettings` function, and related imports (`EditableUniversalMedia`, `supabase`, `coreLoopIllustration` asset)

### Keep
- Eyebrow ("HOW IT WORKS") via `EditableTranslation`
- Heading — update default fallback to "How Navio works"
- The 5 steps data array with existing translation keys (`core_loop.step_X.title/description`)
- The tagline pill at the bottom ("It's not automation. It's orchestration.")
- `useScrollAnimation`, `useAppTranslation`, `EditableTranslation`
- `refreshKey` pattern for CMS updates

### New layout: Vertical alternating timeline

**Desktop (lg+):**
```text
       [Text]          |01|         [empty]
       [empty]         |02|         [Text]
       [Text]          |03|         [empty]
       [empty]         |04|         [Text]
       [Text]          |05|         [empty]
```
- 3-column grid: `grid-cols-[1fr_auto_1fr]`
- Center column: vertical line (`w-px bg-border`) with step number circles overlaid
- Step number: large `text-3xl font-bold text-primary` formatted as "01", "02", etc., inside a circle with `bg-primary/10` and `border border-primary/20`
- Odd steps (1,3,5): content in left column, right column empty
- Even steps (2,4): content in right column, left column empty
- Content block: bold title + description paragraph, left-aligned or right-aligned depending on side
- Staggered scroll animation with delays per step

**Mobile:**
- Single column with vertical line on the left side
- Each step: number circle on the left, title + description flowing to the right
- Natural top-to-bottom reading order, no alternating
- Layout: `flex` with fixed-width number column + flex-1 content

### Styling approach (all CMS-compatible)
- Step number circles: `bg-primary/10 border border-primary/20 text-primary` — all reference CSS variable `--primary` from `color_tokens`
- Vertical line: `bg-border` — uses `--border` token
- Title text: no hardcoded color class (inherits from section context)
- Description text: `text-muted-foreground` removed, let CMS context handle it — OR keep as design token reference since `--muted-foreground` is a CSS variable from the design system
- Tagline pill: keep existing `bg-primary/10 border-primary/20` tokens

### Reduced padding
- Section: `py-8 md:py-12 lg:py-16` (tighter than current `py-12 md:py-16 lg:py-section`)
- Heading bottom margin: `mb-8 md:mb-12`

### Technical notes
- No new dependencies or database changes needed
- All translation keys preserved — content stays the same
- `EditableTranslation` wrappers kept on all text elements
- Step number formatting: `String(step.number).padStart(2, '0')` for "01" style
- The gradient connecting lines (hardcoded HSL values) are removed entirely — replaced by simple `bg-border` vertical line using the design token

