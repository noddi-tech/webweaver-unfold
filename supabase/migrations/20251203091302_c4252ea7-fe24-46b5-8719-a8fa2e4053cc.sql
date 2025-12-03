-- Add granular visibility controls for auth buttons
ALTER TABLE header_settings 
ADD COLUMN show_sign_in_button BOOLEAN DEFAULT true,
ADD COLUMN show_sign_up_button BOOLEAN DEFAULT true;