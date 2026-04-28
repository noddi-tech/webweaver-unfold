-- =============================================
-- Investor Portal Foundation
-- =============================================

-- =============================================
-- Tables
-- =============================================

CREATE TABLE public.investor_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  name text NOT NULL,
  firm text,
  ip_address inet,
  user_agent text,
  referrer text,
  started_at timestamptz NOT NULL DEFAULT now(),
  last_seen_at timestamptz NOT NULL DEFAULT now(),
  ended_at timestamptz,
  total_dwell_seconds int NOT NULL DEFAULT 0
);

CREATE INDEX investor_sessions_email_started_idx
  ON public.investor_sessions (email, started_at DESC);
CREATE INDEX investor_sessions_started_idx
  ON public.investor_sessions (started_at DESC);

CREATE TABLE public.nda_versions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  version int NOT NULL UNIQUE,
  body_md text NOT NULL,
  effective_from timestamptz NOT NULL DEFAULT now(),
  is_current boolean NOT NULL DEFAULT false
);

CREATE UNIQUE INDEX nda_versions_one_current_idx
  ON public.nda_versions (is_current)
  WHERE is_current = true;

CREATE TABLE public.nda_acceptances (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid REFERENCES public.investor_sessions(id) ON DELETE SET NULL,
  email text NOT NULL,
  nda_version_id uuid REFERENCES public.nda_versions(id),
  accepted_at timestamptz NOT NULL DEFAULT now(),
  ip_address inet,
  user_agent text
);

CREATE INDEX nda_acceptances_email_idx ON public.nda_acceptances (email);
CREATE INDEX nda_acceptances_session_idx ON public.nda_acceptances (session_id);

CREATE TABLE public.investor_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid REFERENCES public.investor_sessions(id) ON DELETE SET NULL,
  email text NOT NULL,
  event_type text NOT NULL CHECK (event_type IN (
    'session_start', 'session_end',
    'tab_view', 'tab_exit',
    'slide_view', 'slide_exit',
    'pdf_export', 'link_click',
    'pledge_submitted', 'pledge_revised',
    'nda_accepted'
  )),
  path text,
  payload jsonb DEFAULT '{}'::jsonb,
  dwell_seconds int,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX investor_events_session_created_idx
  ON public.investor_events (session_id, created_at);
CREATE INDEX investor_events_email_created_idx
  ON public.investor_events (email, created_at DESC);
CREATE INDEX investor_events_type_created_idx
  ON public.investor_events (event_type, created_at);

CREATE TABLE public.investor_pledges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL UNIQUE,
  name text NOT NULL,
  firm text,
  amount_nok bigint NOT NULL CHECK (amount_nok > 0),
  is_firm boolean NOT NULL DEFAULT false,
  conditions text,
  preferred_valuation_nok bigint,
  lead_intent text CHECK (lead_intent IN ('lead', 'co_lead', 'follow') OR lead_intent IS NULL),
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.portal_slides (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slide_number int NOT NULL,
  slug text NOT NULL UNIQUE,
  title text,
  subtitle text,
  body_md text,
  visual_type text CHECK (visual_type IN (
    'cover', 'logos', 'badges', 'funnel', 'adoption',
    'glide', 'team', 'round', 'gap', 'verticals',
    'customer-spotlight', 'custom'
  )),
  visual_config jsonb DEFAULT '{}'::jsonb,
  is_published boolean NOT NULL DEFAULT false,
  display_order int NOT NULL
);

CREATE INDEX portal_slides_display_order_idx
  ON public.portal_slides (display_order);

CREATE TABLE public.portal_customers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  name text NOT NULL,
  parent_brand text,
  logo_url text,
  status text CHECK (status IN ('live', 'pilot', 'pre-pilot', 'prospect', 'inbound')),
  funnel_stage text CHECK (funnel_stage IN ('discovery', 'qualified', 'pre-pilot', 'pilot', 'signed', 'expanding')),
  cities_live int DEFAULT 0,
  total_addressable_cities int,
  customers_per_day int,
  monthly_revenue_nok bigint,
  pilot_started_at date,
  contract_signed_at date,
  case_study_md text,
  testimonial_quote text,
  testimonial_author text,
  testimonial_role text,
  is_published boolean NOT NULL DEFAULT false,
  display_order int NOT NULL DEFAULT 0
);

