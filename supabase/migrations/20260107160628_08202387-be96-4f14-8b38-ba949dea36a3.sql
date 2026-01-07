-- Create press_mentions table for newsroom press coverage
CREATE TABLE public.press_mentions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  source_name TEXT NOT NULL,
  source_logo_url TEXT,
  article_url TEXT NOT NULL,
  published_at TIMESTAMP WITH TIME ZONE,
  excerpt TEXT,
  category TEXT NOT NULL DEFAULT 'media_coverage',
  active BOOLEAN NOT NULL DEFAULT true,
  featured BOOLEAN NOT NULL DEFAULT false,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.press_mentions ENABLE ROW LEVEL SECURITY;

-- Public can view active press mentions
CREATE POLICY "Public can view active press mentions"
ON public.press_mentions
FOR SELECT
USING (active = true);

-- Admins can manage all press mentions
CREATE POLICY "Admins can manage press mentions"
ON public.press_mentions
FOR ALL
USING (is_admin())
WITH CHECK (is_admin());

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_press_mentions_updated_at
BEFORE UPDATE ON public.press_mentions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();