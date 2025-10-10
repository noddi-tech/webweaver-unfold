-- Create page_meta_translations table for multilingual SEO
CREATE TABLE public.page_meta_translations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  page_slug TEXT NOT NULL,
  language_code TEXT NOT NULL,
  meta_title TEXT NOT NULL,
  meta_description TEXT,
  meta_keywords TEXT,
  og_title TEXT,
  og_description TEXT,
  og_image_url TEXT,
  twitter_title TEXT,
  twitter_description TEXT,
  twitter_image_url TEXT,
  canonical_url TEXT,
  quality_score INTEGER CHECK (quality_score >= 0 AND quality_score <= 100),
  review_status TEXT DEFAULT 'pending' CHECK (review_status IN ('pending', 'approved', 'needs_review', 'rejected')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(page_slug, language_code)
);

-- Enable RLS
ALTER TABLE public.page_meta_translations ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Page meta translations are viewable by everyone"
ON public.page_meta_translations
FOR SELECT
USING (true);

CREATE POLICY "Page meta translations can be managed by authenticated users"
ON public.page_meta_translations
FOR ALL
USING (auth.uid() IS NOT NULL)
WITH CHECK (auth.uid() IS NOT NULL);

-- Create indexes for performance
CREATE INDEX idx_page_meta_page_lang ON public.page_meta_translations(page_slug, language_code);
CREATE INDEX idx_page_meta_quality ON public.page_meta_translations(quality_score);
CREATE INDEX idx_page_meta_review_status ON public.page_meta_translations(review_status);

-- Add trigger for updated_at
CREATE TRIGGER update_page_meta_translations_updated_at
BEFORE UPDATE ON public.page_meta_translations
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Seed with default English meta for homepage
INSERT INTO public.page_meta_translations (page_slug, language_code, meta_title, meta_description, canonical_url, review_status)
VALUES 
  ('/', 'en', 'Noddi Tech - Modern Automotive Service Platform', 'Transform your automotive service business with intelligent booking, NPS tracking, and whitelabel solutions.', 'https://noddi.tech/', 'approved'),
  ('/pricing', 'en', 'Pricing - Noddi Tech', 'Transparent pricing for modern automotive service technology. No hidden costs.', 'https://noddi.tech/pricing', 'approved'),
  ('/features', 'en', 'Features - Noddi Tech', 'Discover powerful features built for automotive service providers.', 'https://noddi.tech/features', 'approved'),
  ('/contact', 'en', 'Contact Us - Noddi Tech', 'Get in touch with our team. We are here to help transform your business.', 'https://noddi.tech/contact', 'approved');