CREATE TABLE public.portal_adoption_points (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id uuid NOT NULL REFERENCES public.portal_customers(id) ON DELETE CASCADE,
  date date NOT NULL,
  cities_live int NOT NULL,
  pct_addressable numeric(5,2),
  note text,
  UNIQUE (customer_id, date)
);

CREATE INDEX portal_adoption_points_customer_date_idx
  ON public.portal_adoption_points (customer_id, date);

CREATE TABLE public.portal_financial_projections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  period_label text NOT NULL,
  period_date date NOT NULL,
  arr_nok bigint NOT NULL,
  is_actual boolean NOT NULL DEFAULT false,
  notes text,
  display_order int NOT NULL DEFAULT 0
);

CREATE TABLE public.portal_team_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  role text NOT NULL,
  bio text,
  photo_url text,
  is_founder boolean DEFAULT false,
  display_order int NOT NULL DEFAULT 0,
  is_published boolean NOT NULL DEFAULT true
);

CREATE TABLE public.portal_round_terms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  round_size_min_nok bigint,
  round_size_max_nok bigint,
  valuation_min_nok bigint,
  valuation_max_nok bigint,
  use_of_funds jsonb DEFAULT '[]'::jsonb,
  target_close_date date,
  total_raised_to_date_nok bigint DEFAULT 0,
  round_label text DEFAULT 'Series A',
  is_active boolean NOT NULL DEFAULT true,
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- =============================================
-- Enable RLS
-- =============================================

ALTER TABLE public.investor_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.nda_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.nda_acceptances ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.investor_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.investor_pledges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.portal_slides ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.portal_customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.portal_adoption_points ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.portal_financial_projections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.portal_team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.portal_round_terms ENABLE ROW LEVEL SECURITY;

-- =============================================
-- RLS Policies — public-readable (published only), CMS-managed writes
-- =============================================

-- portal_slides
CREATE POLICY "Public can view published slides"
  ON public.portal_slides FOR SELECT
  TO anon, authenticated
  USING (is_published = true);
CREATE POLICY "Admins manage slides"
  ON public.portal_slides FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- portal_customers
CREATE POLICY "Public can view published customers"
  ON public.portal_customers FOR SELECT
  TO anon, authenticated
  USING (is_published = true);
CREATE POLICY "Admins manage customers"
  ON public.portal_customers FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- portal_adoption_points (no is_published column — gated by parent customer)
CREATE POLICY "Public can view adoption points for published customers"
  ON public.portal_adoption_points FOR SELECT
  TO anon, authenticated
  USING (EXISTS (
    SELECT 1 FROM public.portal_customers c
    WHERE c.id = portal_adoption_points.customer_id AND c.is_published = true
  ));
CREATE POLICY "Admins manage adoption points"
  ON public.portal_adoption_points FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- portal_financial_projections (no is_published column — fully public read)
CREATE POLICY "Public can view financial projections"
  ON public.portal_financial_projections FOR SELECT
  TO anon, authenticated
  USING (true);
CREATE POLICY "Admins manage financial projections"
  ON public.portal_financial_projections FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- portal_team_members
CREATE POLICY "Public can view published team members"
  ON public.portal_team_members FOR SELECT
  TO anon, authenticated
  USING (is_published = true);
CREATE POLICY "Admins manage team members"
  ON public.portal_team_members FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- portal_round_terms (no is_published — gated by is_active)
CREATE POLICY "Public can view active round terms"
  ON public.portal_round_terms FOR SELECT
  TO anon, authenticated
  USING (is_active = true);
CREATE POLICY "Admins manage round terms"
  ON public.portal_round_terms FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- nda_versions
CREATE POLICY "Public can view current NDA"
  ON public.nda_versions FOR SELECT
  TO anon, authenticated
  USING (is_current = true);
CREATE POLICY "Admins manage NDA versions"
  ON public.nda_versions FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- =============================================
-- RLS Policies — investor data, no public access
-- (service role bypasses RLS, so Edge Functions write freely)
-- =============================================

CREATE POLICY "Admins read investor sessions"
  ON public.investor_sessions FOR SELECT
  TO authenticated
  USING (public.is_admin());
CREATE POLICY "Admins update investor sessions"
  ON public.investor_sessions FOR UPDATE
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());
CREATE POLICY "Admins delete investor sessions"
  ON public.investor_sessions FOR DELETE
  TO authenticated
  USING (public.is_admin());

