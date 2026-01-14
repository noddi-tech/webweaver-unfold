-- Add lead_id column to pricing_offers to link offers to leads
ALTER TABLE public.pricing_offers 
ADD COLUMN IF NOT EXISTS lead_id UUID REFERENCES public.leads(id) ON DELETE SET NULL;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_pricing_offers_lead_id ON public.pricing_offers(lead_id);