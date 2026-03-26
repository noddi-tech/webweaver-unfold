-- =============================================
-- Calendar Booking System Schema
-- =============================================

-- 1. team_members
CREATE TABLE public.team_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text UNIQUE NOT NULL,
  slug text UNIQUE NOT NULL,
  title text,
  avatar_url text,
  timezone text DEFAULT 'Europe/Oslo',
  google_calendar_connected boolean DEFAULT false,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- 2. event_types
CREATE TABLE public.event_types (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text UNIQUE NOT NULL,
  description text,
  duration_minutes integer DEFAULT 30,
  buffer_minutes integer DEFAULT 15,
  color text DEFAULT '#2D1B69',
  is_active boolean DEFAULT true,
  requires_all_members boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- 3. event_type_members
CREATE TABLE public.event_type_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type_id uuid NOT NULL REFERENCES public.event_types(id) ON DELETE CASCADE,
  team_member_id uuid NOT NULL REFERENCES public.team_members(id) ON DELETE CASCADE,
  is_required boolean DEFAULT false,
  UNIQUE (event_type_id, team_member_id)
);

-- 4. availability_rules
CREATE TABLE public.availability_rules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_member_id uuid NOT NULL REFERENCES public.team_members(id) ON DELETE CASCADE,
  day_of_week integer NOT NULL,
  start_time time NOT NULL,
  end_time time NOT NULL,
  UNIQUE (team_member_id, day_of_week)
);

-- 5. bookings
CREATE TABLE public.bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type_id uuid REFERENCES public.event_types(id),
  guest_name text NOT NULL,
  guest_email text NOT NULL,
  guest_company text,
  guest_message text,
  guest_timezone text NOT NULL,
  start_time timestamptz NOT NULL,
  end_time timestamptz NOT NULL,
  status text DEFAULT 'confirmed',
  google_event_id text,
  created_at timestamptz DEFAULT now(),
  cancelled_at timestamptz
);

-- 6. booking_members
CREATE TABLE public.booking_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id uuid NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
  team_member_id uuid NOT NULL REFERENCES public.team_members(id)
);

-- 7. google_oauth_tokens
CREATE TABLE public.google_oauth_tokens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_member_id uuid UNIQUE NOT NULL REFERENCES public.team_members(id) ON DELETE CASCADE,
  access_token_encrypted text NOT NULL,
  refresh_token_encrypted text NOT NULL,
  token_expiry timestamptz NOT NULL,
  updated_at timestamptz DEFAULT now()
);

-- =============================================
-- Enable RLS on all tables
-- =============================================
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_type_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.availability_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.booking_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.google_oauth_tokens ENABLE ROW LEVEL SECURITY;

-- =============================================
-- RLS Policies
-- =============================================

CREATE POLICY "Public can view team members" ON public.team_members FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Admins manage team members" ON public.team_members FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY "Public can view event types" ON public.event_types FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Admins manage event types" ON public.event_types FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY "Public can view event type members" ON public.event_type_members FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Admins manage event type members" ON public.event_type_members FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY "Public can view availability" ON public.availability_rules FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Admins manage availability" ON public.availability_rules FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY "Public can create bookings" ON public.bookings FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Admins manage bookings" ON public.bookings FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY "Public can create booking members" ON public.booking_members FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Admins view booking members" ON public.booking_members FOR SELECT TO authenticated USING (public.is_admin());

CREATE POLICY "Admins manage oauth tokens" ON public.google_oauth_tokens FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- =============================================
-- Seed Data
-- =============================================

INSERT INTO public.team_members (id, name, email, slug, title) VALUES
  ('a1b2c3d4-0001-4000-8000-000000000001', 'Joachim', 'joachim@noddi.tech', 'joachim', 'Co-founder'),
  ('a1b2c3d4-0002-4000-8000-000000000002', 'Tom Arne', 'tomarne@noddi.tech', 'tom-arne', 'Co-founder');

INSERT INTO public.event_types (id, title, slug, description, duration_minutes, buffer_minutes, requires_all_members) VALUES
  ('b1b2c3d4-0001-4000-8000-000000000001', 'Product Demo', 'product-demo', 'See Navio in action with a guided walkthrough.', 30, 15, false),
  ('b1b2c3d4-0002-4000-8000-000000000002', 'Intro Call', 'intro-call', 'A quick intro to learn about your needs.', 15, 10, false);

INSERT INTO public.event_type_members (event_type_id, team_member_id) VALUES
  ('b1b2c3d4-0001-4000-8000-000000000001', 'a1b2c3d4-0001-4000-8000-000000000001'),
  ('b1b2c3d4-0001-4000-8000-000000000001', 'a1b2c3d4-0002-4000-8000-000000000002');

INSERT INTO public.availability_rules (team_member_id, day_of_week, start_time, end_time)
SELECT m.id, d.dow, '09:00'::time, '16:00'::time
FROM public.team_members m
CROSS JOIN (VALUES (0),(1),(2),(3),(4)) AS d(dow)
WHERE m.id IN ('a1b2c3d4-0001-4000-8000-000000000001', 'a1b2c3d4-0002-4000-8000-000000000002');