-- Add SEO fields and author_employee_id to blog_posts
ALTER TABLE blog_posts
ADD COLUMN IF NOT EXISTS author_employee_id UUID REFERENCES employees(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS meta_title TEXT,
ADD COLUMN IF NOT EXISTS meta_description TEXT,
ADD COLUMN IF NOT EXISTS og_image_url TEXT,
ADD COLUMN IF NOT EXISTS og_title TEXT,
ADD COLUMN IF NOT EXISTS og_description TEXT,
ADD COLUMN IF NOT EXISTS canonical_url TEXT;

-- Create index for author lookups
CREATE INDEX IF NOT EXISTS idx_blog_posts_author_employee ON blog_posts(author_employee_id);