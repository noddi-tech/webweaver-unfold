-- Phase 3: Create public employees view to restrict sensitive data exposure

-- Create a safe public view that excludes sensitive employee information
CREATE OR REPLACE VIEW public_employees AS
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
FROM employees
WHERE active = true;

-- Grant public access to the view
GRANT SELECT ON public_employees TO anon, authenticated;

-- Add comment explaining the view's purpose
COMMENT ON VIEW public_employees IS 'Public-facing employee data without sensitive contact information (email, phone, LinkedIn)';