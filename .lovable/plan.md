# Plan: full visual remediation of the 16-component deck library

The current issue is systemic, not isolated. The library is mixing slide-scale typography with small preview-card containers, and several components are forcing dense multi-column layouts before the content has enough width. The fix should be a full pass across all 16 components, using consistent container-aware layout rules and removing horizontal/vertical overflow as an accepted state.

## Quality bar

Before moving to Deliverable 3, the preview page must show every component in sparse and dense mode with:

- No text overflowing cards, divs, or preview frames.
- No mid-value wrapping like `NOK 10–20M` becoming broken fragments.
- No horizontal scrolling inside component frames except where explicitly redesigned and visually acceptable; for these deck components, the target is no internal horizontal scroll.
- No cards with cramped two-column footers or labels squeezed into unreadable columns.
- Dense mode can reduce hierarchy, columns, and copy density, but must still look intentional and investor-grade.
- If a component cannot support the current sample data at a viewport width, redesign that component rather than hiding/clipping/truncating text.

## Root-cause fix first: shared layout and typography primitives

1. Update shared utilities in `src/components/portal-deck/components/utils.ts`:
   - Replace the current one-size-fits-all value sizing with separate helpers:
     - `metricValueTextStyle`: for large numeric/stat values, nowrap, container-sized, conservative maximum.
     - `headlineClampStyle`: for titles, balanced wrapping, no aggressive word breaking.
     - `bodyTextStyle`: readable prose, normal wrapping, no mid-word breaks unless absolutely necessary.
     - `labelTextStyle`: eyebrow/status labels, supports wrapping without letter-by-letter collapse.
   - Keep all dynamic sizing container-aware, but only use `cqw` where the element itself or its card is the container.
   - Add a helper for `containerQueryStyle` usage so every card using `cqw` is actually a container.

2. Add deck-specific responsive CSS in `src/index.css`:
   - Component classes for repeatable container-query layouts instead of scattered `md/xl` assumptions.
   - Use 1-column layouts in narrow preview cards, 2-column only when the component container is wide enough, 3/4-column only for short-content components.
   - Add explicit safe patterns for metric rows, card footers, and table-like comparisons.

## Component-by-component remediation

### 1. Hero

- Keep the improved composition, but finish the metric layout:
  - Sparse mode: large narrative area plus metrics below or side only when the container is wide enough.
  - Dense mode: metric cards should form a clean 2x2 or stacked layout, never narrow columns with oversized text.
- Treat metric values like `Hurtigruta Carglass` as text metrics, not numeric stats; allow balanced wrapping at title scale instead of forcing nowrap stat treatment.

### 2. StatCallout

- Redesign sparse and dense variants:
  - Sparse: full-width hero-stat card with large value, context below, supporting text in a readable block.
  - Dense: two-row or stacked layout unless container is wide enough for true two-column.
- `NOK 10–20M` must remain readable as one visual unit. If necessary, use a lower max font size rather than wrapping mid-value.

### 3. StatGrid

- Change from fixed `xl:grid-cols-3` to container-query cards:
  - Sparse: default 2 columns only when each card has enough width; otherwise 1 column.
  - Dense: 2 columns max in CMS preview; 3 columns only at true slide width.
- Differentiate numeric values and long text values:
  - Numeric: nowrap, scale down.
  - Text names/dates: balanced wrap, smaller headline style.
- Ensure `30 June 2026`, `Hurtigruta Carglass`, and `NOK 10–20M` do not overflow.

### 4. LogoGrid

- Keep simple but tighten long logo-name rendering:
  - Container-aware card title sizing.
  - Status labels can wrap normally, not uppercase letter-compressed.
- Use fewer columns when sample names are long.

### 5. QuoteBlock

- Audit for overlarge quote text in sparse mode.
- Add max line length and reduce font size for long testimonials.
- Ensure author/role/company line wraps as a grouped caption instead of overflowing.

### 6. ComparisonTable

- Redesign completely: no internal horizontal scrollbar.
- Replace rigid grid table with responsive comparison cards:
  - Sparse: one row per dimension, columns rendered as stacked option blocks, with Navio highlighted.
  - Dense: compact matrix only when wide enough; otherwise same stacked comparison pattern.
- Keep the semantic table-like relationship visually, but do not force a 760px minimum grid inside a 500px preview card.

### 7. Timeline

- Redesign timeline cards:
  - Sparse: vertical timeline or 2-column max with clear date rail.
  - Dense: compact vertical list or 2-column cards, not 4 cramped columns in preview.
- Metrics use small caption/value chips instead of large stat typography.
- Long metrics like `Hurtigruta Carglass spotlight` and `NOK 10–20M` must wrap cleanly.

