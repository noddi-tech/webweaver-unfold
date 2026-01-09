-- Saved jobs for candidates (requires authentication)
CREATE TABLE public.saved_jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  job_id uuid NOT NULL REFERENCES public.job_listings(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, job_id)
);

-- Job applications tracking
CREATE TABLE public.job_applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  job_id uuid NOT NULL REFERENCES public.job_listings(id) ON DELETE CASCADE,
  
  -- Applicant info (stored in case user deletes account)
  applicant_name text NOT NULL,
  applicant_email text NOT NULL,
  applicant_phone text,
  linkedin_url text,
  portfolio_url text,
  resume_url text,
  cover_letter text,
  
  -- Status tracking
  status text DEFAULT 'submitted' CHECK (status IN (
    'submitted', 'under_review', 'interview_scheduled', 
    'interview_completed', 'offer_extended', 'hired', 'rejected', 'withdrawn'
  )),
  status_updated_at timestamptz DEFAULT now(),
  
  -- Admin notes (not visible to candidate)
  internal_notes text,
  
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX idx_saved_jobs_user_id ON public.saved_jobs(user_id);
CREATE INDEX idx_saved_jobs_job_id ON public.saved_jobs(job_id);
CREATE INDEX idx_job_applications_user_id ON public.job_applications(user_id);
CREATE INDEX idx_job_applications_job_id ON public.job_applications(job_id);
CREATE INDEX idx_job_applications_status ON public.job_applications(status);

-- Enable RLS
ALTER TABLE public.saved_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_applications ENABLE ROW LEVEL SECURITY;

-- Saved jobs policies
CREATE POLICY "Users can view own saved jobs" ON public.saved_jobs
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can save jobs" ON public.saved_jobs
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unsave jobs" ON public.saved_jobs
  FOR DELETE USING (auth.uid() = user_id);

-- Job applications policies
CREATE POLICY "Users can view own applications" ON public.job_applications
  FOR SELECT USING (
    auth.uid() = user_id OR 
    EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Anyone can apply to jobs" ON public.job_applications
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update own applications" ON public.job_applications
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Admins can update all applications" ON public.job_applications
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')
  );

-- Add trigger for updated_at on job_applications
CREATE TRIGGER update_job_applications_updated_at
  BEFORE UPDATE ON public.job_applications
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();