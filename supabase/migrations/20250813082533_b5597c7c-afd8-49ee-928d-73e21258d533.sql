-- Add tab visibility settings to contact_settings table
ALTER TABLE public.contact_settings 
ADD COLUMN show_contact_methods_tab boolean NOT NULL DEFAULT true,
ADD COLUMN show_business_hours_tab boolean NOT NULL DEFAULT true;