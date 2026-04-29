CREATE TABLE IF NOT EXISTS public.portal_slide_briefs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL REFERENCES public.portal_slides(slug) ON DELETE CASCADE,
  narrative_position int NOT NULL,
  narrative_role text NOT NULL,
  drafting_guidance text NOT NULL,
  suggested_visual_types text[] NOT NULL,
  reference_resources text[],
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT portal_slide_briefs_position_range CHECK (narrative_position BETWEEN 1 AND 16),
  CONSTRAINT portal_slide_briefs_suggested_visual_types_not_empty CHECK (array_length(suggested_visual_types, 1) > 0)
);

CREATE INDEX IF NOT EXISTS portal_slide_briefs_slug_idx
  ON public.portal_slide_briefs (slug);

CREATE INDEX IF NOT EXISTS portal_slide_briefs_narrative_position_idx
  ON public.portal_slide_briefs (narrative_position);

CREATE TABLE IF NOT EXISTS public.portal_slide_drafts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slide_slug text NOT NULL REFERENCES public.portal_slides(slug) ON DELETE CASCADE,
  editor_email text,
  editor_user_id uuid,
  prompt text,
  response jsonb NOT NULL,
  model text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS portal_slide_drafts_editor_created_idx
  ON public.portal_slide_drafts (editor_user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS portal_slide_drafts_slide_created_idx
  ON public.portal_slide_drafts (slide_slug, created_at DESC);

ALTER TABLE public.portal_slide_briefs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.portal_slide_drafts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can view slide briefs" ON public.portal_slide_briefs;
CREATE POLICY "Admins can view slide briefs"
  ON public.portal_slide_briefs
  FOR SELECT
  TO authenticated
  USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can manage slide briefs" ON public.portal_slide_briefs;
CREATE POLICY "Admins can manage slide briefs"
  ON public.portal_slide_briefs
  FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admins can view slide draft logs" ON public.portal_slide_drafts;
CREATE POLICY "Admins can view slide draft logs"
  ON public.portal_slide_drafts
  FOR SELECT
  TO authenticated
  USING (public.is_admin());

DROP TRIGGER IF EXISTS update_portal_slide_briefs_updated_at ON public.portal_slide_briefs;
CREATE TRIGGER update_portal_slide_briefs_updated_at
  BEFORE UPDATE ON public.portal_slide_briefs
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

INSERT INTO public.portal_slide_briefs (
  slug,
  narrative_position,
  narrative_role,
  drafting_guidance,
  suggested_visual_types,
  reference_resources
) VALUES
(
  'cover',
  1,
  'Set the room. Navio in one frame.',
  'Use a confident, spare opening tone that frames Navio as a focused B2B SaaS company, not a broad mobility concept. Keep the message crisp and memorable; avoid feature lists, buzzwords, or claims that need proof later in the deck.',
  ARRAY['cover','custom'],
  ARRAY[]::text[]
),
(
  'foot-in-door',
  2,
  'Demonstrate market validation through industry-leader engagement',
  'Use a proof-led tone anchored in named customer or partner engagement. Emphasize that industry leaders are engaging because the pain is concrete; avoid implying every logo is a signed long-term contract unless the reference data supports it.',
  ARRAY['logos','custom'],
  ARRAY['portal_customers','media_assets:partner_logos']
),
(
  'product-one-liner',
  3,
  'Define what Navio actually is in one sentence',
  'Be direct and precise: explain what the platform does, who it serves, and why it matters in one clean frame. Avoid jargon, multi-paragraph product explanation, and inflated category creation language.',
  ARRAY['custom','cover'],
  ARRAY[]::text[]
),
(
  'two-legs',
  4,
  'Explain the dual structure: Navio (SaaS platform) and Dekkfix (operational proof)',
  'Use an explanatory but confident tone. Make clear that Navio is the scalable software layer while Dekkfix validates the operating model in the market; avoid making Dekkfix sound like the only long-term business model.',
  ARRAY['custom','verticals'],
  ARRAY[]::text[]
),
(
  'why-now',
  5,
  'Establish market timing — why this opportunity exists right now',
  'Use a market-timing tone grounded in customer behavior, labor pressure, and service expectations. Show why the opening exists now without claiming inevitability or overstating regulatory or macro certainty.',
  ARRAY['custom','badges'],
  ARRAY['portal_customers']
),
(
  'digital-gap',
  6,
  'Show the digital readiness gap in mobile car and tire services',
  'Use a data-driven, gap-analysis tone. Highlight the difference between customer expectations and fragmented operational tooling; avoid shaming the industry or relying on unsupported market-size claims.',
  ARRAY['gap','custom'],
  ARRAY['portal_customers']
),
(
  'badge-taxonomy',
  7,
  'The five customer problems we solve (already strong, this is the engine)',
  'Use a crisp problem-solution taxonomy. Keep each problem specific and each solution operationally believable; avoid adding more than five themes or watering down the slide with generic SaaS benefits.',
  ARRAY['badges'],
  ARRAY['portal_customers']
),
(
  'value-engine',
  8,
  'Deep dive on unit economics — how the engine compounds',
  'Use a disciplined economics tone that explains how software, repeat workflows, and expanding customer deployments compound over time. Use reference data where available; avoid promising margins, payback, or growth rates that are not present in the data.',
  ARRAY['badges','custom'],
  ARRAY['portal_customers','portal_financial_projections']
),
(
  'vertical-replicability',
  9,
  'Prove the model crosses verticals (tires, car wash, etc.)',
  'Use a replication thesis tone: show what stays constant across verticals and what changes locally. Be specific about first adjacent verticals; avoid claiming the model works everywhere without constraints.',
  ARRAY['verticals','custom'],
  ARRAY['portal_customers']
),
(
  'funnel',
  10,
  'Sales funnel — pipeline from prospect to expanding',
  'Use a pipeline-management tone with clear movement from prospecting to expansion. Ground the slide in published customer status and funnel data; avoid turning prospects into committed revenue unless the data says so.',
  ARRAY['funnel'],
  ARRAY['portal_customers']
),
(
  'adoption-curve',
  11,
  'Adoption metrics — cities live, customers per day, addressability over time',
  'Use a metrics-led tone focused on adoption, coverage, and usage. Prefer concrete values from customer data; avoid smoothing sparse data into a false trend or implying future adoption is guaranteed.',
  ARRAY['adoption','custom'],
  ARRAY['portal_customers']
),
(
  'customer-carglass',
  12,
  'Hurtigruta Carglass case study — multi-location enterprise',
  'Use a customer-proof tone for a multi-location enterprise buyer. Focus on rollout complexity, operational value, and enterprise relevance; avoid inventing testimonials or outcomes not present in the customer record.',
  ARRAY['customer-spotlight','custom'],
  ARRAY['portal_customers']
),
(
  'customer-tronderdekk',
  13,
  'Trønderdekk case study — independent operator',
  'Use a grounded operator-focused tone that contrasts enterprise validation with independent operator usefulness. Emphasize practical daily workflow value; avoid making the case sound like a large-enterprise rollout.',
  ARRAY['customer-spotlight','custom'],
  ARRAY['portal_customers']
),
(
  'financials-glide',
  14,
  'ARR projection — actuals into projection',
  'Use a cautious, data-driven finance tone. Separate actuals from projections clearly and explain the logic of the glide path; avoid certainty language, hockey-stick hype, or unqualified break-even claims.',
  ARRAY['glide','custom'],
  ARRAY['portal_financial_projections']
),
(
  'europe-replication',
  15,
  'European expansion thesis — replicable to which markets first',
  'Use a strategic expansion tone that names where the model could travel first and why. Tie the thesis to similar service fragmentation and customer needs; avoid implying expansion has already been executed unless reference data supports it.',
  ARRAY['custom','verticals'],
  ARRAY['portal_customers','portal_financial_projections']
),
(
  'the-ask',
  16,
  'NOK 10-20M raise on top of NOK 22M raised, target close 30 June 2026',
  'Use a clear fundraising tone with exact numbers from the active round terms. Explain what the capital unlocks and keep the ask straightforward; avoid valuation pressure, scarcity tactics, or promising investor returns.',
  ARRAY['round','custom'],
  ARRAY['portal_round_terms']
)
ON CONFLICT (slug) DO UPDATE SET
  narrative_position = EXCLUDED.narrative_position,
  narrative_role = EXCLUDED.narrative_role,
  drafting_guidance = EXCLUDED.drafting_guidance,
  suggested_visual_types = EXCLUDED.suggested_visual_types,
  reference_resources = EXCLUDED.reference_resources,
  updated_at = now();