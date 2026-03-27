CREATE POLICY "Anon can view bookable employees"
ON public.employees
FOR SELECT
TO anon
USING (active = true AND google_calendar_connected = true);