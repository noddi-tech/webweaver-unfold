-- ============================================================
-- CANDIDATE SCORING & EVALUATION SYSTEM
-- ============================================================

-- Evaluation criteria templates (customizable scoring dimensions)
CREATE TABLE public.evaluation_criteria (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  max_score INTEGER DEFAULT 5,
  weight NUMERIC DEFAULT 1.0,
  category TEXT DEFAULT 'general',
  active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.evaluation_criteria ENABLE ROW LEVEL SECURITY;

-- Policies for evaluation_criteria (admins only)
CREATE POLICY "Admins can manage evaluation criteria"
ON public.evaluation_criteria FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

CREATE POLICY "Authenticated users can view active criteria"
ON public.evaluation_criteria FOR SELECT
USING (active = true AND auth.uid() IS NOT NULL);

-- Individual evaluations by team members
CREATE TABLE public.candidate_evaluations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  application_id UUID NOT NULL REFERENCES public.job_applications(id) ON DELETE CASCADE,
  evaluator_id UUID REFERENCES auth.users(id),
  evaluator_name TEXT NOT NULL,
  overall_recommendation TEXT CHECK (overall_recommendation IN ('strong_hire', 'hire', 'maybe', 'no_hire', 'strong_no_hire')),
  notes TEXT,
  strengths TEXT,
  concerns TEXT,
  submitted_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(application_id, evaluator_id)
);

-- Enable RLS
ALTER TABLE public.candidate_evaluations ENABLE ROW LEVEL SECURITY;

-- Policies for candidate_evaluations
CREATE POLICY "Admins can manage all evaluations"
ON public.candidate_evaluations FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

CREATE POLICY "Evaluators can view own evaluations"
ON public.candidate_evaluations FOR SELECT
USING (evaluator_id = auth.uid());

CREATE POLICY "Evaluators can create own evaluations"
ON public.candidate_evaluations FOR INSERT
WITH CHECK (evaluator_id = auth.uid());

CREATE POLICY "Evaluators can update own evaluations"
ON public.candidate_evaluations FOR UPDATE
USING (evaluator_id = auth.uid());

-- Individual scores for each criterion
CREATE TABLE public.evaluation_scores (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  evaluation_id UUID NOT NULL REFERENCES public.candidate_evaluations(id) ON DELETE CASCADE,
  criteria_id UUID NOT NULL REFERENCES public.evaluation_criteria(id) ON DELETE CASCADE,
  score INTEGER NOT NULL CHECK (score >= 0),
  comment TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.evaluation_scores ENABLE ROW LEVEL SECURITY;

-- Policies for evaluation_scores
CREATE POLICY "Admins can manage all scores"
ON public.evaluation_scores FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

CREATE POLICY "Evaluators can manage own scores"
ON public.evaluation_scores FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.candidate_evaluations ce 
    WHERE ce.id = evaluation_id AND ce.evaluator_id = auth.uid()
  )
);

-- ============================================================
-- INTERVIEW SCHEDULER
-- ============================================================

-- Scheduled interviews
CREATE TABLE public.interviews (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  application_id UUID NOT NULL REFERENCES public.job_applications(id) ON DELETE CASCADE,
  interview_type TEXT NOT NULL DEFAULT 'technical',
  title TEXT NOT NULL,
  description TEXT,
  scheduled_at TIMESTAMPTZ NOT NULL,
  duration_minutes INTEGER DEFAULT 60,
  location TEXT,
  meeting_url TEXT,
  calendar_event_id TEXT,
  interviewer_ids UUID[],
  interviewer_names TEXT[],
  status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'completed', 'cancelled', 'rescheduled', 'no_show')),
  notes TEXT,
  feedback TEXT,
  candidate_notified BOOLEAN DEFAULT false,
  reminder_sent BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.interviews ENABLE ROW LEVEL SECURITY;

-- Policies for interviews
CREATE POLICY "Admins can manage all interviews"
ON public.interviews FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

CREATE POLICY "Interviewers can view their interviews"
ON public.interviews FOR SELECT
USING (auth.uid() = ANY(interviewer_ids));

-- ============================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================

CREATE INDEX idx_evaluations_application ON public.candidate_evaluations(application_id);
CREATE INDEX idx_evaluations_evaluator ON public.candidate_evaluations(evaluator_id);
CREATE INDEX idx_evaluation_scores_evaluation ON public.evaluation_scores(evaluation_id);
CREATE INDEX idx_interviews_application ON public.interviews(application_id);
CREATE INDEX idx_interviews_scheduled_at ON public.interviews(scheduled_at);
CREATE INDEX idx_interviews_status ON public.interviews(status);

-- ============================================================
-- TRIGGERS FOR UPDATED_AT
-- ============================================================

CREATE TRIGGER update_evaluation_criteria_updated_at
BEFORE UPDATE ON public.evaluation_criteria
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_candidate_evaluations_updated_at
BEFORE UPDATE ON public.candidate_evaluations
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_interviews_updated_at
BEFORE UPDATE ON public.interviews
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================================
-- SEED DEFAULT EVALUATION CRITERIA
-- ============================================================

INSERT INTO public.evaluation_criteria (name, description, category, max_score, weight, sort_order) VALUES
('Technical Skills', 'Proficiency in relevant technologies and problem-solving', 'technical', 5, 1.5, 1),
('Communication', 'Written and verbal communication clarity', 'soft_skills', 5, 1.0, 2),
('Problem Solving', 'Approach to challenges and analytical thinking', 'technical', 5, 1.2, 3),
('Cultural Fit', 'Alignment with company values and team dynamics', 'cultural', 5, 1.0, 4),
('Experience', 'Relevant work experience and domain knowledge', 'experience', 5, 1.0, 5),
('Leadership', 'Initiative, ownership, and ability to lead', 'soft_skills', 5, 0.8, 6);

-- ============================================================
-- ADD INTERVIEW INVITATION EMAIL TEMPLATE
-- ============================================================

INSERT INTO public.email_templates (
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
  'interview_invitation',
  'Interview Invitation',
  'Sent when an interview is scheduled with a candidate',
  'Interview Scheduled: {{job_title}} at Navio',
  'You''re Invited to Interview! 🎉',
  '<p>Hi {{applicant_name}},</p>
<p>We''re excited to invite you to an interview for the <strong>{{job_title}}</strong> position at Navio!</p>
<p><strong>Interview Details:</strong></p>
<ul>
<li><strong>Date & Time:</strong> {{interview_date}} at {{interview_time}}</li>
<li><strong>Duration:</strong> {{interview_duration}} minutes</li>
<li><strong>Type:</strong> {{interview_type}}</li>
<li><strong>Location:</strong> {{interview_location}}</li>
</ul>
{{#if meeting_url}}
<p><strong>Meeting Link:</strong> <a href="{{meeting_url}}">{{meeting_url}}</a></p>
{{/if}}
<p>{{interview_notes}}</p>
<p>Please confirm your attendance by clicking the button below. If you need to reschedule, please reply to this email.</p>
<p>We look forward to speaking with you!</p>
<p>Best regards,<br>The Navio Team</p>',
  'Add to Calendar',
  '{{calendar_url}}',
  '📅',
  '#8b5cf6',
  '#6d28d9',
  true
);