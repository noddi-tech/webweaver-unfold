-- Grant SELECT permission on employees_public view to anon and authenticated roles
GRANT SELECT ON public.employees_public TO anon, authenticated;