-- Add reminder tracking columns to pricing_offers for expiration notifications
ALTER TABLE public.pricing_offers 
ADD COLUMN IF NOT EXISTS reminder_7_sent_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS reminder_3_sent_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS reminder_1_sent_at TIMESTAMP WITH TIME ZONE;