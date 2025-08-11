-- Create image sections table
CREATE TABLE IF NOT EXISTS public.image_sections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.image_sections ENABLE ROW LEVEL SECURITY;

-- Policies for image_sections
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'image_sections' AND policyname = 'Image sections are viewable by everyone'
  ) THEN
    CREATE POLICY "Image sections are viewable by everyone"
    ON public.image_sections
    FOR SELECT
    USING (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'image_sections' AND policyname = 'Image sections can be managed by authenticated users'
  ) THEN
    CREATE POLICY "Image sections can be managed by authenticated users"
    ON public.image_sections
    FOR ALL
    USING (auth.uid() IS NOT NULL)
    WITH CHECK (auth.uid() IS NOT NULL);
  END IF;
END $$;

-- Create images table
CREATE TABLE IF NOT EXISTS public.images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  alt TEXT,
  caption TEXT,
  section TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  sort_order INTEGER DEFAULT 0,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.images ENABLE ROW LEVEL SECURITY;

-- Policies for images
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'images' AND policyname = 'Images are viewable by everyone'
  ) THEN
    CREATE POLICY "Images are viewable by everyone"
    ON public.images
    FOR SELECT
    USING (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'images' AND policyname = 'Images can be managed by authenticated users'
  ) THEN
    CREATE POLICY "Images can be managed by authenticated users"
    ON public.images
    FOR ALL
    USING (auth.uid() IS NOT NULL)
    WITH CHECK (auth.uid() IS NOT NULL);
  END IF;
END $$;

-- Triggers to keep updated_at fresh
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'update_image_sections_updated_at'
  ) THEN
    CREATE TRIGGER update_image_sections_updated_at
    BEFORE UPDATE ON public.image_sections
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'update_images_updated_at'
  ) THEN
    CREATE TRIGGER update_images_updated_at
    BEFORE UPDATE ON public.images
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
END $$;

-- Create storage bucket for site images
INSERT INTO storage.buckets (id, name, public)
VALUES ('site-images', 'site-images', true)
ON CONFLICT (id) DO NOTHING;

-- Storage RLS policies for the bucket
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Public can view site-images'
  ) THEN
    CREATE POLICY "Public can view site-images"
    ON storage.objects
    FOR SELECT
    USING (bucket_id = 'site-images');
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Authenticated can manage site-images'
  ) THEN
    CREATE POLICY "Authenticated can manage site-images"
    ON storage.objects
    FOR ALL
    USING (bucket_id = 'site-images' AND auth.uid() IS NOT NULL)
    WITH CHECK (bucket_id = 'site-images' AND auth.uid() IS NOT NULL);
  END IF;
END $$;
