-- Update storage policies to allow public uploads for demo-videos (admin interface)

-- Drop existing restrictive policies
DROP POLICY IF EXISTS "Allow authenticated uploads" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated deletes" ON storage.objects;

-- Allow anyone to upload to demo-videos bucket (admin interface)
CREATE POLICY "Allow public uploads to demo-videos" ON storage.objects 
FOR INSERT WITH CHECK (bucket_id = 'demo-videos');

-- Allow anyone to delete from demo-videos bucket (admin interface)  
CREATE POLICY "Allow public deletes from demo-videos" ON storage.objects 
FOR DELETE USING (bucket_id = 'demo-videos');