-- Create a helper function that bypasses RLS for role checks
CREATE OR REPLACE FUNCTION public.get_user_role(check_user_id uuid)
RETURNS app_role
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT role FROM user_roles WHERE user_id = check_user_id LIMIT 1;
$$;

-- Drop existing problematic policies
DROP POLICY IF EXISTS "Admins can manage roles" ON user_roles;
DROP POLICY IF EXISTS "Users can view own roles" ON user_roles;

-- Recreate user_roles policies using the security definer function
CREATE POLICY "Users can view own roles" ON user_roles
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Admins can manage roles" ON user_roles
  FOR ALL
  TO authenticated
  USING (get_user_role(auth.uid()) = 'admin')
  WITH CHECK (get_user_role(auth.uid()) = 'admin');

-- Drop and recreate pricing_offers policies
DROP POLICY IF EXISTS "Admins and editors can manage offers" ON pricing_offers;
DROP POLICY IF EXISTS "Admins can manage offers" ON pricing_offers;

CREATE POLICY "Admins and editors can manage offers" ON pricing_offers
  FOR ALL
  TO authenticated
  USING (get_user_role(auth.uid()) IN ('admin', 'editor'))
  WITH CHECK (get_user_role(auth.uid()) IN ('admin', 'editor'));