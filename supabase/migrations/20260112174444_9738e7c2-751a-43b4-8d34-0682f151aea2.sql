-- Enable pg_cron extension (if not already enabled)
CREATE EXTENSION IF NOT EXISTS pg_cron WITH SCHEMA extensions;

-- Grant usage to postgres role
GRANT USAGE ON SCHEMA cron TO postgres;

-- Schedule the auto-publish job to run every 5 minutes
-- This directly updates posts in the database (simpler than calling edge function)
SELECT cron.schedule(
  'publish-scheduled-blog-posts',
  '*/5 * * * *',
  $$
  UPDATE blog_posts 
  SET status = 'published', active = true 
  WHERE status = 'scheduled' AND published_at <= now();
  $$
);