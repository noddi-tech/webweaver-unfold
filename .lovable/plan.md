I’ll implement this exactly as a checkpointed sequence, not as one giant all-at-once change. Because this request explicitly requires stopping after each deliverable for verification, the first implementation pass will complete Deliverable 1 only, report the captured brand values, and wait for confirmation before moving to Deliverable 2.

Pre-flight findings from read-only exploration

Brand/token source confirmed:
- `/cms` → Design System → Colors & Tokens uses `ColorPaletteTab`, which loads active tokens from `public.color_tokens`.
- I queried the live `color_tokens` table and will use those values, not guesses.
- Existing CSS token definitions in `src/index.css` align with the DB-driven color system, but there are a few DB/CSS differences; per project memory, DB is the source of truth.

Captured live color values to encode in `_brand.ts`:
- `--primary` / Federal Blue: `249 67% 24%`
- `--secondary` / Vivid Purple: `250 57% 55%`
- `--vibrant-purple`: `266 85% 58%`
- `--brand-orange`: `25 95% 63%`
- `--brand-pink`: `321 59% 85%`
- `--brand-peach`: `25 95% 70%`
- `--brand-blue`: `210 100% 50%`
- `--brand-teal`: `180 70% 45%`
- `--brand-green`: `142 76% 50%`
- `--background` in DB: `0 0% 100%`
- CSS app background in `src/index.css`: `40 18% 96%` / Bright Snow `#F8F7F4`; I will expose this as the deck’s warm slide background because it matches the project memory and site background intent.
- `--muted`: DB `0 0% 96%`; CSS app token `34 10% 85%`
- `--muted-foreground`: `0 0% 35%`
- `--foreground`: `249 67% 24%`
- `--card`: `249 67% 24%`
- `--card-foreground`: `0 0% 100%`
- `--card-surface`: `258 72% 95%`
- `--card-surface-foreground`: `250 54% 39%`
- `--border`: `0 0% 90%`
- `--gradient-primary`: `linear-gradient(135deg, hsl(249, 67%, 24%), hsl(266, 85%, 58%))`
- `--gradient-hero`: DB value `linear-gradient(135deg, hsl(266, 85%, 58%), hsl(25, 95%, 63%))`; CSS file value currently differs (`249 67% 24% → 266 85% 58%`). I will document both and set `brand.gradientHero` to `var(--gradient-hero)` so runtime follows the active design system.
- `--gradient-purple-depth`: `linear-gradient(135deg, hsl(250 57% 55%) 0%, hsl(250 54% 39%) 50%, hsl(249 67% 24%) 100%)`

Typography/spacing source confirmed:
- Font family: `Atkinson Hyperlegible Next` for sans, `Atkinson Hyperlegible Mono` for mono.
- Existing typography hook uses large site headings, but investor slides need a deck-specific scale.
- Existing spacing tokens are 4px-based; section rhythm in memory is 80px. I will encode the requested deck rhythm in `_brand.ts` while preserving token-driven semantics.

Implementation sequence

Deliverable 1 — Brand grounding only
1. Create `src/components/portal-deck/visuals/_brand.ts` with:
   - `brand` typed constant for semantic colors, accent colors, hero/purple gradients, warm surface background, card surfaces, borders, foregrounds, and chart colors.
   - `type` typed constant for deck typography scale exactly aligned with the requested large-slide hierarchy.
   - `space` typed constant for slide padding, section gaps, card padding, and item gaps.
   - Shared types: `Density`, `DeckAccent`, and helper maps where useful.
2. Use DB/CSS variable references in component-facing values, with comments containing the captured actual HSL values for auditability.
3. Do not refactor renderers yet.
4. Verification checkpoint 1 response will include:
   - Files changed.
   - The full color values captured above.
   - PASS/FAIL for `_brand.ts created with actual token values`.

Stop after Deliverable 1 and wait for confirmation.

Deliverable 2 — Component library after confirmation
1. Add `src/components/portal-deck/components/` with a barrel `index.ts` and shared local utilities.
2. Build the 16 components requested:
   - `Hero`
   - `StatCallout`
   - `StatGrid`
   - `LogoGrid`
   - `QuoteBlock`
   - `ComparisonTable`
   - `Timeline`
   - `ProcessFlow`
   - `ProblemSolutionGrid`
   - `AnnotatedChart`
   - `FunnelLayout`
   - `CustomerSpotlight`
   - `SectionDivider`
   - `CitationFooter`
   - `PersonCard`
   - `CategoryCard`
