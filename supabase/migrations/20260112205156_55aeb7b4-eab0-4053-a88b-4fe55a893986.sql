-- Update Scale tiers 9-15 with 1.25x multiplier (instead of 1.5x)
-- Recalculate revenue thresholds based on tier 8 (€22,781,250) × 1.25 progression

UPDATE public.pricing_scale_tiers SET
  revenue_multiplier = 1.25,
  revenue_threshold = 28476563
WHERE tier_number = 9;

UPDATE public.pricing_scale_tiers SET
  revenue_multiplier = 1.25,
  revenue_threshold = 35595703
WHERE tier_number = 10;

UPDATE public.pricing_scale_tiers SET
  revenue_multiplier = 1.25,
  revenue_threshold = 44494629
WHERE tier_number = 11;

UPDATE public.pricing_scale_tiers SET
  revenue_multiplier = 1.25,
  revenue_threshold = 55618286
WHERE tier_number = 12;

UPDATE public.pricing_scale_tiers SET
  revenue_multiplier = 1.25,
  revenue_threshold = 69522858
WHERE tier_number = 13;

UPDATE public.pricing_scale_tiers SET
  revenue_multiplier = 1.25,
  revenue_threshold = 86903572
WHERE tier_number = 14;

UPDATE public.pricing_scale_tiers SET
  revenue_multiplier = 1.25,
  revenue_threshold = 108629466
WHERE tier_number = 15;