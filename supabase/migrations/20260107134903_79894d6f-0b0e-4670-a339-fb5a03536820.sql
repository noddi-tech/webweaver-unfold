-- Create blog_posts table
CREATE TABLE public.blog_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  excerpt TEXT,
  content TEXT,
  featured_image_url TEXT,
  author_name TEXT,
  author_avatar_url TEXT,
  author_title TEXT,
  category TEXT,
  tags JSONB DEFAULT '[]'::jsonb,
  reading_time_minutes INTEGER DEFAULT 5,
  published_at TIMESTAMPTZ,
  active BOOLEAN NOT NULL DEFAULT false,
  featured BOOLEAN NOT NULL DEFAULT false,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;

-- Public can read active, published posts
CREATE POLICY "Public can view published blog posts"
  ON public.blog_posts FOR SELECT
  USING (active = true AND (published_at IS NULL OR published_at <= now()));

-- Admins can do everything
CREATE POLICY "Admins can manage blog posts"
  ON public.blog_posts FOR ALL
  USING (is_admin())
  WITH CHECK (is_admin());

-- Auto-update timestamp trigger
CREATE TRIGGER update_blog_posts_updated_at
  BEFORE UPDATE ON public.blog_posts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Insert blog translation keys
INSERT INTO translations (language_code, translation_key, translated_text, approved, page_location) VALUES
('en', 'blog.hero.title', 'Navio Blog', true, 'blog'),
('en', 'blog.hero.subtitle', 'Insights, updates, and stories from the Navio team', true, 'blog'),
('en', 'blog.featured', 'Featured', true, 'blog'),
('en', 'blog.read_more', 'Read more', true, 'blog'),
('en', 'blog.reading_time', '{minutes} min read', true, 'blog'),
('en', 'blog.no_posts', 'No blog posts available yet.', true, 'blog'),
('en', 'blog.categories.all', 'All', true, 'blog'),
('en', 'blog.categories.product', 'Product Updates', true, 'blog'),
('en', 'blog.categories.industry', 'Industry Insights', true, 'blog'),
('en', 'blog.back_to_blog', 'Back to Blog', true, 'blog'),
('en', 'blog.by_author', 'By {author}', true, 'blog'),
('en', 'blog.related_posts', 'Related Posts', true, 'blog')
ON CONFLICT (language_code, translation_key) DO NOTHING;

-- Register blog page
INSERT INTO pages (name, slug, title, meta_description, active, published)
VALUES ('Blog', 'blog', 'Navio Blog', 'Insights and updates from the Navio team', true, true)
ON CONFLICT (slug) DO NOTHING;