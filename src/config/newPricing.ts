// New Two-Tier Pricing Model Configuration
// Launch: Fixed + 3% revenue
// Scale: Fixed + per-department + tiered revenue

export interface LaunchConfig {
  fixedMonthly: number;
  revenuePercentage: number;
}

export interface ScaleConfig {
  fixedMonthly: number;
  perDepartment: number;
  baseTakeRate: number;
}

export interface ScaleTier {
  tier: number;
  revenueThreshold: number;
  takeRate: number;
  revenueMultiplier: number | null;
  rateReduction: number | null;
}

// Default Launch tier constants (can be overridden by DB)
export const LAUNCH_CONFIG: LaunchConfig = {
  fixedMonthly: 500,       // €500/month
  revenuePercentage: 0.03  // 3%
};

// Default Scale tier constants (can be overridden by DB)
export const SCALE_CONFIG: ScaleConfig = {
  fixedMonthly: 1000,      // €1,000/month
  perDepartment: 100,      // €100/department/month
  baseTakeRate: 0.015      // 1.5% starting rate
};

// Generate Scale tiers programmatically (fallback if DB not available)
export function generateScaleTiers(): ScaleTier[] {
  const tiers: ScaleTier[] = [];
  let revenue = 1_000_000; // Start at €1M
  let rate = 0.015;        // Start at 1.5%
  
  for (let i = 1; i <= 15; i++) {
    let multiplier: number | null = null;
    let reduction: number | null = null;
    
    if (i === 2) {
      multiplier = 2;
      reduction = 0.001; // -0.1%
    } else if (i === 3) {
      multiplier = 1.5;
      reduction = 0.001; // -0.1%
    } else if (i > 3) {
      multiplier = 1.5;
      reduction = 0.0005; // -0.05%
    }
    
    tiers.push({
      tier: i,
      revenueThreshold: revenue,
      takeRate: rate,
      revenueMultiplier: multiplier,
      rateReduction: reduction
    });
    
    // Calculate next tier
    if (i === 1) {
      revenue *= 2;        // Tier 1→2: ×2
      rate -= 0.001;       // -0.1%
    } else {
      revenue *= 1.5;      // Subsequent: ×1.5
      rate -= (i === 2) ? 0.001 : 0.0005;
    }
    
    // Ensure rate doesn't go below minimum
    rate = Math.max(rate, 0.007); // 0.7% minimum
  }
  
  return tiers;
}

// Currency conversion rates (EUR base)
export const CURRENCY_RATES: Record<string, number> = {
  EUR: 1,
  NOK: 11.5,
  SEK: 11.2,
  USD: 1.08,
  GBP: 0.86
};

export const CURRENCY_SYMBOLS: Record<string, string> = {
  EUR: '€',
  NOK: 'kr',
  SEK: 'kr',
  USD: '$',
  GBP: '£'
};
