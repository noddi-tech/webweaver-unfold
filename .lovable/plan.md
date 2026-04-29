I agree this is a blocker for Deliverable 2. I will not move to Deliverable 3 until the preview components pass the overflow bar.

Plan to fix and verify:

1. Add reusable deck text/layout safeguards
   - Add utilities in `src/components/portal-deck/components/utils.ts` for:
     - balanced wrapping for headings and labels
     - `overflow-wrap: anywhere` only for truly unbreakable strings, not normal investor values
     - container-query-aware value sizing using `clamp()`/`cqw`
     - `min-w-0` wrappers so grid/flex children can shrink instead of clipping
   - Prefer scaling and layout changes over truncation. Ellipsis only if a component has no viable visual alternative.

2. Fix `StatGrid` directly
   - Make each stat card a container query context.
   - Replace fixed `text-5xl`/`text-4xl` values with container-responsive `clamp()` sizing.
   - Prevent awkward mid-value wrapping for normal values like `NOK 10–20M`, `NOK 22M`, `30 June 2026`, and company names.
   - Change dense grid from 4 columns to a safer 3-column max unless the component is explicitly redesigned for short numeric values.
   - Add `min-w-0` and balanced text treatment to labels, values, context, and trend rows.

3. Audit and harden the other components called out
   - `Hero`: long title/eyebrow/metric values shrink and balance without clipping.
   - `StatCallout`: long values use responsive/clamped type and split layout remains safe.
   - `LogoGrid`: long company names fit by using balanced/scaled text and safer dense column counts.
   - `CustomerSpotlight`: long customer + parent brand + metric values do not overflow.
   - `ComparisonTable`: long row labels and cell text are readable without table clipping; if needed, switch to horizontal scroll only as a controlled fallback for very narrow widths.
   - `FunnelLayout`: long stage labels and values stay contained; bars do not force text out of bounds.
   - `Timeline`: dense layout avoids four narrow columns if descriptions/metrics are long.
   - `ProcessFlow`: dense layout avoids five narrow columns and arrow positioning does not collide.
   - `ProblemSolutionGrid`: titles/metrics balance and dense layout remains readable.
   - `AnnotatedChart`: static annotation labels stay within the chart card and avoid overlaps/clipping where practical.
   - Also apply the same safeguards to `CategoryCard`, `PersonCard`, `QuoteBlock`, `SectionDivider`, and `CitationFooter` where similar text overflow risks exist.

4. Strengthen preview samples for real stress testing
   - Update `/cms/portal/components-preview` sample data so the preview includes long Navio-grade values, including:
     - `NOK 10–20M`
     - `Hurtigruta Carglass`
     - `8 cities, up from 2`
     - `30 June 2026`
     - long operator/stage labels and long chart annotation text
   - Keep all 16 components rendered in both sparse and dense mode.

5. Verification after implementation
   - Re-render `/cms/portal/components-preview`.
   - Use the browser tools to inspect the page and capture visual evidence at the current viewport.
   - Test at least desktop and narrower responsive widths.
   - Screenshot each component pair where possible.
   - If auth blocks automated screenshots, I will say that explicitly and provide the exact components/viewport checks for Joachim to manually verify.

Completion criteria:

- No clipped text.
- No mid-word wraps for normal investor stat values.
- No obvious overflow outside cards/sections.
- No unreadable dense layouts caused by too many columns.
- Report back with either:
  - `ALL 16 COMPONENTS PASS — no overflow at any tested viewport width`, or
  - a specific remaining issue list and recommendation for component redesign if the requested content is incompatible with the current visual model.