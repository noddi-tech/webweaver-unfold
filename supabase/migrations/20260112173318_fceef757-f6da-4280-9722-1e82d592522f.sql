-- =========================================
-- 1. ADD STATUS COLUMN TO BLOG_POSTS
-- =========================================

-- Add status column for scheduled publishing
ALTER TABLE blog_posts 
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'draft';

-- Add constraint for valid statuses
ALTER TABLE blog_posts 
ADD CONSTRAINT blog_posts_status_check 
CHECK (status IN ('draft', 'scheduled', 'published', 'archived'));

-- Create index for scheduled posts queries
CREATE INDEX IF NOT EXISTS idx_blog_posts_status_published_at 
ON blog_posts(status, published_at) 
WHERE status = 'scheduled';

-- Migrate existing data: active posts become published, inactive become draft
UPDATE blog_posts SET status = 'published' WHERE active = true;
UPDATE blog_posts SET status = 'draft' WHERE active = false;

-- =========================================
-- 2. CREATE BLOG_CATEGORIES TABLE
-- =========================================

CREATE TABLE IF NOT EXISTS blog_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  color TEXT DEFAULT '#6366f1',
  icon TEXT,
  sort_order INTEGER DEFAULT 0,
  active BOOLEAN DEFAULT true,
  post_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE blog_categories ENABLE ROW LEVEL SECURITY;

-- Public read access
CREATE POLICY "Anyone can read active blog categories" 
ON blog_categories FOR SELECT 
USING (active = true);

-- Admin write access
CREATE POLICY "Admins can manage blog categories" 
ON blog_categories FOR ALL 
USING (is_admin());

-- Add category_id foreign key to blog_posts
ALTER TABLE blog_posts 
ADD COLUMN IF NOT EXISTS category_id UUID REFERENCES blog_categories(id) ON DELETE SET NULL;

-- Create index for category lookups
CREATE INDEX IF NOT EXISTS idx_blog_posts_category_id ON blog_posts(category_id);

-- Trigger to update category post counts
CREATE OR REPLACE FUNCTION update_blog_category_post_count()
RETURNS TRIGGER AS $$
BEGIN
  -- Update old category count (if changed or deleted)
  IF TG_OP = 'DELETE' OR (TG_OP = 'UPDATE' AND OLD.category_id IS DISTINCT FROM NEW.category_id) THEN
    IF OLD.category_id IS NOT NULL THEN
      UPDATE blog_categories SET post_count = (
        SELECT COUNT(*) FROM blog_posts 
        WHERE category_id = OLD.category_id AND status = 'published'
      ) WHERE id = OLD.category_id;
    END IF;
  END IF;
  
  -- Update new/current category count (for INSERT and UPDATE)
  IF TG_OP IN ('INSERT', 'UPDATE') THEN
    IF NEW.category_id IS NOT NULL THEN
      UPDATE blog_categories SET post_count = (
        SELECT COUNT(*) FROM blog_posts 
        WHERE category_id = NEW.category_id AND status = 'published'
      ) WHERE id = NEW.category_id;
    END IF;
    RETURN NEW;
  END IF;
  
  RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER blog_post_category_count_trigger
AFTER INSERT OR UPDATE OR DELETE ON blog_posts
FOR EACH ROW EXECUTE FUNCTION update_blog_category_post_count();

-- Trigger for updated_at on categories
CREATE TRIGGER update_blog_categories_updated_at
BEFORE UPDATE ON blog_categories
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =========================================
-- 3. CREATE BLOG_TAGS TABLE
-- =========================================

CREATE TABLE IF NOT EXISTS blog_tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  post_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE blog_tags ENABLE ROW LEVEL SECURITY;

-- Public read access
CREATE POLICY "Anyone can read blog tags" 
ON blog_tags FOR SELECT 
USING (true);

-- Admin write access
CREATE POLICY "Admins can manage blog tags" 
ON blog_tags FOR ALL 
USING (is_admin());

-- Create index for tag name search
CREATE INDEX IF NOT EXISTS idx_blog_tags_name ON blog_tags(name);

-- Function to sync tags from blog posts
CREATE OR REPLACE FUNCTION sync_blog_post_tags()
RETURNS TRIGGER AS $$
DECLARE
  tag_name TEXT;
  old_tag TEXT;
BEGIN
  -- Decrease count for removed tags
  IF TG_OP = 'UPDATE' AND OLD.tags IS NOT NULL THEN
    FOR old_tag IN SELECT jsonb_array_elements_text(OLD.tags::jsonb) LOOP
      -- Check if tag was removed
      IF NEW.tags IS NULL OR NOT (NEW.tags::jsonb ? old_tag) THEN
        UPDATE blog_tags SET post_count = GREATEST(0, post_count - 1) WHERE name = old_tag;
      END IF;
    END LOOP;
  END IF;
  
  -- Insert or increment new tags
  IF NEW.tags IS NOT NULL THEN
    FOR tag_name IN SELECT jsonb_array_elements_text(NEW.tags::jsonb) LOOP
      -- Check if this is a new tag for this post
      IF TG_OP = 'INSERT' OR OLD.tags IS NULL OR NOT (OLD.tags::jsonb ? tag_name) THEN
        INSERT INTO blog_tags (name, slug, post_count)
        VALUES (
          tag_name, 
          lower(regexp_replace(tag_name, '[^a-zA-Z0-9]+', '-', 'g')), 
          1
        )
        ON CONFLICT (name) DO UPDATE SET post_count = blog_tags.post_count + 1;
      END IF;
    END LOOP;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER blog_post_tags_sync_trigger
AFTER INSERT OR UPDATE OF tags ON blog_posts
FOR EACH ROW EXECUTE FUNCTION sync_blog_post_tags();

-- =========================================
-- 4. MIGRATE EXISTING CATEGORIES TO TABLE
-- =========================================

-- Insert existing categories from blog_posts
INSERT INTO blog_categories (name, slug, sort_order)
SELECT DISTINCT 
  category, 
  lower(regexp_replace(category, '[^a-zA-Z0-9]+', '-', 'g')),
  ROW_NUMBER() OVER (ORDER BY category)::integer
FROM blog_posts 
WHERE category IS NOT NULL AND category != ''
ON CONFLICT (name) DO NOTHING;

-- Link existing posts to category_id
UPDATE blog_posts bp
SET category_id = bc.id
FROM blog_categories bc
WHERE bp.category = bc.name;

-- Update category post counts
UPDATE blog_categories SET post_count = (
  SELECT COUNT(*) FROM blog_posts 
  WHERE category_id = blog_categories.id AND status = 'published'
);

-- =========================================
-- 5. SYNC EXISTING TAGS TO BLOG_TAGS TABLE
-- =========================================

-- Insert existing tags from blog_posts
INSERT INTO blog_tags (name, slug, post_count)
SELECT 
  tag,
  lower(regexp_replace(tag, '[^a-zA-Z0-9]+', '-', 'g')),
  COUNT(*)::integer
FROM blog_posts, jsonb_array_elements_text(tags::jsonb) AS tag
WHERE tags IS NOT NULL AND jsonb_array_length(tags::jsonb) > 0
GROUP BY tag
ON CONFLICT (name) DO UPDATE SET post_count = EXCLUDED.post_count;