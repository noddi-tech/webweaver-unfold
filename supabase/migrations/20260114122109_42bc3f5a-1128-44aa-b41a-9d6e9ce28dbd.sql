-- Create slack_settings table for configurable notifications
CREATE TABLE public.slack_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category TEXT NOT NULL UNIQUE,
  webhook_url TEXT,
  enabled BOOLEAN DEFAULT true,
  channel_name TEXT,
  notification_types JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.slack_settings ENABLE ROW LEVEL SECURITY;

-- Admin-only policies
CREATE POLICY "Admins can view slack settings" ON public.slack_settings
  FOR SELECT USING (public.is_admin());

CREATE POLICY "Admins can insert slack settings" ON public.slack_settings
  FOR INSERT WITH CHECK (public.is_admin());

CREATE POLICY "Admins can update slack settings" ON public.slack_settings
  FOR UPDATE USING (public.is_admin());

CREATE POLICY "Admins can delete slack settings" ON public.slack_settings
  FOR DELETE USING (public.is_admin());

-- Service role policy for edge functions
CREATE POLICY "Service role can read slack settings" ON public.slack_settings
  FOR SELECT USING (auth.role() = 'service_role');

-- Insert default categories
INSERT INTO public.slack_settings (category, notification_types, channel_name) VALUES
  ('sales', '["offer_sent", "offer_viewed", "offer_accepted", "offer_question"]'::jsonb, '#sales-notifications'),
  ('careers', '["application_received", "application_status_changed"]'::jsonb, '#careers-notifications'),
  ('general', '["contact_form", "email_bounced"]'::jsonb, '#general-notifications');

-- Add updated_at trigger
CREATE TRIGGER update_slack_settings_updated_at
  BEFORE UPDATE ON public.slack_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();