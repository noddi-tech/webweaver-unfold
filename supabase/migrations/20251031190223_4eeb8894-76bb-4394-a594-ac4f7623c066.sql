-- Create carousel_configs table to store reusable carousel configurations
CREATE TABLE IF NOT EXISTS public.carousel_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  autoplay BOOLEAN NOT NULL DEFAULT true,
  autoplay_delay INTEGER NOT NULL DEFAULT 3500,
  show_navigation BOOLEAN NOT NULL DEFAULT true,
  show_dots BOOLEAN NOT NULL DEFAULT true,
  images JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create image_carousel_settings table to store image/carousel display settings for specific locations
CREATE TABLE IF NOT EXISTS public.image_carousel_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  location_id TEXT NOT NULL UNIQUE,
  display_type TEXT NOT NULL DEFAULT 'image' CHECK (display_type IN ('image', 'carousel')),
  
  -- Image settings
  image_url TEXT,
  image_alt TEXT,
  
  -- Carousel settings
  carousel_config_id UUID REFERENCES public.carousel_configs(id) ON DELETE SET NULL,
  
  -- Keep both configurations even when switching
  saved_image_url TEXT,
  saved_image_alt TEXT,
  saved_carousel_config_id UUID REFERENCES public.carousel_configs(id) ON DELETE SET NULL,
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.carousel_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.image_carousel_settings ENABLE ROW LEVEL SECURITY;

-- RLS Policies for carousel_configs
CREATE POLICY "Carousel configs are viewable by everyone"
  ON public.carousel_configs FOR SELECT
  USING (true);

CREATE POLICY "Carousel configs can be managed by authenticated users"
  ON public.carousel_configs FOR ALL
  USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);

-- RLS Policies for image_carousel_settings
CREATE POLICY "Image carousel settings are viewable by everyone"
  ON public.image_carousel_settings FOR SELECT
  USING (true);

CREATE POLICY "Image carousel settings can be managed by authenticated users"
  ON public.image_carousel_settings FOR ALL
  USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);

-- Create trigger for updating updated_at
CREATE TRIGGER update_carousel_configs_updated_at
  BEFORE UPDATE ON public.carousel_configs
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_image_carousel_settings_updated_at
  BEFORE UPDATE ON public.image_carousel_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX idx_image_carousel_settings_location ON public.image_carousel_settings(location_id);
CREATE INDEX idx_carousel_configs_name ON public.carousel_configs(name);