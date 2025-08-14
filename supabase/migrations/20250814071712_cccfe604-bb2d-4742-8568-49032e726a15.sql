-- Create pages table as the top-level hierarchy
CREATE TABLE public.pages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  meta_description TEXT,
  meta_keywords TEXT,
  
  -- Default design tokens that sections can inherit
  default_background_token TEXT NOT NULL DEFAULT 'background',
  default_text_token TEXT NOT NULL DEFAULT 'foreground',
  default_padding_token TEXT NOT NULL DEFAULT 'section',
  default_margin_token TEXT NOT NULL DEFAULT 'none',
  default_max_width_token TEXT NOT NULL DEFAULT 'container',
  
  -- Layout settings
  layout_type TEXT NOT NULL DEFAULT 'standard',
  container_width TEXT NOT NULL DEFAULT 'container',
  
  -- Page status
  active BOOLEAN NOT NULL DEFAULT true,
  published BOOLEAN NOT NULL DEFAULT true,
  
  -- Global content associations
  header_id UUID,
  footer_id UUID,
  brand_id UUID,
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.pages ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Pages are viewable by everyone" 
ON public.pages 
FOR SELECT 
USING (true);

CREATE POLICY "Pages can be managed by authenticated users" 
ON public.pages 
FOR ALL 
USING (auth.uid() IS NOT NULL)
WITH CHECK (auth.uid() IS NOT NULL);

-- Add page_id to sections table
ALTER TABLE public.sections 
ADD COLUMN page_id UUID,
ADD COLUMN inherit_page_defaults BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN background_token_override TEXT,
ADD COLUMN text_token_override TEXT,
ADD COLUMN padding_token_override TEXT,
ADD COLUMN margin_token_override TEXT,
ADD COLUMN max_width_token_override TEXT;

-- Update existing sections to work with pages
-- Create default homepage
INSERT INTO public.pages (name, slug, title, meta_description) 
VALUES ('Homepage', 'homepage', 'Software that transforms car maintenance', 'Brick-and-mortar services are facing its Kodak moment, as the car maintenance industry falls behind on customer centricity.');

-- Link existing sections to homepage
UPDATE public.sections 
SET page_id = (SELECT id FROM public.pages WHERE slug = 'homepage')
WHERE page_location IN ('homepage', 'index');

-- Add foreign key constraint
ALTER TABLE public.sections 
ADD CONSTRAINT sections_page_id_fkey 
FOREIGN KEY (page_id) REFERENCES public.pages(id);

-- Create content_hierarchies table for flexible content organization
CREATE TABLE public.content_hierarchies (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  page_id UUID NOT NULL REFERENCES public.pages(id),
  section_id UUID NOT NULL REFERENCES public.sections(id),
  content_type TEXT NOT NULL, -- 'heading', 'image', 'video', 'feature', 'usp', 'employee'
  content_id UUID NOT NULL,
  sort_order INTEGER DEFAULT 0,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.content_hierarchies ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Content hierarchies are viewable by everyone" 
ON public.content_hierarchies 
FOR SELECT 
USING (true);

CREATE POLICY "Content hierarchies can be managed by authenticated users" 
ON public.content_hierarchies 
FOR ALL 
USING (auth.uid() IS NOT NULL)
WITH CHECK (auth.uid() IS NOT NULL);

-- Create trigger for automatic timestamp updates on pages
CREATE TRIGGER update_pages_updated_at
BEFORE UPDATE ON public.pages
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create trigger for automatic timestamp updates on content_hierarchies
CREATE TRIGGER update_content_hierarchies_updated_at
BEFORE UPDATE ON public.content_hierarchies
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();