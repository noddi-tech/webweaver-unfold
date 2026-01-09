-- Application activity log for timeline tracking
CREATE TABLE public.application_activity_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id uuid NOT NULL REFERENCES job_applications(id) ON DELETE CASCADE,
  action text NOT NULL, -- 'submitted', 'status_changed', 'note_added', 'email_sent'
  old_value text,
  new_value text,
  actor_id uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.application_activity_log ENABLE ROW LEVEL SECURITY;

-- Admins can view all activity
CREATE POLICY "Admins can view activity" ON public.application_activity_log
  FOR SELECT USING (is_admin());

-- Allow inserting activity (for triggers and edge functions)
CREATE POLICY "Allow insert activity" ON public.application_activity_log
  FOR INSERT WITH CHECK (true);

-- Create index for faster lookups
CREATE INDEX idx_activity_log_application_id ON public.application_activity_log(application_id);
CREATE INDEX idx_activity_log_created_at ON public.application_activity_log(created_at DESC);