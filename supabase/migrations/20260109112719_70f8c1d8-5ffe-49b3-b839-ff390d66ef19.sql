-- Create email_templates table for CMS-customizable email notifications
CREATE TABLE public.email_templates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  template_key TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  subject TEXT NOT NULL,
  heading TEXT NOT NULL,
  body_html TEXT NOT NULL,
  button_text TEXT,
  button_url TEXT,
  emoji TEXT DEFAULT '📧',
  header_bg_start TEXT DEFAULT '#667eea',
  header_bg_end TEXT DEFAULT '#764ba2',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.email_templates ENABLE ROW LEVEL SECURITY;

-- Public read access (templates are not sensitive)
CREATE POLICY "Email templates are publicly readable"
ON public.email_templates FOR SELECT
USING (true);

-- Only admins can modify templates
CREATE POLICY "Only admins can insert email templates"
ON public.email_templates FOR INSERT
WITH CHECK (public.is_admin());

CREATE POLICY "Only admins can update email templates"
ON public.email_templates FOR UPDATE
USING (public.is_admin());

CREATE POLICY "Only admins can delete email templates"
ON public.email_templates FOR DELETE
USING (public.is_admin());

-- Add updated_at trigger
CREATE TRIGGER update_email_templates_updated_at
BEFORE UPDATE ON public.email_templates
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Seed default templates
INSERT INTO public.email_templates (template_key, name, description, subject, heading, body_html, button_text, button_url, emoji, header_bg_start, header_bg_end) VALUES
(
  'application_confirmation',
  'Application Received',
  'Sent immediately when a candidate submits an application',
  'Application Received - {{job_title}} at Navio',
  '🎉 Application Received!',
  '<p>Hi <strong>{{applicant_name}}</strong>,</p>
<p>Thank you for applying to <strong>{{job_title}}</strong> at Navio. We''ve received your application and our team will review it shortly.</p>
<h3>What happens next?</h3>
<ol>
<li>Our team reviews your application</li>
<li>If there''s a match, we''ll reach out for an interview</li>
<li>You''ll receive email updates on your status</li>
</ol>
<p>Best regards,<br><strong>The Navio Team</strong></p>',
  'View My Applications →',
  '{{site_url}}/en/my-applications',
  '🎉',
  '#667eea',
  '#764ba2'
),
(
  'status_under_review',
  'Under Review',
  'Sent when application status changes to under_review',
  'Application Update - {{job_title}} at Navio',
  '👀 Your Application is Under Review',
  '<p>Hi <strong>{{applicant_name}}</strong>,</p>
<p>Great news! Your application for <strong>{{job_title}}</strong> is now being reviewed by our hiring team.</p>
<p>We''ll be in touch soon with next steps. In the meantime, feel free to check your application status anytime.</p>
<p>Best regards,<br><strong>The Navio Team</strong></p>',
  'Check Application Status →',
  '{{site_url}}/en/my-applications',
  '👀',
  '#3b82f6',
  '#1d4ed8'
),
(
  'status_interview_scheduled',
  'Interview Scheduled',
  'Sent when application status changes to interview_scheduled',
  'Interview Invitation - {{job_title}} at Navio',
  '📅 Interview Scheduled!',
  '<p>Hi <strong>{{applicant_name}}</strong>,</p>
<p>Congratulations! We''d love to meet you and learn more about your experience.</p>
<p>You''ve been selected for an interview for the <strong>{{job_title}}</strong> position. We''ll reach out with specific timing details shortly.</p>
<p>Best regards,<br><strong>The Navio Team</strong></p>',
  'View Application Details →',
  '{{site_url}}/en/my-applications',
  '📅',
  '#10b981',
  '#059669'
),
(
  'status_interview_completed',
  'Interview Completed',
  'Sent when application status changes to interview_completed',
  'Thank You for Interviewing - {{job_title}} at Navio',
  '✅ Interview Completed',
  '<p>Hi <strong>{{applicant_name}}</strong>,</p>
<p>Thank you for taking the time to interview with us for the <strong>{{job_title}}</strong> position.</p>
<p>We enjoyed learning more about your background and experience. Our team is currently reviewing all candidates and will be in touch soon with next steps.</p>
<p>Best regards,<br><strong>The Navio Team</strong></p>',
  'View Application Status →',
  '{{site_url}}/en/my-applications',
  '✅',
  '#8b5cf6',
  '#7c3aed'
),
(
  'status_offer_extended',
  'Offer Extended',
  'Sent when application status changes to offer_extended',
  'Congratulations! Job Offer - {{job_title}} at Navio',
  '🎊 Congratulations!',
  '<p>Hi <strong>{{applicant_name}}</strong>,</p>
<p>We''re thrilled to extend you an offer for the <strong>{{job_title}}</strong> position at Navio!</p>
<p>We were impressed by your skills and experience, and we believe you''ll be a great addition to our team. We''ll be sending the official offer details shortly.</p>
<p>Welcome to the team!</p>
<p>Best regards,<br><strong>The Navio Team</strong></p>',
  'View Offer Details →',
  '{{site_url}}/en/my-applications',
  '🎊',
  '#f59e0b',
  '#d97706'
),
(
  'status_hired',
  'Welcome Aboard',
  'Sent when application status changes to hired',
  'Welcome to Navio! - {{job_title}}',
  '🚀 Welcome to the Team!',
  '<p>Hi <strong>{{applicant_name}}</strong>,</p>
<p>We''re absolutely delighted to officially welcome you to Navio as our new <strong>{{job_title}}</strong>!</p>
<p>We''ll be in touch with onboarding details and next steps. Get ready for an exciting journey ahead!</p>
<p>See you soon!</p>
<p>Best regards,<br><strong>The Navio Team</strong></p>',
  'Get Started →',
  '{{site_url}}/en/my-applications',
  '🚀',
  '#22c55e',
  '#16a34a'
),
(
  'status_rejected',
  'Application Update',
  'Sent when application status changes to rejected',
  'Application Update - {{job_title}} at Navio',
  'Thank You for Your Interest',
  '<p>Hi <strong>{{applicant_name}}</strong>,</p>
<p>Thank you for your interest in the <strong>{{job_title}}</strong> position at Navio and for taking the time to apply.</p>
<p>After careful consideration, we''ve decided to move forward with other candidates whose experience more closely matches our current needs.</p>
<p>We encourage you to apply for future opportunities that match your skills. We''ll keep your information on file.</p>
<p>We wish you the best in your job search!</p>
<p>Best regards,<br><strong>The Navio Team</strong></p>',
  'View Other Opportunities →',
  '{{site_url}}/en/careers',
  '💼',
  '#6b7280',
  '#4b5563'
),
(
  'status_withdrawn',
  'Application Withdrawn',
  'Sent when application is withdrawn by the candidate',
  'Application Withdrawn - {{job_title}} at Navio',
  'Application Withdrawn',
  '<p>Hi <strong>{{applicant_name}}</strong>,</p>
<p>Your application for <strong>{{job_title}}</strong> has been withdrawn as requested.</p>
<p>If you change your mind or see other opportunities that interest you, we''d love to hear from you again.</p>
<p>Best of luck in your career journey!</p>
<p>Best regards,<br><strong>The Navio Team</strong></p>',
  'View Open Positions →',
  '{{site_url}}/en/careers',
  '👋',
  '#6b7280',
  '#4b5563'
);