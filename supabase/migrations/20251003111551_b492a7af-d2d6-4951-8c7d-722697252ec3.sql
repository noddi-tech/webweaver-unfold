-- Create a public view of employees that excludes sensitive contact information
CREATE OR REPLACE VIEW public.employees_public AS
SELECT 
  id,
  name,
  title,
  image_url,
  image_object_position,
  section,
  section_id,
  sort_order,
  active,
  created_at,
  updated_at
FROM public.employees
WHERE active = true;

-- Drop the old public policy on employees table
DROP POLICY IF EXISTS "Employees are viewable by everyone" ON public.employees;

-- Create new policy: Public can view employees through the public view only
CREATE POLICY "Public can view non-sensitive employee data"
ON public.employees
FOR SELECT
TO public
USING (false);

-- Create policy: Authenticated users (admins) can manage all employee data
CREATE POLICY "Authenticated users can manage employees"
ON public.employees
FOR ALL
TO authenticated
USING (auth.uid() IS NOT NULL)
WITH CHECK (auth.uid() IS NOT NULL);