### 8. ProcessFlow

- Remove forced 4-column layout in narrow frames.
- Use container-query flow:
  - Narrow: vertical steps with subtle connector line.
  - Wide: horizontal flow with arrows.
- Metrics should be compact chips/captions, not balanced large text.

### 9. ProblemSolutionGrid

- Redesign both variants:
  - Sparse: 1 or 2 columns max, stronger hierarchy, more whitespace.
  - Dense: still 2 columns max in preview, 3 only at true slide width.
- The `metric` line currently uses stat-value styling and can look wrong; convert it to an insight chip/footer with normal text wrapping.
- Ensure titles and descriptions have consistent line lengths and do not create cramped cards.

### 10. AnnotatedChart

- Keep static annotations, but audit annotation boxes:
  - Prevent labels from covering the chart line in narrow frames.
  - Reduce annotation width and position with container-aware constraints.
  - Use visible connector/dot relationship without relying on hover.
- Confirm no clipped annotation text.

### 11. FunnelLayout

- Redesign both variants:
  - Current horizontal bar/value layout is too fragile with long labels and `Hurtigruta Carglass`.
  - Use stacked funnel stages with: value badge, label, context, and proportional bar as a background/underlay.
  - The bar should never steal text width; it should be decorative or behind the content.
- Dense mode should become compact stacked rows, not narrow grid columns.

### 12. CustomerSpotlight

- Redesign sparse mode substantially:
  - Make it a clean case-study card with logo/customer header, summary, optional quote, and metrics in a controlled metric strip.
  - Metrics should use 1-column or 3 compact tiles only when enough width exists.
- Dense mode should be a compact two-panel only at wide width; otherwise stacked.
- Customer names and metric values must wrap intentionally, not overflow or become tiny.

### 13. SectionDivider

- Audit metric aside and title at preview widths.
- Apply the same metric-value helper and container-query behavior as Hero/StatCallout.

### 14. CitationFooter

- Ensure long source strings wrap as multiple lines, not single-line overflow.
- In dense mode, avoid flex row until container is wide enough.

### 15. PersonCard

- Avoid dense two-column layout until width is sufficient.
- Long names, roles, and metrics should wrap cleanly with consistent text scale.

### 16. CategoryCard

- Keep the footer fix, then audit full card layout:
  - No internal horizontal scroll.
  - No cramped status/metric pairs.
  - Long metric values should sit under status, not beside it.

## Preview page changes

Update `/cms/portal/components-preview` to act as a real stress-test rather than a nice-case demo:

- Keep every component pair, sparse + dense.
- Use Navio-relevant long strings for all known failure modes:
  - `NOK 10–20M`
  - `Hurtigruta Carglass`
  - `30 June 2026`
  - `Qualified mobile service operators across glass, tire, and fleet`
  - `Commercial proof with Hurtigruta Carglass`
- Add a small QA note at the top of the preview indicating the viewport widths tested manually.
- Do not use lorem ipsum or generic filler.

## Verification process

After implementation, use the sandbox dev login and screenshots to verify:

1. Desktop preview around current user viewport (`~1366x768`).
2. Narrow/tablet preview (`~834x1194` or closest supported width).
3. Mobile-ish narrow width (`~390x844`) if the CMS route remains usable.

For each viewport:

- Scroll through every component pair.
- Capture screenshots of each visible section group.
- Fix any remaining overflow immediately.
- Final report must explicitly say either:
  - `ALL 16 COMPONENTS PASS — no overflow at any tested viewport width`, or
  - list the exact remaining component/density/viewport failures and why they need a design decision.

## Technical constraints

- No hardcoded brand colors; continue using semantic tokens and deck brand helpers.
- No bullet rendering in slide components.
- No truncation/clipping as a substitute for layout quality.
- No moving to Deliverable 3 until this visual QA pass is complete.
- Keep sandbox dev access sandbox-only; do not introduce a production auth bypass.

## Implementation order

1. Shared primitives and CSS container-query layout rules.
2. Fix the six known-bad components first: `CustomerSpotlight`, `FunnelLayout`, `ProblemSolutionGrid`, `Timeline`, `StatGrid`, `StatCallout`.
3. Redesign `ComparisonTable` to remove internal horizontal scroll.
4. Audit and adjust the remaining components: `Hero`, `LogoGrid`, `QuoteBlock`, `ProcessFlow`, `AnnotatedChart`, `SectionDivider`, `CitationFooter`, `PersonCard`, `CategoryCard`.
5. Update preview stress data if needed.
6. Screenshot verification across the tested viewport widths and final pass/fail report.