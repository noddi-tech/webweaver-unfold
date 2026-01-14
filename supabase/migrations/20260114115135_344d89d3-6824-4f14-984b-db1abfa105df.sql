-- Create email_logs table for tracking all sent emails
CREATE TABLE public.email_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email_type TEXT NOT NULL,
  related_id UUID,
  to_email TEXT NOT NULL,
  to_name TEXT,
  from_address TEXT NOT NULL,
  subject TEXT NOT NULL,
  resend_id TEXT,
  status TEXT DEFAULT 'sent',
  sent_at TIMESTAMPTZ DEFAULT now(),
  delivered_at TIMESTAMPTZ,
  opened_at TIMESTAMPTZ,
  clicked_at TIMESTAMPTZ,
  bounced_at TIMESTAMPTZ,
  error_message TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Add indexes for common queries
CREATE INDEX idx_email_logs_email_type ON public.email_logs(email_type);
CREATE INDEX idx_email_logs_status ON public.email_logs(status);
CREATE INDEX idx_email_logs_resend_id ON public.email_logs(resend_id);
CREATE INDEX idx_email_logs_sent_at ON public.email_logs(sent_at DESC);
CREATE INDEX idx_email_logs_related_id ON public.email_logs(related_id);

-- Enable RLS
ALTER TABLE public.email_logs ENABLE ROW LEVEL SECURITY;

-- Admin-only access policy
CREATE POLICY "Admins can view email logs" ON public.email_logs
  FOR SELECT USING (public.is_admin());

CREATE POLICY "Admins can insert email logs" ON public.email_logs
  FOR INSERT WITH CHECK (public.is_admin());

CREATE POLICY "Admins can update email logs" ON public.email_logs
  FOR UPDATE USING (public.is_admin());

-- Service role can do everything (for edge functions)
CREATE POLICY "Service role full access" ON public.email_logs
  FOR ALL USING (auth.role() = 'service_role');

-- Add question and acceptance tracking to pricing_offers
ALTER TABLE public.pricing_offers 
  ADD COLUMN IF NOT EXISTS last_question_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS accepted_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS resend_id TEXT;

-- Trigger for updated_at
CREATE TRIGGER update_email_logs_updated_at
  BEFORE UPDATE ON public.email_logs
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();