-- Create solutions table
CREATE TABLE IF NOT EXISTS public.solutions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  subtitle TEXT,
  description TEXT,
  icon_name TEXT NOT NULL DEFAULT 'Sparkles',
  image_url TEXT,
  cta_text TEXT,
  cta_url TEXT,
  benefits JSONB DEFAULT '[]'::jsonb,
  sort_order INTEGER DEFAULT 0,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create solutions_settings table
CREATE TABLE IF NOT EXISTS public.solutions_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  section_title TEXT NOT NULL DEFAULT 'Solutions',
  section_subtitle TEXT,
  background_token TEXT NOT NULL DEFAULT 'background',
  card_bg_token TEXT NOT NULL DEFAULT 'card',
  border_token TEXT NOT NULL DEFAULT 'border',
  icon_token TEXT NOT NULL DEFAULT 'primary',
  title_token TEXT NOT NULL DEFAULT 'foreground',
  subtitle_token TEXT NOT NULL DEFAULT 'muted-foreground',
  description_token TEXT NOT NULL DEFAULT 'muted-foreground',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.solutions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.solutions_settings ENABLE ROW LEVEL SECURITY;

-- Create policies for solutions
CREATE POLICY "Solutions are viewable by everyone"
  ON public.solutions
  FOR SELECT
  USING (active = true);

CREATE POLICY "Solutions can be managed by authenticated users"
  ON public.solutions
  FOR ALL
  USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);

-- Create policies for solutions_settings
CREATE POLICY "Solutions settings are viewable by everyone"
  ON public.solutions_settings
  FOR SELECT
  USING (true);

CREATE POLICY "Solutions settings can be managed by authenticated users"
  ON public.solutions_settings
  FOR ALL
  USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);

-- Add updated_at trigger for solutions
CREATE TRIGGER update_solutions_updated_at
  BEFORE UPDATE ON public.solutions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Add updated_at trigger for solutions_settings
CREATE TRIGGER update_solutions_settings_updated_at
  BEFORE UPDATE ON public.solutions_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();