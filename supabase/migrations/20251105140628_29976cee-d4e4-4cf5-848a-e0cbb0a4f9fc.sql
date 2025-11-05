-- Create color_tokens table for persisting color system changes
CREATE TABLE IF NOT EXISTS public.color_tokens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  css_var text UNIQUE NOT NULL,
  value text NOT NULL,
  description text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.color_tokens ENABLE ROW LEVEL SECURITY;

-- Allow everyone to view color tokens
CREATE POLICY "Color tokens are viewable by everyone"
  ON public.color_tokens
  FOR SELECT
  USING (true);

-- Allow authenticated users to manage color tokens
CREATE POLICY "Color tokens can be managed by authenticated users"
  ON public.color_tokens
  FOR ALL
  USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);

-- Add trigger for updated_at
CREATE TRIGGER update_color_tokens_updated_at
  BEFORE UPDATE ON public.color_tokens
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();