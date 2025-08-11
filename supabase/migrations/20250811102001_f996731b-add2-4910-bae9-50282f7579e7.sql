-- 1) Add a column to store the uploaded logo URL
ALTER TABLE public.brand_settings
ADD COLUMN IF NOT EXISTS logo_image_url text;

-- 2) Create a public storage bucket for brand logos (id equals name)
INSERT INTO storage.buckets (id, name, public)
VALUES ('brand-logos', 'brand-logos', true)
ON CONFLICT (id) DO NOTHING;

-- 3) RLS policies for the brand-logos bucket
DO $$
BEGIN
  -- Public read access for brand logos
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Brand logos are publicly accessible'
  ) THEN
    CREATE POLICY "Brand logos are publicly accessible"
    ON storage.objects
    FOR SELECT
    USING (bucket_id = 'brand-logos');
  END IF;

  -- Authenticated users can upload to a folder with their user id as the first path segment
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Users can upload brand logos to their folder'
  ) THEN
    CREATE POLICY "Users can upload brand logos to their folder"
    ON storage.objects
    FOR INSERT
    WITH CHECK (
      bucket_id = 'brand-logos'
      AND auth.uid()::text = (storage.foldername(name))[1]
    );
  END IF;

  -- Authenticated users can update files in their own folder
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Users can update their own brand logos'
  ) THEN
    CREATE POLICY "Users can update their own brand logos"
    ON storage.objects
    FOR UPDATE
    USING (
      bucket_id = 'brand-logos'
      AND auth.uid()::text = (storage.foldername(name))[1]
    );
  END IF;

  -- Authenticated users can delete files in their own folder
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Users can delete their own brand logos'
  ) THEN
    CREATE POLICY "Users can delete their own brand logos"
    ON storage.objects
    FOR DELETE
    USING (
      bucket_id = 'brand-logos'
      AND auth.uid()::text = (storage.foldername(name))[1]
    );
  END IF;
END $$;