
-- Create legal_documents table
CREATE TABLE public.legal_documents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  document_type TEXT NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL DEFAULT '',
  version_label TEXT,
  effective_date DATE,
  last_updated TIMESTAMPTZ NOT NULL DEFAULT now(),
  published BOOLEAN NOT NULL DEFAULT false,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.legal_documents ENABLE ROW LEVEL SECURITY;

-- Public can read published documents
CREATE POLICY "Anyone can view published legal documents"
ON public.legal_documents FOR SELECT
USING (published = true);

-- Admins can do everything
CREATE POLICY "Admins can manage legal documents"
ON public.legal_documents FOR ALL
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- Auto-update timestamp
CREATE TRIGGER update_legal_documents_updated_at
BEFORE UPDATE ON public.legal_documents
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Seed initial documents
INSERT INTO public.legal_documents (document_type, title, content, published, version_label, effective_date, last_updated) VALUES
  ('privacy_policy', 'Privacy Policy', '', true, 'v1.0', CURRENT_DATE, now()),
  ('terms_of_service', 'Terms of Service', '', true, 'v1.0', CURRENT_DATE, now()),
  ('cookie_policy', 'Cookie Policy', '', true, 'v1.0', CURRENT_DATE, now()),
  ('data_processor_agreement', 'Data Processor Agreement (DPA)', '', true, 'v1.0', CURRENT_DATE, now());