CREATE POLICY "Admins read investor events"
  ON public.investor_events FOR SELECT
  TO authenticated
  USING (public.is_admin());
CREATE POLICY "Admins update investor events"
  ON public.investor_events FOR UPDATE
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());
CREATE POLICY "Admins delete investor events"
  ON public.investor_events FOR DELETE
  TO authenticated
  USING (public.is_admin());

CREATE POLICY "Admins read NDA acceptances"
  ON public.nda_acceptances FOR SELECT
  TO authenticated
  USING (public.is_admin());
CREATE POLICY "Admins update NDA acceptances"
  ON public.nda_acceptances FOR UPDATE
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());
CREATE POLICY "Admins delete NDA acceptances"
  ON public.nda_acceptances FOR DELETE
  TO authenticated
  USING (public.is_admin());

CREATE POLICY "Admins read investor pledges"
  ON public.investor_pledges FOR SELECT
  TO authenticated
  USING (public.is_admin());
CREATE POLICY "Admins update investor pledges"
  ON public.investor_pledges FOR UPDATE
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());
CREATE POLICY "Admins delete investor pledges"
  ON public.investor_pledges FOR DELETE
  TO authenticated
  USING (public.is_admin());

-- =============================================
-- Seed Data
-- =============================================

INSERT INTO public.nda_versions (version, is_current, body_md) VALUES (
  1,
  true,
  '# Mutual Non-Disclosure Agreement

By accessing this investor portal, you agree to treat all information herein as confidential. You will not disclose, share, or reproduce any content from this portal — including financial projections, customer identities, traction metrics, team information, or strategic plans — to any third party without prior written consent from Navio Solutions AS.

This obligation applies for a period of three (3) years from the date of acceptance.

If you have any questions, contact tom@naviosolutions.com.'
);

INSERT INTO public.portal_round_terms (
  round_size_min_nok, round_size_max_nok,
  valuation_min_nok, valuation_max_nok,
  target_close_date, total_raised_to_date_nok,
  round_label, use_of_funds
) VALUES (
  10000000, 20000000,
  80000000, 150000000,
  '2026-06-30', 22000000,
  'Series A',
  '[
    {"label": "Runway and key hires", "pct": 70, "color": "primary"},
    {"label": "Commercial expansion (DACH/UK)", "pct": 20, "color": "secondary"},
    {"label": "Product depth (Shine vertical, Navio admin AI)", "pct": 10, "color": "accent"}
  ]'::jsonb
);

INSERT INTO public.portal_slides (slide_number, slug, visual_type, display_order, is_published) VALUES
  (1,  'cover',                  'cover',              1,  false),
  (2,  'foot-in-door',           'logos',              2,  false),
  (3,  'product-one-liner',      'custom',             3,  false),
  (4,  'two-legs',               'custom',             4,  false),
  (5,  'why-now',                'custom',             5,  false),
  (6,  'digital-gap',            'gap',                6,  false),
  (7,  'badge-taxonomy',         'badges',             7,  false),
  (8,  'value-engine',           'badges',             8,  false),
  (9,  'vertical-replicability', 'verticals',          9,  false),
  (10, 'funnel',                 'funnel',             10, false),
  (11, 'adoption-curve',         'adoption',           11, false),
  (12, 'customer-carglass',      'customer-spotlight', 12, false),
  (13, 'customer-tronderdekk',   'customer-spotlight', 13, false),
  (14, 'financials-glide',       'glide',              14, false),
  (15, 'europe-replication',     'custom',             15, false),
  (16, 'the-ask',                'round',              16, false);

INSERT INTO public.portal_customers (slug, name, status, funnel_stage, is_published, display_order) VALUES
  ('carglass',    'Carglass',     'live',      'expanding', false, 1),
  ('tronderdekk', 'Trønderdekk',  'pilot',     'pilot',     false, 2),
  ('best-drive',  'Best-Drive',   'pre-pilot', 'pre-pilot', false, 3),
  ('snapdrive',   'Snapdrive',    'prospect',  'qualified', false, 4),
  ('dekkfix',     'Dekkfix',      'live',      'signed',    false, 5),
  ('shine',       'Shine',        'pre-pilot', 'qualified', false, 6);
