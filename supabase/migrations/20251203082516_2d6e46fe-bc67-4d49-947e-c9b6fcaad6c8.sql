-- Add cta_button_url column to header_settings
ALTER TABLE header_settings ADD COLUMN IF NOT EXISTS cta_button_url TEXT DEFAULT '/auth';

-- Enable show_auth_buttons
UPDATE header_settings SET show_auth_buttons = true;