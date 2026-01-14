-- Add currency columns to pricing_offers table
ALTER TABLE pricing_offers 
  ADD COLUMN IF NOT EXISTS currency TEXT DEFAULT 'EUR',
  ADD COLUMN IF NOT EXISTS conversion_rate NUMERIC DEFAULT 1;