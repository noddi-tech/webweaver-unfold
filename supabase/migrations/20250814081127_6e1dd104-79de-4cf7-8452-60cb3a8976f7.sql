-- Add caption position field to images table
ALTER TABLE public.images 
ADD COLUMN caption_position text NOT NULL DEFAULT 'below';