3. Each component will:
   - Accept typed props and optional `mode?: SlideMode`.
   - Support `density?: 'sparse' | 'dense'` with sparse as default.
   - Import `brand`, `type`, and `space`; no direct ad-hoc hardcoded slide colors/spacing/type scales.
   - Avoid bullet-list rendering entirely.
   - Favor one accent color, strong whitespace, and contextualized metrics.
4. Add `/cms/portal/components-preview` behind `AdminRoute`.
5. Add the nav item in `PortalCmsLayout`.
6. Preview page will render every component in sparse and dense mode with realistic sample data.
7. Stop and report Verification Checkpoint 2.

Deliverable 3 — Renderer refactor after confirmation
1. Update `src/components/portal-deck/types.ts` to support the new visual_config schemas while retaining backwards-compatible normalizers for old `badges`, `verticals`, and `gap` shapes where possible.
2. Refactor all 12 visual renderers so they become composition layers over the library:
   - `cover` → `Hero` + optional `CitationFooter`
   - `logos` → `LogoGrid` with Supabase customers filtered by `customer_slugs`
   - `badges` → `ProblemSolutionGrid`, accepting new `pairs` and legacy `badges`
   - `funnel` → `FunnelLayout`, deriving stages from `portal_customers` if not supplied
   - `adoption` → `AnnotatedChart` from `portal_adoption_points`
   - `glide` → `AnnotatedChart` from `portal_financial_projections`
   - `team` → `PersonCard` layout
   - `round` → `StatGrid` + CTA, from active `portal_round_terms`
   - `gap` → `ComparisonTable`, with legacy category fallback if needed
   - `verticals` → `CategoryCard`, accepting new `items` and legacy `verticals`
   - `customer-spotlight` → `CustomerSpotlight`
   - `custom` → safe component composition from allowed component names
3. Remove old direct-DOM visual UI from renderers.
4. Extend the preview page to show each visual_type renderer with realistic sample `visual_config`.
5. Stop and report Verification Checkpoint 3.

Deliverable 4 — AI drafting schema update after confirmation
1. Update `supabase/functions/draft-slide/index.ts`:
   - Request body adds `include_style_references?: boolean` later used by Deliverable 5, default true.
   - `schemasFor()` updated strictly for all 12 visual types, with `additionalProperties: false` where schemas are defined.
   - Custom schema includes the allowed `composition` array and component enum exactly as requested.
   - Runtime validators updated to match the new schemas, including backwards-safe handling where appropriate.
   - System prompt replaced with the design principles from the brief.
2. Ensure prompt logs remain in `portal_slide_drafts.prompt` with enough provenance to verify references and generated schema context.
3. I will not generate a live draft unless Joachim confirms; the checkpoint will identify how to verify product-one-liner safely.
4. Stop and report Verification Checkpoint 4.

Deliverable 5 — Style references after confirmation
1. Create a schema migration for `public.portal_style_references` with RLS using `public.is_admin()` exactly as specified.
2. Add `/cms/portal/style-references` behind `AdminRoute`.
3. Add nav item in `PortalCmsLayout`.
4. Build gallery + add/edit/delete interface:
   - Image upload using existing storage/image patterns in the CMS.
   - Title, description, asset type select, source company, use_for tag multi-select, avoid toggle, notes.
   - Grouped gallery by `use_for`, with thumbnail + metadata.
5. Update `draft-slide` to fetch style references when `include_style_references !== false`, group by tags, include avoid patterns, and pass text-only design reference context to Claude.
6. Stop and report Verification Checkpoint 5.

Verification approach

For each checkpoint I will report:
- Files/tables changed.
- What was verified.
- PASS/FAIL with evidence.
- Any manual verification blockers.

Important guardrails I will follow

- No bullet-point slide rendering in the component library.
- No stock photography or invented customer names.
- No hardcoded color/type/spacing values in components outside the shared `_brand.ts` constants.
- No AI draft generation without Joachim confirmation.
- Existing structured editors remain as the fine-tune layer.
- Static `/cms/portal/*` routes will be added before dynamic routes, preserving the project routing rule.
- Admin checks continue to use the existing `AdminRoute` / `supabase.rpc('is_admin')` pattern.