import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { LAUNCH_CONFIG, SCALE_CONFIG, generateScaleTiers, type LaunchConfig, type ScaleConfig, type ScaleTier } from '@/config/newPricing';

export interface PricingConfig {
  launch: LaunchConfig;
  scale: ScaleConfig;
  scaleTiers: ScaleTier[];
  isLoading: boolean;
  error: Error | null;
}

export function usePricingConfig(): PricingConfig {
  // Fetch Launch and Scale base config
  const { data: tiersConfig, isLoading: isLoadingTiers, error: tiersError } = useQuery({
    queryKey: ['pricing-tiers-config'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('pricing_tiers_config')
        .select('*')
        .eq('is_active', true);
      
      if (error) throw error;
      return data;
    },
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });
  
  // Fetch Scale revenue tiers
  const { data: scaleTiersData, isLoading: isLoadingScaleTiers, error: scaleTiersError } = useQuery({
    queryKey: ['pricing-scale-tiers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('pricing_scale_tiers')
        .select('*')
        .order('tier_number', { ascending: true });
      
      if (error) throw error;
      return data;
    },
    staleTime: 5 * 60 * 1000,
  });
  
  // Parse Launch config from DB or use defaults
  const launchConfig: LaunchConfig = (() => {
    const launchRow = tiersConfig?.find(t => t.tier_type === 'launch');
    if (launchRow) {
      return {
        fixedMonthly: Number(launchRow.fixed_monthly_cost),
        revenuePercentage: Number(launchRow.revenue_percentage)
      };
    }
    return LAUNCH_CONFIG;
  })();
  
  // Parse Scale config from DB or use defaults
  const scaleConfig: ScaleConfig = (() => {
    const scaleRow = tiersConfig?.find(t => t.tier_type === 'scale');
    if (scaleRow) {
      return {
        fixedMonthly: Number(scaleRow.fixed_monthly_cost),
        perDepartment: Number(scaleRow.per_department_cost),
        baseTakeRate: Number(scaleRow.revenue_percentage)
      };
    }
    return SCALE_CONFIG;
  })();
  
  // Parse Scale tiers from DB or use defaults
  const scaleTiers: ScaleTier[] = (() => {
    if (scaleTiersData && scaleTiersData.length > 0) {
      return scaleTiersData.map(t => ({
        tier: t.tier_number,
        revenueThreshold: Number(t.revenue_threshold),
        takeRate: Number(t.take_rate),
        revenueMultiplier: t.revenue_multiplier ? Number(t.revenue_multiplier) : null,
        rateReduction: t.rate_reduction ? Number(t.rate_reduction) : null
      }));
    }
    return generateScaleTiers();
  })();
  
  return {
    launch: launchConfig,
    scale: scaleConfig,
    scaleTiers,
    isLoading: isLoadingTiers || isLoadingScaleTiers,
    error: tiersError || scaleTiersError
  };
}
