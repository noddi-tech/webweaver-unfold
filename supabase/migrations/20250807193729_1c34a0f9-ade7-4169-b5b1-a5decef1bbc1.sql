-- Create a table for video sections to manage available sections in the CMS
CREATE TABLE IF NOT EXISTS public.video_sections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.video_sections ENABLE ROW LEVEL SECURITY;

-- Policies: anyone can read sections; only authenticated users can manage
DROP POLICY IF EXISTS "Sections are viewable by everyone" ON public.video_sections;
CREATE POLICY "Sections are viewable by everyone"
ON public.video_sections FOR SELECT
USING (true);

DROP POLICY IF EXISTS "Sections can be managed by authenticated users" ON public.video_sections;
CREATE POLICY "Sections can be managed by authenticated users"
ON public.video_sections FOR ALL
USING (auth.uid() IS NOT NULL)
WITH CHECK (auth.uid() IS NOT NULL);

-- Timestamp update trigger
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public';

DROP TRIGGER IF EXISTS trg_update_video_sections_updated_at ON public.video_sections;
CREATE TRIGGER trg_update_video_sections_updated_at
BEFORE UPDATE ON public.video_sections
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Seed a default section if it doesn't exist
INSERT INTO public.video_sections (name, sort_order)
SELECT 'General', 0
WHERE NOT EXISTS (SELECT 1 FROM public.video_sections WHERE name = 'General');

-- Add a thumbnail shape field to videos to control preview style
ALTER TABLE public.videos
ADD COLUMN IF NOT EXISTS thumbnail_shape TEXT NOT NULL DEFAULT 'rectangle';
