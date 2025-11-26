-- Add text styling columns to translations table
ALTER TABLE translations ADD COLUMN IF NOT EXISTS color_token TEXT;
ALTER TABLE translations ADD COLUMN IF NOT EXISTS font_size TEXT DEFAULT 'base';
ALTER TABLE translations ADD COLUMN IF NOT EXISTS font_weight TEXT DEFAULT 'normal';
ALTER TABLE translations ADD COLUMN IF NOT EXISTS is_italic BOOLEAN DEFAULT false;
ALTER TABLE translations ADD COLUMN IF NOT EXISTS is_underline BOOLEAN DEFAULT false;

COMMENT ON COLUMN translations.color_token IS 'Text color token from color_tokens table (e.g., foreground, primary, success)';
COMMENT ON COLUMN translations.font_size IS 'Font size: xs, sm, base, lg, xl, 2xl, 3xl, 4xl, 5xl';
COMMENT ON COLUMN translations.font_weight IS 'Font weight: light, normal, medium, semibold, bold, extrabold';
COMMENT ON COLUMN translations.is_italic IS 'Whether text should be displayed in italic style';
COMMENT ON COLUMN translations.is_underline IS 'Whether text should be underlined';