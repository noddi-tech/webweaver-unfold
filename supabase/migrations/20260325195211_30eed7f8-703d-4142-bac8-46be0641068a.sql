-- 1. Drop overly permissive ALL policies on icon_styles and image_sections
DROP POLICY IF EXISTS "Icon styles manageable by authenticated users" ON public.icon_styles;
DROP POLICY IF EXISTS "Image sections can be managed by authenticated users" ON public.image_sections;

-- 2. Restrict referral_sources write access to admins, keep public read
DROP POLICY IF EXISTS "Authenticated users can manage referral sources" ON public.referral_sources;

CREATE POLICY "Admins can manage referral sources"
ON public.referral_sources FOR ALL TO authenticated
USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY "Referral sources are viewable by everyone"
ON public.referral_sources FOR SELECT TO public
USING (true);