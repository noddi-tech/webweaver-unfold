-- Add metric design/formatting fields to USPs
ALTER TABLE public.usps
  ADD COLUMN IF NOT EXISTS metric_style text NOT NULL DEFAULT 'card',
  ADD COLUMN IF NOT EXISTS metric_align text NOT NULL DEFAULT 'center',
  ADD COLUMN IF NOT EXISTS metric_value_size text NOT NULL DEFAULT 'xl',
  ADD COLUMN IF NOT EXISTS metric_emphasis text NOT NULL DEFAULT 'gradient',
  ADD COLUMN IF NOT EXISTS metric_suffix text NULL,
  ADD COLUMN IF NOT EXISTS metric_show_icon boolean NOT NULL DEFAULT true;