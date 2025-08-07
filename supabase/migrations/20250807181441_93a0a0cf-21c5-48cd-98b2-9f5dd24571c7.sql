-- Create policies for demo-videos bucket to allow uploads

-- Allow public read access to demo-videos
CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING (bucket_id = 'demo-videos');

-- Allow authenticated users to upload demo-videos
CREATE POLICY "Allow authenticated uploads" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'demo-videos' AND auth.role() = 'authenticated');

-- Allow authenticated users to delete demo-videos  
CREATE POLICY "Allow authenticated deletes" ON storage.objects FOR DELETE USING (bucket_id = 'demo-videos' AND auth.role() = 'authenticated');