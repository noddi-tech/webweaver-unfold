-- Add trigger for automatic timestamp updates on static_files table
CREATE TRIGGER update_static_files_updated_at
BEFORE UPDATE ON public.static_files
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();