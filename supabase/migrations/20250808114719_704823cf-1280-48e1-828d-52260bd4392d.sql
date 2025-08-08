-- Add thumbnail_url to videos and create a public thumbnails bucket with policies

-- 1) Add column to videos table
ALTER TABLE public.videos
ADD COLUMN IF NOT EXISTS thumbnail_url TEXT;

-- 2) Create storage bucket for video thumbnails (public)
INSERT INTO storage.buckets (id, name, public)
VALUES ('video-thumbnails', 'video-thumbnails', true)
ON CONFLICT (id) DO NOTHING;

-- 3) Policies for storage.objects on the thumbnails bucket
DO $$ BEGIN
  -- Public read
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Public can read video thumbnails'
  ) THEN
    CREATE POLICY "Public can read video thumbnails"
    ON storage.objects
    FOR SELECT
    USING (bucket_id = 'video-thumbnails');
  END IF;

  -- Authenticated users can insert
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Authenticated can insert video thumbnails'
  ) THEN
    CREATE POLICY "Authenticated can insert video thumbnails"
    ON storage.objects
    FOR INSERT
    WITH CHECK (bucket_id = 'video-thumbnails' AND auth.role() = 'authenticated');
  END IF;

  -- Authenticated users can update
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Authenticated can update video thumbnails'
  ) THEN
    CREATE POLICY "Authenticated can update video thumbnails"
    ON storage.objects
    FOR UPDATE
    USING (bucket_id = 'video-thumbnails' AND auth.role() = 'authenticated');
  END IF;

  -- Authenticated users can delete
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Authenticated can delete video thumbnails'
  ) THEN
    CREATE POLICY "Authenticated can delete video thumbnails"
    ON storage.objects
    FOR DELETE
    USING (bucket_id = 'video-thumbnails' AND auth.role() = 'authenticated');
  END IF;
END $$;