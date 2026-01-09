-- =============================================
-- Part 1: Interview Slots for Self-Booking
-- =============================================

CREATE TABLE public.interview_slots (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  job_id UUID REFERENCES public.job_listings(id) ON DELETE SET NULL,
  interviewer_id UUID,
  interviewer_name TEXT NOT NULL,
  interviewer_email TEXT,
  interview_type TEXT NOT NULL DEFAULT 'phone_screen',
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  duration_minutes INTEGER NOT NULL DEFAULT 30,
  is_available BOOLEAN NOT NULL DEFAULT true,
  booked_by_application_id UUID REFERENCES public.job_applications(id) ON DELETE SET NULL,
  booking_token TEXT UNIQUE,
  booking_token_expires_at TIMESTAMPTZ,
  location TEXT,
  meeting_url TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.interview_slots ENABLE ROW LEVEL SECURITY;

-- Policies for interview_slots
CREATE POLICY "Anyone can view available slots with valid token"
  ON public.interview_slots FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can manage slots"
  ON public.interview_slots FOR ALL
  USING (true)
  WITH CHECK (true);

-- Index for efficient availability queries
CREATE INDEX idx_interview_slots_available 
  ON public.interview_slots(start_time, is_available) 
  WHERE is_available = true;

CREATE INDEX idx_interview_slots_token 
  ON public.interview_slots(booking_token) 
  WHERE booking_token IS NOT NULL;

-- =============================================
-- Part 2: Referral Tracking System
-- =============================================

-- Add source tracking columns to job_applications
ALTER TABLE public.job_applications 
ADD COLUMN IF NOT EXISTS source TEXT DEFAULT 'direct',
ADD COLUMN IF NOT EXISTS source_detail TEXT,
ADD COLUMN IF NOT EXISTS referrer_email TEXT,
ADD COLUMN IF NOT EXISTS utm_source TEXT,
ADD COLUMN IF NOT EXISTS utm_medium TEXT,
ADD COLUMN IF NOT EXISTS utm_campaign TEXT;

-- Create referral_sources table
CREATE TABLE public.referral_sources (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  category TEXT NOT NULL,
  tracking_code TEXT UNIQUE,
  icon_name TEXT DEFAULT 'Link',
  active BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.referral_sources ENABLE ROW LEVEL SECURITY;

-- Policies for referral_sources
CREATE POLICY "Anyone can view active referral sources"
  ON public.referral_sources FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can manage referral sources"
  ON public.referral_sources FOR ALL
  USING (true)
  WITH CHECK (true);

-- Seed with common sources
INSERT INTO public.referral_sources (name, category, tracking_code, icon_name, sort_order) VALUES
  ('LinkedIn', 'job_board', 'linkedin', 'Linkedin', 1),
  ('Indeed', 'job_board', 'indeed', 'Briefcase', 2),
  ('Glassdoor', 'job_board', 'glassdoor', 'Building', 3),
  ('Company Website', 'organic', 'website', 'Globe', 4),
  ('Employee Referral', 'referral', 'referral', 'Users', 5),
  ('Twitter/X', 'social', 'twitter', 'Twitter', 6),
  ('Facebook', 'social', 'facebook', 'Facebook', 7),
  ('Google Ads', 'paid', 'google_ads', 'Search', 8),
  ('Direct Application', 'organic', 'direct', 'FileText', 9),
  ('Other', 'other', 'other', 'MoreHorizontal', 10);

-- =============================================
-- Part 3: Triggers for updated_at
-- =============================================

CREATE TRIGGER update_interview_slots_updated_at
  BEFORE UPDATE ON public.interview_slots
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_referral_sources_updated_at
  BEFORE UPDATE ON public.referral_sources
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();