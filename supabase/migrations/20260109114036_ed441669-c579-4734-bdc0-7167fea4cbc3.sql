-- Create application_messages table for inbox functionality
CREATE TABLE public.application_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  application_id UUID NOT NULL REFERENCES public.job_applications(id) ON DELETE CASCADE,
  sender_type TEXT NOT NULL CHECK (sender_type IN ('admin', 'candidate')),
  sender_name TEXT NOT NULL,
  sender_email TEXT NOT NULL,
  subject TEXT,
  body TEXT NOT NULL,
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX idx_application_messages_application_id ON public.application_messages(application_id);
CREATE INDEX idx_application_messages_created_at ON public.application_messages(created_at DESC);
CREATE INDEX idx_application_messages_is_read ON public.application_messages(is_read) WHERE is_read = false;

-- Enable RLS
ALTER TABLE public.application_messages ENABLE ROW LEVEL SECURITY;

-- Admins can do everything
CREATE POLICY "Admins can manage all messages"
ON public.application_messages
FOR ALL
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- Candidates can read messages for their own applications
CREATE POLICY "Candidates can read own messages"
ON public.application_messages
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.job_applications ja
    WHERE ja.id = application_id
    AND ja.user_id = auth.uid()
  )
);

-- Candidates can send messages on their own applications
CREATE POLICY "Candidates can send messages"
ON public.application_messages
FOR INSERT
WITH CHECK (
  sender_type = 'candidate' AND
  EXISTS (
    SELECT 1 FROM public.job_applications ja
    WHERE ja.id = application_id
    AND ja.user_id = auth.uid()
  )
);

-- Add admin reply email template
INSERT INTO public.email_templates (template_key, name, description, subject, heading, body_html, button_text, button_url, emoji, header_bg_start, header_bg_end)
VALUES (
  'admin_reply',
  'Admin Reply to Candidate',
  'Sent when an admin sends a message to a candidate',
  'Re: Your Application for {{job_title}} at Navio',
  'Message from Navio',
  '<p>Hi {{applicant_name}},</p><p>You have received a new message regarding your application for <strong>{{job_title}}</strong>:</p><hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;" /><p style="white-space: pre-wrap;">{{message_body}}</p><hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;" /><p>You can reply to this email or view your application status online.</p>',
  'View My Applications',
  '{{site_url}}/en/my-applications',
  '💬',
  '#3b82f6',
  '#1d4ed8'
);