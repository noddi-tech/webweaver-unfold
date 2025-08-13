-- Create sections table for managing all content sections across CMS types
CREATE TABLE public.sections (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  display_name TEXT NOT NULL,
  page_location TEXT NOT NULL DEFAULT 'homepage',
  position_after TEXT NULL, -- What section this appears after (null for first section)
  position_before TEXT NULL, -- What section this appears before (null for last section)
  background_token TEXT NOT NULL DEFAULT 'background',
  text_token TEXT NOT NULL DEFAULT 'foreground',
  padding_token TEXT NOT NULL DEFAULT 'section',
  margin_token TEXT NOT NULL DEFAULT 'none',
  max_width_token TEXT NOT NULL DEFAULT 'container',
  active BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.sections ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Sections are viewable by everyone" 
ON public.sections 
FOR SELECT 
USING (true);

CREATE POLICY "Sections can be managed by authenticated users" 
ON public.sections 
FOR ALL 
USING (auth.uid() IS NOT NULL)
WITH CHECK (auth.uid() IS NOT NULL);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_sections_updated_at
BEFORE UPDATE ON public.sections
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default sections for existing structure
INSERT INTO public.sections (name, display_name, page_location, position_after, sort_order) VALUES
('hero', 'Hero Section', 'homepage', null, 0),
('features', 'Features', 'homepage', 'hero', 1),
('metrics', 'Metrics', 'homepage', 'features', 2),
('team', 'Team', 'team', null, 0),
('contact', 'Contact', 'contact', null, 0);

-- Update existing CMS tables to reference the sections table
-- Add section_id to existing tables (keeping section text for backwards compatibility)
ALTER TABLE public.images ADD COLUMN section_id UUID REFERENCES public.sections(id);
ALTER TABLE public.features ADD COLUMN section_id UUID REFERENCES public.sections(id);
ALTER TABLE public.usps ADD COLUMN section_id UUID REFERENCES public.sections(id);
ALTER TABLE public.employees ADD COLUMN section_id UUID REFERENCES public.sections(id);

-- Create indexes for better performance
CREATE INDEX idx_sections_page_location ON public.sections(page_location);
CREATE INDEX idx_sections_sort_order ON public.sections(sort_order);
CREATE INDEX idx_images_section_id ON public.images(section_id);
CREATE INDEX idx_features_section_id ON public.features(section_id);
CREATE INDEX idx_usps_section_id ON public.usps(section_id);
CREATE INDEX idx_employees_section_id ON public.employees(section_id);