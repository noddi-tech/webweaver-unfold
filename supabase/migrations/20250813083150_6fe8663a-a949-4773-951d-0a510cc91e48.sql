-- Create headings table for centralized heading management
CREATE TABLE public.headings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  page_location TEXT NOT NULL, -- e.g., 'home', 'features', 'contact', 'demo'
  section TEXT NOT NULL, -- e.g., 'hero', 'main', 'footer'
  element_type TEXT NOT NULL, -- e.g., 'h1', 'h2', 'h3', 'subtitle', 'description'
  content TEXT NOT NULL,
  active BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.headings ENABLE ROW LEVEL SECURITY;

-- Create policies for headings
CREATE POLICY "Headings are viewable by everyone" 
ON public.headings 
FOR SELECT 
USING (true);

CREATE POLICY "Headings can be managed by authenticated users" 
ON public.headings 
FOR ALL 
USING (auth.uid() IS NOT NULL)
WITH CHECK (auth.uid() IS NOT NULL);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_headings_updated_at
BEFORE UPDATE ON public.headings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default headings for existing pages
INSERT INTO public.headings (page_location, section, element_type, content, sort_order) VALUES
-- Home page headings
('home', 'hero', 'h1', 'Contact Us', 1),
('home', 'hero', 'subtitle', 'Get in touch with our team. We''re here to help you succeed.', 2),

-- Features page headings  
('features', 'hero', 'h1', 'Features', 1),
('features', 'hero', 'subtitle', 'Discover what makes our platform special', 2),

-- Demo page headings
('demo', 'hero', 'h1', 'Demo', 1),
('demo', 'hero', 'subtitle', 'Experience our platform in action', 2),

-- Team page headings
('team', 'hero', 'h1', 'Our Team', 1),
('team', 'hero', 'subtitle', 'Meet the people behind our success', 2),

-- Contact page headings (main hero section, not form sections)
('contact', 'hero', 'h1', 'Contact Us', 1),
('contact', 'hero', 'subtitle', 'Get in touch with our team. We''re here to help you succeed.', 2),

-- Index/Landing page headings
('index', 'hero', 'h1', 'Build Something Amazing', 1),
('index', 'hero', 'subtitle', 'Create powerful applications with our modern platform', 2);