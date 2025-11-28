-- Security Fix: Remove public upload and delete policies from demo-videos bucket
-- This prevents unauthenticated users from uploading or deleting files

-- Remove public upload policy (allows anyone to upload without auth)
DROP POLICY IF EXISTS "Allow public uploads to demo-videos" ON storage.objects;

-- Remove public delete policy (allows anyone to delete without auth)
DROP POLICY IF EXISTS "Allow public deletes from demo-videos" ON storage.objects;

-- Note: The following authenticated policies remain active:
-- - "Authenticated users can upload demo videos" (requires auth.uid())
-- - "Authenticated users can delete demo videos" (requires auth.uid())
-- - "Public can view demo videos" (read-only SELECT access remains public)