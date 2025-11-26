-- Add responsive font size columns to translations table
ALTER TABLE translations 
ADD COLUMN IF NOT EXISTS font_size_mobile TEXT DEFAULT 'base',
ADD COLUMN IF NOT EXISTS font_size_tablet TEXT DEFAULT 'base',
ADD COLUMN IF NOT EXISTS font_size_desktop TEXT DEFAULT 'base';

-- Add helpful comment
COMMENT ON COLUMN translations.font_size_mobile IS 'Font size for mobile viewports (<640px)';
COMMENT ON COLUMN translations.font_size_tablet IS 'Font size for tablet viewports (640px-1024px)';
COMMENT ON COLUMN translations.font_size_desktop IS 'Font size for desktop viewports (>1024px)';