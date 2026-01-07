-- Create newsletter_subscribers table
CREATE TABLE public.newsletter_subscribers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  subscribed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  confirmed BOOLEAN DEFAULT false,
  unsubscribed_at TIMESTAMPTZ,
  source TEXT DEFAULT 'blog',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.newsletter_subscribers ENABLE ROW LEVEL SECURITY;

-- Anyone can subscribe
CREATE POLICY "Anyone can subscribe" 
  ON public.newsletter_subscribers FOR INSERT 
  WITH CHECK (true);

-- Admins can view subscribers
CREATE POLICY "Admins can view subscribers" 
  ON public.newsletter_subscribers FOR SELECT 
  USING (is_admin());

-- Admins can manage subscribers
CREATE POLICY "Admins can manage subscribers" 
  ON public.newsletter_subscribers FOR ALL 
  USING (is_admin())
  WITH CHECK (is_admin());

-- Create job_listings table
CREATE TABLE public.job_listings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  department TEXT,
  location TEXT,
  employment_type TEXT,
  description TEXT,
  requirements TEXT,
  benefits TEXT,
  salary_range TEXT,
  application_url TEXT,
  application_email TEXT,
  active BOOLEAN DEFAULT true,
  featured BOOLEAN DEFAULT false,
  sort_order INTEGER DEFAULT 0,
  posted_at TIMESTAMPTZ DEFAULT now(),
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.job_listings ENABLE ROW LEVEL SECURITY;

-- Public can view active jobs
CREATE POLICY "Public can view active jobs" 
  ON public.job_listings FOR SELECT 
  USING (active = true AND (expires_at IS NULL OR expires_at > now()));

-- Admins can manage jobs
CREATE POLICY "Admins can manage jobs" 
  ON public.job_listings FOR ALL 
  USING (is_admin())
  WITH CHECK (is_admin());

-- Add updated_at trigger for job_listings
CREATE TRIGGER update_job_listings_updated_at
  BEFORE UPDATE ON public.job_listings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert translation keys for newsletter
INSERT INTO public.translations (translation_key, language_code, translated_text, page_location, context) VALUES
('newsletter.title', 'en', 'Stay Updated', 'blog', 'Newsletter signup section title'),
('newsletter.description', 'en', 'Subscribe to our newsletter for the latest insights and updates.', 'blog', 'Newsletter signup description'),
('newsletter.placeholder', 'en', 'Enter your email', 'blog', 'Email input placeholder'),
('newsletter.button', 'en', 'Subscribe', 'blog', 'Subscribe button text'),
('newsletter.success', 'en', 'Thanks for subscribing!', 'blog', 'Success message'),
('newsletter.error', 'en', 'Something went wrong. Please try again.', 'blog', 'Error message'),
('newsletter.already_subscribed', 'en', 'You are already subscribed!', 'blog', 'Already subscribed message');

-- Insert translation keys for jobs
INSERT INTO public.translations (translation_key, language_code, translated_text, page_location, context) VALUES
('careers.jobs.title', 'en', 'Open Positions', 'careers', 'Job listings section title'),
('careers.jobs.apply', 'en', 'Apply Now', 'careers', 'Apply button text'),
('careers.jobs.department', 'en', 'Department', 'careers', 'Department label'),
('careers.jobs.location', 'en', 'Location', 'careers', 'Location label'),
('careers.jobs.type', 'en', 'Employment Type', 'careers', 'Employment type label'),
('careers.jobs.empty', 'en', 'No open positions at the moment. Check back soon!', 'careers', 'Empty state message'),
('careers.jobs.view_details', 'en', 'View Details', 'careers', 'View job details link');