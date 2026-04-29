Findings from read-only inspection:

1. The live preview source is not running the intended icon fix. The checked source file in the repo still contains the old implementation:

```ts
const candidate = icons[name];
return typeof candidate === "function" ? candidate : Icons.Sparkles;
```

That explains why all five cards still fall back to Sparkles when the Lucide exports are not plain functions in this runtime.

2. The thumbnail strip currently renders `slide.slide_number` in both the visible tile and the accessible label. With only three published slides, that creates `1, 2, 7` instead of `1, 2, 3`.

3. The main slide counter is already correct: `activeIndex + 1 of slides.length`. Number key navigation and URL slugs are also already index/slug based and do not need changes.

Plan:

1. Update `src/components/portal-deck/visuals/BadgesVisual.tsx`
   - Replace the current `getIcon()` logic with a runtime-safe Lucide resolver.
   - Prefer `Icons.icons?.[name]` first, then fall back to `Icons[name]`, then `Icons.Sparkles`.
   - Treat both callable components and React/lucide forwardRef component objects as valid icon components.
   - Keep the lookup data-driven; do not hardcode the five seeded names as substitutions.

2. Add one temporary dev-only diagnostic log in `BadgeCard`
   - Log exactly the badge icon name and resolved component metadata before rendering.
   - Use it only to confirm what the runtime resolver returns.

3. Verify in the live preview/dev runtime
   - Re-open `/portal?tab=pitch&slide=badge-taxonomy`.
   - If the gate still blocks my automation session, I will still verify the shipped source and code path; otherwise I will capture the five `[BadgeCard] rendering` logs and visually confirm icons.
   - Expected runtime result: five different resolved components for `Database`, `Users`, `Truck`, `Smartphone`, `TrendingUp`.

4. Remove all temporary diagnostics
   - Final diff must contain only the actual `getIcon()` fix and numbering fix, no `console.log` scaffolding.

5. Update `src/components/portal-deck/ThumbnailStrip.tsx`
   - Change the visible tile from `{slide.slide_number}` to `{index + 1}`.
   - Change the accessible label from `Go to slide ${slide.slide_number}` to `Go to slide ${index + 1}`.
   - Leave analytics payloads alone; `slide_number` remains useful internal/CMS metadata there.

6. Final verification/report
   - Confirm no remaining `console.log('[BadgeCard] ...')` diagnostics.
   - Confirm thumbnail strip is user-facing sequential.
   - Report whether browser visual verification was possible or gate-blocked.