-- Add show_in_switcher column to languages table
ALTER TABLE languages 
ADD COLUMN show_in_switcher BOOLEAN NOT NULL DEFAULT true;

COMMENT ON COLUMN languages.show_in_switcher IS 'Controls whether language appears in header/footer language switchers';