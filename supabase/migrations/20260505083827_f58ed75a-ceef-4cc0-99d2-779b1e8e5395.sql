-- Create portal_style_references table
CREATE TABLE public.portal_style_references (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL CHECK (char_length(title) BETWEEN 1 AND 100),
  description text CHECK (description IS NULL OR char_length(description) BETWEEN 1 AND 300),
  image_url text NOT NULL DEFAULT '',
  asset_type text NOT NULL CHECK (asset_type IN ('slide-screenshot','deck-pdf','website-snapshot','brand-guideline')),
  source_company text,
  use_for text[] NOT NULL DEFAULT '{}',
  avoid boolean NOT NULL DEFAULT false,
  notes text NOT NULL CHECK (char_length(notes) BETWEEN 1 AND 2000),
  display_order integer NOT NULL DEFAULT 0,
  is_published boolean NOT NULL DEFAULT true,
  needs_image boolean NOT NULL DEFAULT false,
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_portal_style_references_listing
  ON public.portal_style_references (is_published, display_order);

CREATE OR REPLACE FUNCTION public.validate_portal_style_reference_use_for()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $func$
DECLARE
  allowed text[] := ARRAY['typography','color','layout','data-viz','whitespace','photography','narrative-structure','tone'];
  v text;
BEGIN
  IF NEW.use_for IS NOT NULL THEN
    FOREACH v IN ARRAY NEW.use_for LOOP
      IF NOT (v = ANY(allowed)) THEN
        RAISE EXCEPTION 'Invalid use_for value: %. Allowed: %', v, allowed;
      END IF;
    END LOOP;
  END IF;
  RETURN NEW;
END;
$func$;

CREATE TRIGGER trg_validate_portal_style_reference_use_for
BEFORE INSERT OR UPDATE ON public.portal_style_references
FOR EACH ROW EXECUTE FUNCTION public.validate_portal_style_reference_use_for();

CREATE TRIGGER trg_portal_style_references_updated_at
BEFORE UPDATE ON public.portal_style_references
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

ALTER TABLE public.portal_style_references ENABLE ROW LEVEL SECURITY;

CREATE POLICY "style_refs_select"
ON public.portal_style_references
FOR SELECT
USING (is_published = true OR public.is_admin());

CREATE POLICY "style_refs_admin_insert"
ON public.portal_style_references
FOR INSERT
WITH CHECK (public.is_admin());

CREATE POLICY "style_refs_admin_update"
ON public.portal_style_references
FOR UPDATE
USING (public.is_admin())
WITH CHECK (public.is_admin());

CREATE POLICY "style_refs_admin_delete"
ON public.portal_style_references
FOR DELETE
USING (public.is_admin());

INSERT INTO storage.buckets (id, name, public)
VALUES ('portal-style-references', 'portal-style-references', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "style_refs_storage_public_read"
ON storage.objects FOR SELECT
USING (bucket_id = 'portal-style-references');

CREATE POLICY "style_refs_storage_admin_insert"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'portal-style-references' AND public.is_admin());

CREATE POLICY "style_refs_storage_admin_update"
ON storage.objects FOR UPDATE
USING (bucket_id = 'portal-style-references' AND public.is_admin());

CREATE POLICY "style_refs_storage_admin_delete"
ON storage.objects FOR DELETE
USING (bucket_id = 'portal-style-references' AND public.is_admin());

-- Seed 21 placeholder rows (image_url empty; needs_image set after insert)
INSERT INTO public.portal_style_references
  (title, description, asset_type, source_company, use_for, avoid, notes, image_url, display_order, is_published)
VALUES
(
  'YC Seed Deck Template (Slidebean) — canonical structure',
  '12-slide YC seed deck template covering the canonical pitch arc',
  'deck-pdf',
  'Y Combinator',
  ARRAY['narrative-structure'],
  false,
  E'Reference for slide flow and what each slide must accomplish, not visual design. Canonical sequence: Title → Problem (3 pain points, one idea each) → Solution (3 benefits, one idea each) → Traction (single chart, 2 stats) → Revenue (single chart, 2 stats) → Secret Sauce → Business Model (3 metrics) → Future Growth → Team (photos + 1-line role) → Ask (single number, one sentence) → Closing.\n\nAI should consult this when reasoning about WHAT a given slide is for. The Navio slide briefs already follow this arc — reference this for any narrative-clarity questions.',
  '', 1, true
),
(
  'YC template — Problem slide (3-pain-point pattern)',
  'Three pain points, one big idea each, no bullet text',
  'slide-screenshot',
  'Y Combinator',
  ARRAY['layout', 'narrative-structure'],
  false,
  E'Pattern for ProblemSolutionGrid when pairs.length === 3. Single sentence per pain point under a circular icon — never bullet lists. Each pain point reads as one breath. Use for badge-taxonomy if reduced to 3 pairs, and for any slide answering "why is this a problem worth solving."',
  '', 2, true
),
(
  'YC template — Traction slide (single chart, 2 stat callouts)',
  'Area chart with growth + retention stats',
  'slide-screenshot',
  'Y Combinator',
  ARRAY['data-viz', 'layout'],
  false,
  E'Reference for AnnotatedChart in our component library. Single chart fills 2/3 of slide width. Stats live to the right as 2-3 short lines, not as labels on the chart itself. Numbers ALWAYS contextualized — "50% growth per month" not "50%". Use for adoption-curve and any traction-style slide.\n\nNotice: ONE color for the chart, no rainbow palette.',
  '', 3, true
),
(
  'YC template — Team slide (photos + 1-line role)',
  'Three founders, full-color portraits, role + 4-word descriptor',
  'slide-screenshot',
  'Y Combinator',
  ARRAY['photography', 'layout'],
  false,
  E'Reference for our PersonCard component and team visual_type. Full-color portraits in 1:1 ratio fill the cards (not headshots on white). Role in caps, then a single short descriptor underneath ("- knows how to pitch -"). No bios. The pattern says "trust the people, don''t read their resume." Match this restraint on the team slide.',
  '', 4, true
),
(
  'YC template — Ask slide (single number, single sentence)',
  'Round size as one large number plus a confident commitment',
  'slide-screenshot',
  'Y Combinator',
  ARRAY['layout', 'typography'],
  false,
  E'Reference for the round / the-ask slide. ONE number ($1.5m treatment), ONE confident commitment ("With this money, we''ll hit all the milestones for our next round"), single contextual sentence ("This is for engineers and marketing"). No use-of-funds pie chart in the cover treatment — that goes in a follow-up slide if needed. Apply to the round visual_type when sparse.',
  '', 5, true
),
(
  'YC template — Secret Sauce slide (anti-pattern)',
  'Cluttered four-image grid with mismatched cartoon assets',
  'slide-screenshot',
  'Y Combinator',
  ARRAY['layout', 'color', 'photography'],
  true,
  E'DO NOT match this. Four image cells with no visual coherence — cartoon clock, illustrated portrait, kaleidoscope pattern, anime origami. This violates restraint, one-idea-per-slide, and visual coherence.\n\nIf Navio''s "secret sauce" or "why us" slide wants to combine multiple concepts, find a single visual treatment, not a collage. The information is there but the slide reads as overwhelming. The slide that follows it (Business Model) is a much better reference: same information density, but a unified red-circle-on-photo treatment that holds together visually.',
  '', 6, true
),
(
  'Airbnb original deck — narrative arc',
  'The original Airbnb pitch deck recreated as PowerPoint',
  'deck-pdf',
  'Airbnb',
  ARRAY['narrative-structure', 'tone'],
  false,
  E'Reference for storytelling, NOT visual design. The visual treatment is dated and crude — do not match it.\n\nWhat''s worth learning: the progression from Problem (3 sentences) → Solution (3 verbs: SAVE / MAKE / SHARE) → Market Validation (one number per data point) → Market Size (3 nested concentric circles: TAM / SAM / SOM) → Product (real screenshots, not mockups) → Business Model (one sentence + revenue math) → Adoption (3 distribution channels) → Competition (2x2 quadrant). Each slide is one breath. Tone is direct, no superlatives.\n\nAI should consult this for narrative pacing and the discipline of one-slide-one-idea.',
  '', 7, true
),
(
  'Airbnb deck — Solution slide (3-verb structure)',
  'Solution as three big verbs with one-line context each',
  'slide-screenshot',
  'Airbnb',
  ARRAY['narrative-structure', 'layout'],
  false,
  E'Pattern for solution slides: 3 verbs in big type (SAVE / MAKE / SHARE), one short context line under each. The verbs do the work — not descriptions. Apply when the solution is multi-faceted. Could replace bullet-point "what we do" slides with this treatment.',
  '', 8, true
),
(
  'Airbnb deck — Market sizing (TAM/SAM/SOM concentric)',
  'Three nested figures showing market reduction',
  'slide-screenshot',
  'Airbnb',
  ARRAY['data-viz', 'layout'],
  false,
  E'Reference for any market-sizing slide. TAM as the largest number, SAM as a fraction, SOM as the addressable wedge. Three numbers, three short labels, nothing else.\n\nIf we add a market slide later, this is the treatment to apply via a custom composition.',
  '', 9, true
),
(
  'Airbnb deck — Competition 2x2',
  'Competitive landscape as quadrant',
  'slide-screenshot',
  'Airbnb',
  ARRAY['layout', 'data-viz'],
  false,
  E'Reference for competitive positioning. Two axes (Affordable/Expensive, Online/Offline transaction), competitors plotted in three quadrants, Navio''s brand fills the empty quadrant in big type. The empty quadrant IS the message.\n\nApply to any positioning/competition slide via custom composition with a 2x2 grid structure.',
  '', 10, true
),
(
  'Linear homepage — display typography aesthetic',
  E'Linear''s marketing site with massive light-grey display headlines',
  'website-snapshot',
  'Linear',
  ARRAY['typography', 'whitespace', 'layout'],
  false,
  E'THE primary reference for restraint. Massive display headlines in light-grey that almost fade into the page background — the headline is presence without shouting. Body copy is small, dense, and confident. Match this scale when generating cover slides and section dividers.\n\nNotice: headlines are not centered — they''re left-aligned with deep left margin. Try the ''left'' layout option for cover slides as an alternative to centered.',
  '', 11, true
),
(
  'Linear — numbered narrative system (1.0, 2.0, 3.0...)',
  'Sections numbered as 1.0 Intake, 2.0 Plan, 3.0 Build, 4.0 Diffs, 5.0 Monitor',
  'website-snapshot',
  'Linear',
  ARRAY['narrative-structure', 'layout'],
  false,
  E'Genuinely worth stealing for the deck. Linear gives each capability a decimal number (1.0, 2.0, 3.0, 4.0, 5.0) and treats the deck as a structured narrative with chapters.\n\nApply to our SectionDivider component: section number prominently displayed, then short title. Could organize the Navio deck into chapters: 1.0 Operativsystemet, 2.0 Kundene, 3.0 Verdimotoren, 4.0 Skalering, 5.0 Emisjon. AI should consider this when generating section dividers between thematic groups.',
  '', 12, true
),
(
  'Linear — three-column capability triads',
  'Built for purpose / Powered by AI / Designed for speed',
  'website-snapshot',
  'Linear',
  ARRAY['layout', 'typography', 'photography'],
  false,
  E'Reference for ProblemSolutionGrid when pairs.length === 3. Subtle isometric icon at top, short heading, 2-3 lines of body. Generous spacing between columns.\n\nThe icons are NOT decorative — they visually encode what the column is about (stacked layers for ''foundation'', cubes for ''composition'', steps for ''speed''). Match this discipline.',
  '', 13, true
),
(
  'Linear — testimonial quote treatment',
  'Three founder quotes treated as huge display type',
  'website-snapshot',
  'Linear',
  ARRAY['typography', 'layout'],
  false,
  E'Reference for QuoteBlock component. Quote in big serif-feeling display type, attribution small below with logo + name + company. NO quotation marks decorating the quote — the type weight does the work.\n\nApply to customer-spotlight QuoteBlock when we have the real Hurtigruta Carglass testimonial.',
  '', 14, true
),
(
  'Linear — product UI integrated as visual',
  'Real product screenshots embedded in marketing layout',
  'website-snapshot',
  'Linear',
  ARRAY['photography', 'layout'],
  false,
  E'Linear shows REAL UI screenshots, not abstract mockups or 3D illustrations. The product is its own demo.\n\nApply when showing Navio UI: real screenshots from the actual product (booking flow, dispatch, technician app), not generic SaaS dashboard illustrations. If we add a product slide, this is the treatment.',
  '', 15, true
),
(
  E'Linear — Get started / Contact sales CTA pair',
  'Two pill-shaped buttons with confident closing line',
  'website-snapshot',
  'Linear',
  ARRAY['layout', 'typography'],
  false,
  E'Reference for closing/the-ask CTA. "Built for the future. Available today." treated as a confident closing display line. Two CTAs side by side.\n\nApply to our round visual_type CTA: confident closing line + "Meld investeringsinteresse" button. The closing line should feel like a thesis statement, not a call to action.',
  '', 16, true
),
(
  'Apple — macOS 26 bento grid summary',
  'Dense feature grid with center hero wordmark and 12+ surrounding feature tiles',
  'slide-screenshot',
  'Apple',
  ARRAY['layout', 'whitespace', 'color', 'photography'],
  false,
  E'Reference for high-density "everything we shipped" summary slides. Light-grey field background, white rounded tiles for each feature, with ONE center tile (macOS wordmark on gradient) sized about 2x larger than surrounding tiles to anchor the eye.\n\nTiles vary in size — some are square, some rectangular — which prevents grid-monotony. Each tile is one feature, one image or one phrase, never both fighting for space. No dividers between tiles, just generous whitespace gaps.\n\nApply this when a slide needs to summarize multiple features without bullet points (e.g., a "what''s in the platform" or "key capabilities" slide). The discipline: one element per tile, one hero per slide, varied tile sizes for rhythm.',
  '', 17, true
),
(
  'Apple — Platforms State of the Union summary',
  'Mixed-density bento grid combining product photos, code snippets, and text-only tiles',
  'slide-screenshot',
  'Apple',
  ARRAY['layout', 'typography', 'photography'],
  false,
  E'Reference for mixing content types in a single layout. This slide combines: a product UI screenshot (Xcode), a code snippet on a gradient background (Foundation Models), a text-only tile in a serif treatment ("Fast / Expressive / Safe / Interoperable / Adaptable" stacked words), a product photo (visionOS user), and pure typography tiles (#Playground, SwiftUI).\n\nThe lesson: one layout can hold multiple content types as long as each tile commits fully to its type. Don''t put a small product photo next to a small text label inside the same tile — pick one.\n\nThe tile labelled "Fast / Expressive / Safe..." with stacked words on orange gradient is a particularly strong pattern for "our product principles" or "values" slides — words as the visual.',
  '', 18, true
),
(
  'Apple — iPhone 17 Pro hero center treatment',
  'Dark canvas with massive orange product hero and surrounding spec tiles',
  'slide-screenshot',
  'Apple',
  ARRAY['layout', 'color', 'photography', 'typography'],
  false,
  E'Reference for hero-product cover and spotlight slides. Dark almost-black background with darker tiles — high-end, expensive feel.\n\nThe iPhone 17 Pro photo dominates the center at 2x the size of any other tile, with the word "PRO" in massive orange display type behind it (the type IS the design). Surrounding tiles handle one spec each: "48MP Pro Fusion camera system", "A19 PRO" chip, "6.9" / 6.3"" size callout, "Best battery life ever" with a battery icon, photography samples that double as visual proof.\n\nApply the dark-tile-on-darker-field treatment for premium product moments. Don''t mix dark and light tiles in the same slide. The "PRO" wordmark behind the product is the trick — let typography play structural role, not just label.',
  '', 19, true
),
(
  'Apple — Apple Watch Ultra 3 hybrid bento',
  'Light field with center product photo and varied feature tiles around it',
  'slide-screenshot',
  'Apple',
  ARRAY['layout', 'photography', 'data-viz'],
  false,
  E'Reference for "single hero plus supporting context" slides. Light grey field, white tiles, watch product photo in the largest center tile.\n\nNote the spec callouts: "42 hours" battery in a literal green battery-shaped graphic — the icon IS the data viz, not a chart with "42" on it. Same trick with "Brighter off-angle display" using a real lifestyle photo. The watch face on the right is shown at near-actual-size to communicate scale.\n\nApply this pattern when a metric has an obvious physical or visual analog — render the metric AS the icon, not next to one. Also: "Best GPS in a sports watch" is a tile-sized testimonial-style claim with a supporting photo. That''s a more confident treatment than putting it in body text.',
  '', 20, true
),
(
  'Apple — AirPods Pro 3 bento with single hero',
  'Light field, center product photo, feature tiles with mixed icon/text/photo treatments',
  'slide-screenshot',
  'Apple',
  ARRAY['layout', 'color', 'typography'],
  false,
  E'Reference for product-spotlight slides where one product needs to carry multiple supporting claims.\n\nNotice the COLOR DISCIPLINE: most of the canvas is greyscale and white, with each tile''s accent in a different color (purple "Hearing Aid", green workout icons, pink "Heart rate sensor", coral "Hello/Hola" translation gradient). This is permission to use multiple accent colors WITHIN a slide as long as each tile fully commits to its one color.\n\nThe "65% recycled plastic in the case" treatment is also worth noting — single big number, single short context line, nothing else. Pattern for StatCallout when a metric needs to feel premium rather than spreadsheet-like.',
  '', 21, true
);

UPDATE public.portal_style_references SET needs_image = true WHERE image_url = '';