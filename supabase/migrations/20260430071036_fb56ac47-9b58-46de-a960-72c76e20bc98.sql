ALTER TABLE public.portal_slide_drafts
ADD COLUMN IF NOT EXISTS prompt_context jsonb;