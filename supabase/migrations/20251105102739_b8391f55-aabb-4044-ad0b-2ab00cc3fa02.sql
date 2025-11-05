-- Create background_styles table for storing element background preferences
CREATE TABLE public.background_styles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  element_id text UNIQUE NOT NULL,
  background_class text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.background_styles ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Background styles are viewable by everyone" 
ON public.background_styles 
FOR SELECT 
USING (true);

CREATE POLICY "Background styles can be managed by authenticated users" 
ON public.background_styles 
FOR ALL 
USING (auth.uid() IS NOT NULL)
WITH CHECK (auth.uid() IS NOT NULL);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_background_styles_updated_at
BEFORE UPDATE ON public.background_styles
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();