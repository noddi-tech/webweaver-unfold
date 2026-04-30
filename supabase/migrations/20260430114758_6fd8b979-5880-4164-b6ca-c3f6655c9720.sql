ALTER TABLE public.portal_slide_drafts
  ADD COLUMN IF NOT EXISTS parent_draft_id uuid REFERENCES public.portal_slide_drafts(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS refinement_instruction text,
  ADD COLUMN IF NOT EXISTS draft_kind text NOT NULL DEFAULT 'initial'
    CHECK (draft_kind IN ('initial','refinement','manual_edit'));

CREATE INDEX IF NOT EXISTS portal_slide_drafts_parent_draft_id_idx
  ON public.portal_slide_drafts(parent_draft_id);