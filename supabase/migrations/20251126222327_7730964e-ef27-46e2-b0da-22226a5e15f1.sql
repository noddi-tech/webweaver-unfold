-- Phase 1: Create Role-Based Access Control System

-- Create role enum
CREATE TYPE app_role AS ENUM ('admin', 'editor', 'viewer');

-- Create user_roles table
CREATE TABLE user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL DEFAULT 'viewer',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id)
);

-- Enable RLS on user_roles
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;

-- Users can view their own role
CREATE POLICY "Users can view own role"
ON user_roles
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- Only admins can manage roles
CREATE POLICY "Admins can manage roles"
ON user_roles
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- Create SECURITY DEFINER helper functions
CREATE OR REPLACE FUNCTION has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = _user_id AND role = _role
  );
END;
$$;

CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = auth.uid() AND role = 'admin'
  );
END;
$$;

-- Update RLS policies on content tables to require admin role for modifications
-- translations table
DROP POLICY IF EXISTS "Translations can be managed by authenticated users" ON translations;
CREATE POLICY "Admins can manage translations"
ON translations
FOR ALL
TO authenticated
USING (is_admin())
WITH CHECK (is_admin());

-- text_content table
DROP POLICY IF EXISTS "Headings can be managed by authenticated users" ON text_content;
CREATE POLICY "Admins can manage text content"
ON text_content
FOR ALL
TO authenticated
USING (is_admin())
WITH CHECK (is_admin());

-- solutions table
DROP POLICY IF EXISTS "Solutions can be managed by authenticated users" ON solutions;
CREATE POLICY "Admins can manage solutions"
ON solutions
FOR ALL
TO authenticated
USING (is_admin())
WITH CHECK (is_admin());

-- faqs table
DROP POLICY IF EXISTS "FAQs can be managed by authenticated users" ON faqs;
CREATE POLICY "Admins can manage FAQs"
ON faqs
FOR ALL
TO authenticated
USING (is_admin())
WITH CHECK (is_admin());

-- features table
DROP POLICY IF EXISTS "Features can be managed by authenticated users" ON features;
CREATE POLICY "Admins can manage features"
ON features
FOR ALL
TO authenticated
USING (is_admin())
WITH CHECK (is_admin());

-- images table
DROP POLICY IF EXISTS "Images can be managed by authenticated users" ON images;
CREATE POLICY "Admins can manage images"
ON images
FOR ALL
TO authenticated
USING (is_admin())
WITH CHECK (is_admin());

-- employees table
DROP POLICY IF EXISTS "Employees can be managed by authenticated users" ON employees;
DROP POLICY IF EXISTS "Authenticated users can manage employees" ON employees;
CREATE POLICY "Admins can manage employees"
ON employees
FOR ALL
TO authenticated
USING (is_admin())
WITH CHECK (is_admin());

-- pricing_plans table
DROP POLICY IF EXISTS "Pricing plans can be managed by authenticated users" ON pricing_plans;
CREATE POLICY "Admins can manage pricing plans"
ON pricing_plans
FOR ALL
TO authenticated
USING (is_admin())
WITH CHECK (is_admin());

-- color_tokens table
DROP POLICY IF EXISTS "Color tokens can be managed by authenticated users" ON color_tokens;
CREATE POLICY "Admins can manage color tokens"
ON color_tokens
FOR ALL
TO authenticated
USING (is_admin())
WITH CHECK (is_admin());

-- carousel_configs table
DROP POLICY IF EXISTS "Carousel configs can be managed by authenticated users" ON carousel_configs;
CREATE POLICY "Admins can manage carousel configs"
ON carousel_configs
FOR ALL
TO authenticated
USING (is_admin())
WITH CHECK (is_admin());

-- header_settings table
DROP POLICY IF EXISTS "Header settings can be managed by authenticated users" ON header_settings;
CREATE POLICY "Admins can manage header settings"
ON header_settings
FOR ALL
TO authenticated
USING (is_admin())
WITH CHECK (is_admin());

