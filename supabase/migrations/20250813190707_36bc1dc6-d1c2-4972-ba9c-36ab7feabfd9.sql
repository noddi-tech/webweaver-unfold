-- Add color token field to headings table
ALTER TABLE public.headings 
ADD COLUMN color_token text DEFAULT 'foreground';