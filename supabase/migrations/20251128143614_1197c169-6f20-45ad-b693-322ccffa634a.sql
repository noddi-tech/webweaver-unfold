-- Add button URL and background color columns to text_content table
-- This enables CTA button customization in the component editor

ALTER TABLE public.text_content
ADD COLUMN IF NOT EXISTS button_url TEXT,
ADD COLUMN IF NOT EXISTS button_bg_color TEXT DEFAULT 'primary';