-- footer_settings table
DROP POLICY IF EXISTS "Footer settings can be managed by authenticated users" ON footer_settings;
CREATE POLICY "Admins can manage footer settings"
ON footer_settings
FOR ALL
TO authenticated
USING (is_admin())
WITH CHECK (is_admin());

-- contact_settings table
DROP POLICY IF EXISTS "Contact settings can be managed by authenticated users" ON contact_settings;
CREATE POLICY "Admins can manage contact settings"
ON contact_settings
FOR ALL
TO authenticated
USING (is_admin())
WITH CHECK (is_admin());

-- contact_items table
DROP POLICY IF EXISTS "Contact items can be managed by authenticated users" ON contact_items;
CREATE POLICY "Admins can manage contact items"
ON contact_items
FOR ALL
TO authenticated
USING (is_admin())
WITH CHECK (is_admin());

-- business_hours table
DROP POLICY IF EXISTS "Business hours can be managed by authenticated users" ON business_hours;
CREATE POLICY "Admins can manage business hours"
ON business_hours
FOR ALL
TO authenticated
USING (is_admin())
WITH CHECK (is_admin());

-- sections table
DROP POLICY IF EXISTS "Sections can be managed by authenticated users" ON sections;
CREATE POLICY "Admins can manage sections"
ON sections
FOR ALL
TO authenticated
USING (is_admin())
WITH CHECK (is_admin());

-- pages table
DROP POLICY IF EXISTS "Pages can be managed by authenticated users" ON pages;
CREATE POLICY "Admins can manage pages"
ON pages
FOR ALL
TO authenticated
USING (is_admin())
WITH CHECK (is_admin());

-- image_carousel_settings table
DROP POLICY IF EXISTS "Image carousel settings can be managed by authenticated users" ON image_carousel_settings;
CREATE POLICY "Admins can manage image carousel settings"
ON image_carousel_settings
FOR ALL
TO authenticated
USING (is_admin())
WITH CHECK (is_admin());

-- background_styles table
DROP POLICY IF EXISTS "Background styles can be managed by authenticated users" ON background_styles;
CREATE POLICY "Admins can manage background styles"
ON background_styles
FOR ALL
TO authenticated
USING (is_admin())
WITH CHECK (is_admin());

-- icon_styles table
DROP POLICY IF EXISTS "Icon styles can be managed by authenticated users" ON icon_styles;
CREATE POLICY "Admins can manage icon styles"
ON icon_styles
FOR ALL
TO authenticated
USING (is_admin())
WITH CHECK (is_admin());

-- typography_settings table
DROP POLICY IF EXISTS "Typography settings can be managed by authenticated users" ON typography_settings;
CREATE POLICY "Admins can manage typography settings"
ON typography_settings
FOR ALL
TO authenticated
USING (is_admin())
WITH CHECK (is_admin());

-- rotating_headline_terms table
DROP POLICY IF EXISTS "Rotating headline terms manageable by authenticated users" ON rotating_headline_terms;
CREATE POLICY "Admins can manage rotating headline terms"
ON rotating_headline_terms
FOR ALL
TO authenticated
USING (is_admin())
WITH CHECK (is_admin());

-- usps table
DROP POLICY IF EXISTS "USPs can be managed by authenticated users" ON usps;
CREATE POLICY "Admins can manage USPs"
ON usps
FOR ALL
TO authenticated
USING (is_admin())
WITH CHECK (is_admin());

-- videos table
DROP POLICY IF EXISTS "Videos can be managed by authenticated users" ON videos;
CREATE POLICY "Admins can manage videos"
ON videos
FOR ALL
TO authenticated
USING (is_admin())
WITH CHECK (is_admin());

-- brand_settings table
DROP POLICY IF EXISTS "Brand settings can be managed by authenticated users" ON brand_settings;
CREATE POLICY "Admins can manage brand settings"
ON brand_settings
FOR ALL
TO authenticated
USING (is_admin())
WITH CHECK (is_admin());

