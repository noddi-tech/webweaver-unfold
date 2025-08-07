-- Create storage bucket for demo videos
INSERT INTO storage.buckets (id, name, public) 
VALUES ('demo-videos', 'demo-videos', true);

-- Create policies for video uploads
CREATE POLICY "Demo videos are publicly accessible" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'demo-videos');

CREATE POLICY "Authenticated users can upload demo videos" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'demo-videos' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update demo videos" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'demo-videos' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete demo videos" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'demo-videos' AND auth.role() = 'authenticated');