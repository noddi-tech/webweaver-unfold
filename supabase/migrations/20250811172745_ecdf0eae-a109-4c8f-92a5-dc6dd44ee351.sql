-- Safe migration: ensure the image_object_position column exists
ALTER TABLE public.employees
ADD COLUMN IF NOT EXISTS image_object_position text NOT NULL DEFAULT 'center';