-- static_files table
DROP POLICY IF EXISTS "Authenticated users can manage static files" ON static_files;
CREATE POLICY "Admins can manage static files"
ON static_files
FOR ALL
TO authenticated
USING (is_admin())
WITH CHECK (is_admin());

-- page_meta_translations table
DROP POLICY IF EXISTS "Page meta translations can be managed by authenticated users" ON page_meta_translations;
CREATE POLICY "Admins can manage page meta translations"
ON page_meta_translations
FOR ALL
TO authenticated
USING (is_admin())
WITH CHECK (is_admin());

-- languages table
DROP POLICY IF EXISTS "Languages can be managed by authenticated users" ON languages;
CREATE POLICY "Admins can manage languages"
ON languages
FOR ALL
TO authenticated
USING (is_admin())
WITH CHECK (is_admin());

-- solutions_settings table
DROP POLICY IF EXISTS "Solutions settings can be managed by authenticated users" ON solutions_settings;
CREATE POLICY "Admins can manage solutions settings"
ON solutions_settings
FOR ALL
TO authenticated
USING (is_admin())
WITH CHECK (is_admin());

-- features_settings table
DROP POLICY IF EXISTS "Features settings can be managed by authenticated users" ON features_settings;
CREATE POLICY "Admins can manage features settings"
ON features_settings
FOR ALL
TO authenticated
USING (is_admin())
WITH CHECK (is_admin());

-- employees_settings table
DROP POLICY IF EXISTS "Employees settings can be managed by authenticated users" ON employees_settings;
CREATE POLICY "Admins can manage employees settings"
ON employees_settings
FOR ALL
TO authenticated
USING (is_admin())
WITH CHECK (is_admin());

-- employees_sections table
DROP POLICY IF EXISTS "Employees sections can be managed by authenticated users" ON employees_sections;
CREATE POLICY "Admins can manage employees sections"
ON employees_sections
FOR ALL
TO authenticated
USING (is_admin())
WITH CHECK (is_admin());

-- image_sections table
DROP POLICY IF EXISTS "Sections can be managed by authenticated users" ON image_sections;
CREATE POLICY "Admins can manage image sections"
ON image_sections
FOR ALL
TO authenticated
USING (is_admin())
WITH CHECK (is_admin());

-- video_sections table
DROP POLICY IF EXISTS "Sections can be managed by authenticated users" ON video_sections;
CREATE POLICY "Admins can manage video sections"
ON video_sections
FOR ALL
TO authenticated
USING (is_admin())
WITH CHECK (is_admin());

-- content_hierarchies table
DROP POLICY IF EXISTS "Content hierarchies can be managed by authenticated users" ON content_hierarchies;
CREATE POLICY "Admins can manage content hierarchies"
ON content_hierarchies
FOR ALL
TO authenticated
USING (is_admin())
WITH CHECK (is_admin());

-- evaluation_progress table
DROP POLICY IF EXISTS "Evaluation progress manageable by authenticated users" ON evaluation_progress;
CREATE POLICY "Admins can manage evaluation progress"
ON evaluation_progress
FOR ALL
TO authenticated
USING (is_admin())
WITH CHECK (is_admin());

-- evaluation_batches table
DROP POLICY IF EXISTS "Evaluation batches manageable by authenticated users" ON evaluation_batches;
CREATE POLICY "Admins can manage evaluation batches"
ON evaluation_batches
FOR ALL
TO authenticated
USING (is_admin())
WITH CHECK (is_admin());

-- language_settings table
DROP POLICY IF EXISTS "Language settings can be managed by authenticated users" ON language_settings;
CREATE POLICY "Admins can manage language settings"
ON language_settings
FOR ALL
TO authenticated
USING (is_admin())
WITH CHECK (is_admin());

-- site_settings table
DROP POLICY IF EXISTS "Site settings can be managed by authenticated users" ON site_settings;
CREATE POLICY "Admins can manage site settings"
ON site_settings
FOR ALL
TO authenticated
USING (is_admin())
WITH CHECK (is_admin());