-- Fix SECURITY DEFINER warning on evaluation_progress trigger function
-- Drop and recreate without SECURITY DEFINER since it only updates timestamps
DROP FUNCTION IF EXISTS public.update_evaluation_progress_timestamp() CASCADE;

CREATE OR REPLACE FUNCTION public.update_evaluation_progress_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Recreate the trigger
CREATE TRIGGER update_evaluation_progress_updated_at
BEFORE UPDATE ON public.evaluation_progress
FOR EACH ROW
EXECUTE FUNCTION public.update_evaluation_progress_timestamp();