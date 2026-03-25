CREATE TABLE public.testimonial_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_story_id uuid REFERENCES public.customer_stories(id) ON DELETE SET NULL,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.testimonial_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Testimonial settings are viewable by everyone"
  ON public.testimonial_settings
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Admins can manage testimonial settings"
  ON public.testimonial_settings
  FOR ALL
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

INSERT INTO public.testimonial_settings (active) VALUES (true);