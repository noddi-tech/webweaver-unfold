-- Add new format and metric fields to USPs
ALTER TABLE public.usps
  ADD COLUMN IF NOT EXISTS format text NOT NULL DEFAULT 'usp';

ALTER TABLE public.usps
  ADD COLUMN IF NOT EXISTS metric_value text;

ALTER TABLE public.usps
  ADD COLUMN IF NOT EXISTS metric_description text;
