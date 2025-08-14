-- Add styling options for image titles and captions
ALTER TABLE public.images 
ADD COLUMN title_color_token text DEFAULT 'foreground',
ADD COLUMN caption_color_token text DEFAULT 'muted-foreground';