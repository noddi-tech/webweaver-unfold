-- Add new columns to job_listings for enhanced job pages
ALTER TABLE job_listings 
ADD COLUMN IF NOT EXISTS company_intro text,
ADD COLUMN IF NOT EXISTS work_assignments jsonb DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS tech_stack jsonb DEFAULT '[]'::jsonb;

-- Create tech_stack_items table for reusable tech stack logos
CREATE TABLE IF NOT EXISTS tech_stack_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  logo_url text,
  category text DEFAULT 'general',
  description text,
  sort_order integer DEFAULT 0,
  active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS on tech_stack_items
ALTER TABLE tech_stack_items ENABLE ROW LEVEL SECURITY;

-- Allow public read access to tech stack items
CREATE POLICY "Tech stack items are publicly readable"
ON tech_stack_items FOR SELECT
USING (true);

-- Allow admins to manage tech stack items
CREATE POLICY "Admins can manage tech stack items"
ON tech_stack_items FOR ALL
USING (is_admin());

-- Add updated_at trigger
CREATE TRIGGER update_tech_stack_items_updated_at
BEFORE UPDATE ON tech_stack_items
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Add some initial tech stack items
INSERT INTO tech_stack_items (name, category, logo_url, description, sort_order) VALUES
('React', 'frontend', 'https://cdn.simpleicons.org/react/61DAFB', 'Building modern, component-based UIs', 1),
('TypeScript', 'frontend', 'https://cdn.simpleicons.org/typescript/3178C6', 'Type-safe JavaScript for reliable code', 2),
('Tailwind CSS', 'frontend', 'https://cdn.simpleicons.org/tailwindcss/06B6D4', 'Utility-first CSS framework', 3),
('Node.js', 'backend', 'https://cdn.simpleicons.org/nodedotjs/339933', 'Server-side JavaScript runtime', 4),
('PostgreSQL', 'backend', 'https://cdn.simpleicons.org/postgresql/4169E1', 'Advanced open-source database', 5),
('Supabase', 'backend', 'https://cdn.simpleicons.org/supabase/3FCF8E', 'Open-source Firebase alternative', 6),
('AWS', 'infrastructure', 'https://cdn.simpleicons.org/amazonaws/FF9900', 'Cloud infrastructure at scale', 7),
('Docker', 'infrastructure', 'https://cdn.simpleicons.org/docker/2496ED', 'Containerized deployments', 8),
('GitHub', 'tools', 'https://cdn.simpleicons.org/github/181717', 'Version control and collaboration', 9),
('Vercel', 'infrastructure', 'https://cdn.simpleicons.org/vercel/000000', 'Edge-first deployment platform', 10)
ON CONFLICT DO NOTHING;

-- Add comment for documentation
COMMENT ON TABLE tech_stack_items IS 'Reusable tech stack items with logos for job listings';