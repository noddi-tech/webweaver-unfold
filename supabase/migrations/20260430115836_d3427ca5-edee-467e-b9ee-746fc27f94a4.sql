CREATE POLICY "Admins can insert slide draft logs"
  ON public.portal_slide_drafts
  FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin() AND editor_user_id = auth.uid());