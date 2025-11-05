-- Add text_color_class column to store the selected text color
ALTER TABLE background_styles 
ADD COLUMN IF NOT EXISTS text_color_class text;

-- Add comment for documentation
COMMENT ON COLUMN background_styles.text_color_class IS 
  'CSS class for text color (e.g., text-white, text-foreground) - ensures proper contrast with background_class';

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_background_styles_text_color ON background_styles(text_color_class);