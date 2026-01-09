-- Track interview feedback reminders
CREATE TABLE interview_reminders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  interview_id UUID REFERENCES interviews(id) ON DELETE CASCADE,
  interviewer_id UUID,
  interviewer_email TEXT NOT NULL,
  interviewer_name TEXT,
  reminder_type TEXT NOT NULL DEFAULT 'post_interview', -- "pre_interview", "post_interview", "evaluation_due"
  scheduled_for TIMESTAMPTZ NOT NULL,
  sent_at TIMESTAMPTZ,
  status TEXT DEFAULT 'pending', -- "pending", "sent", "cancelled"
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Add index for efficient querying of pending reminders
CREATE INDEX idx_interview_reminders_pending ON interview_reminders(scheduled_for) WHERE status = 'pending';
CREATE INDEX idx_interview_reminders_interview ON interview_reminders(interview_id);

-- Enable RLS
ALTER TABLE interview_reminders ENABLE ROW LEVEL SECURITY;

-- RLS policies for interview_reminders
CREATE POLICY "Admins can manage interview reminders"
ON interview_reminders FOR ALL
USING (public.is_admin());

CREATE POLICY "Anyone can view interview reminders"
ON interview_reminders FOR SELECT
USING (true);

-- Add feedback_reminder email template
INSERT INTO email_templates (
  template_key,
  name,
  description,
  subject,
  heading,
  body_html,
  button_text,
  button_url,
  emoji,
  header_bg_start,
  header_bg_end,
  is_active
) VALUES (
  'feedback_reminder',
  'Interview Feedback Reminder',
  'Reminder sent to interviewers to submit their evaluation after an interview',
  'Reminder: Submit your feedback for {{candidate_name}}',
  'Interview Feedback Needed',
  '<p>Hi {{interviewer_name}},</p>
<p>This is a friendly reminder to submit your feedback for the interview with <strong>{{candidate_name}}</strong> for the <strong>{{job_title}}</strong> position.</p>
<p><strong>Interview Details:</strong></p>
<ul>
<li>Date: {{interview_date}}</li>
<li>Type: {{interview_type}}</li>
</ul>
<p>Your evaluation helps us make informed hiring decisions. Please take a few minutes to submit your feedback.</p>
<p>Thank you for your time!</p>',
  'Submit Evaluation',
  '{{evaluation_url}}',
  '📝',
  '#6366f1',
  '#8b5cf6',
  true
);