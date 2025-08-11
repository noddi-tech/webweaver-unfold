-- Add accent icon support for text logos
-- New columns on brand_settings
ALTER TABLE public.brand_settings
  ADD COLUMN IF NOT EXISTS logo_icon_name TEXT NULL,
  ADD COLUMN IF NOT EXISTS logo_icon_position TEXT NOT NULL DEFAULT 'top-right',
  ADD COLUMN IF NOT EXISTS logo_icon_size TEXT NOT NULL DEFAULT 'default';