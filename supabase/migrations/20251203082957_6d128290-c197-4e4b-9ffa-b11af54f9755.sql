-- Add sign_up_url column
ALTER TABLE header_settings 
ADD COLUMN sign_up_url TEXT DEFAULT '/auth?tab=signup';

-- Rename cta_button_url to sign_in_url for clarity
ALTER TABLE header_settings 
RENAME COLUMN cta_button_url TO sign_in_url;

-- Insert translation keys for auth buttons
INSERT INTO translations (language_code, translation_key, translated_text, approved, context, page_location)
VALUES 
  ('en', 'header.sign_in', 'Sign In', true, 'Header authentication button for existing users', 'header'),
  ('en', 'header.sign_up', 'Sign Up', true, 'Header authentication button for new users', 'header')
ON CONFLICT (language_code, translation_key) DO NOTHING;