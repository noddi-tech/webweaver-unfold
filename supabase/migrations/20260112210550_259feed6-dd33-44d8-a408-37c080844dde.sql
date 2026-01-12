-- Add base_revenue_threshold column to pricing_tiers_config for Scale tier calculations
ALTER TABLE public.pricing_tiers_config 
ADD COLUMN IF NOT EXISTS base_revenue_threshold DECIMAL(15,2) DEFAULT 1000000;

-- Update Scale tier to have the base revenue threshold
UPDATE public.pricing_tiers_config 
SET base_revenue_threshold = 1000000 
WHERE tier_type = 'scale';