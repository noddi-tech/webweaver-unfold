CREATE TABLE public.portal_slide_briefs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  narrative_position int NOT NULL,
  narrative_role text NOT NULL,
  drafting_guidance text NOT NULL,
  suggested_visual_types text[] NOT NULL DEFAULT '{}',
  reference_resources text[] NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.portal_slide_briefs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read slide briefs"
  ON public.portal_slide_briefs FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Admins can write slide briefs"
  ON public.portal_slide_briefs FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

INSERT INTO public.portal_slide_briefs (slug, narrative_position, narrative_role, drafting_guidance, suggested_visual_types, reference_resources) VALUES
('cover', 1, 'Set the room. Navio in one frame.',
  'Single confident statement of what Navio is. No bullet points. Visual should feel premium and Norwegian. The tagline should be 8-12 words and convey both software and operational depth.',
  ARRAY['cover'], ARRAY[]::text[]),
('foot-in-door', 2, 'Demonstrate market validation through industry-leader engagement',
  'Show that the world''s biggest mobility brands are engaged with us. Use logos. Reference specific named partners (Carglass, Best-Drive, etc.) but don''t overclaim status — most are pilots or early. Caption should convey "we''re early but the right people are listening."',
  ARRAY['logos'], ARRAY['portal_customers', 'media_assets:partner_logos']),
('product-one-liner', 3, 'Define what Navio actually is in one sentence',
  'A single sentence the audience repeats back. Avoid jargon. Should clarify: B2B SaaS + mobile car/tire services + operational depth. Use a single visual or no visual.',
  ARRAY['custom'], ARRAY[]::text[]),
('two-legs', 4, 'Explain the dual structure: Navio platform and Dekkfix operations',
  'Navio is the SaaS platform we sell to others. Dekkfix is our own operational arm that gives us real-world feedback no competitor has. Two parallel pillars supporting each other. Don''t imply they''re separate companies.',
  ARRAY['custom', 'verticals'], ARRAY[]::text[]),
('why-now', 5, 'Establish market timing — why this opportunity exists right now',
  'Three forces: digital expectations from consumers, mobile services scaling beyond what spreadsheets can handle, and AI/automation lowering the bar to deploy operational software. Avoid generic ''post-COVID'' framings.',
  ARRAY['custom', 'gap'], ARRAY[]::text[]),
('digital-gap', 6, 'Show the digital readiness gap in mobile car and tire services',
  'Most operators run on phone calls and Excel. Customer expectations are now app-based. The gap is widening. Quantify if possible. Don''t name competitors negatively.',
  ARRAY['gap', 'custom'], ARRAY[]::text[]),
('badge-taxonomy', 7, 'The five customer problems we solve repeatedly',
  'This is the engine slide. Already strong. Five problem/solution pairs. Each pair is concrete: data triggers, FTE utilization, mobile capacity, digital journey, proactive sales. Hold this structure.',
  ARRAY['badges'], ARRAY[]::text[]),
('value-engine', 8, 'Deep dive on unit economics — how the engine compounds',
  'Show that customers buying Navio see compounding value: more cities, more daily volume, higher revenue per customer. Use real numbers from existing customers if available. Don''t project beyond what we can defend.',
  ARRAY['custom', 'adoption'], ARRAY['portal_customers', 'portal_adoption_points']),
('vertical-replicability', 9, 'Prove the model crosses verticals',
  'We started in tire services. Now expanding to car wash, glass, paint, fleet maintenance. The same operating system replicates. Show this as a list of verticals with status (live, pilot, planned).',
  ARRAY['verticals'], ARRAY[]::text[]),
('funnel', 10, 'Sales funnel — pipeline from prospect to expanding',
  'Show real customers at each stage of the funnel: discovery, qualified, pre-pilot, pilot, signed, expanding. Use real customer names from portal_customers. This is proof of pipeline depth.',
  ARRAY['funnel'], ARRAY['portal_customers']),
('adoption-curve', 11, 'Adoption metrics — cities live and addressability over time',
  'Show actual adoption growth from our active customers. Cities live, customers per day, percent of addressable market reached. Use portal_adoption_points data. Honest about the early stage but show the trajectory.',
  ARRAY['adoption'], ARRAY['portal_customers', 'portal_adoption_points']),
('customer-carglass', 12, 'Hurtigruta Carglass case study — multi-location enterprise',
  'Carglass operates 6 cities, 250 customers per day, signed contract. Use the testimonial. Show what specifically Navio enabled (multi-location operations). Don''t fabricate metrics.',
  ARRAY['customer-spotlight'], ARRAY['portal_customers']),
('customer-tronderdekk', 13, 'Trønderdekk case study — independent operator',
  'Trønderdekk is an independent tire operator using Navio. Show how Navio works for smaller operators, not just enterprise. Highlight the operator-friendly elements.',
  ARRAY['customer-spotlight'], ARRAY['portal_customers']),
('financials-glide', 14, 'ARR projection — actuals into projection',
  'Show ARR over time with actuals (solid) and projections (lighter). Use portal_financial_projections. Be conservative on projections. Reference the round size and use of funds context if helpful.',
  ARRAY['glide'], ARRAY['portal_financial_projections', 'portal_round_terms']),
('europe-replication', 15, 'European expansion thesis',
  'Norwegian beachhead → Nordic → DACH → broader EU. Show specific countries and rationale (mobile services density, regulatory similarity, language proximity). Don''t overclaim timing.',
  ARRAY['custom', 'verticals'], ARRAY[]::text[]),
('the-ask', 16, 'The fundraise — terms, use of funds, target close',
  'NOK 10-20M raise on top of NOK 22M already raised. Target close 30 June 2026. Use of funds breakdown. CTA to indicate interest. Don''t overpromise on what the round will achieve.',
  ARRAY['round'], ARRAY['portal_round_terms']);
