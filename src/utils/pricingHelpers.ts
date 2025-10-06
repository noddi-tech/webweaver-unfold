/**
 * NODDI PRICING MODEL - Helper functions and reference data
 * 
 * ══════════════════════════════════════════════════════════════════════════════
 * PRICING MODEL OVERVIEW
 * ══════════════════════════════════════════════════════════════════════════════
 * 
 * Single-Tier Flat Rate System:
 * - Total combined revenue (Garage + Shop + Mobile) determines ONE tier (1-10)
 * - Each service is then charged at its FLAT RATE for that tier
 * - NOT progressive/marginal - the entire revenue for each service is charged 
 *   at the tier's flat rate
 * 
 * Rate Calculation:
 * - Each service has a base rate (Tier 1) and a cooldown percentage
 * - Rate for tier N = baseRate × (1 - cooldown)^(N-1)
 * - Garage: 4.00% base, 20% cooldown per tier
 * - Shop: 5.00% base, 15% cooldown per tier
 * - Mobile: 10.00% base, 15% cooldown per tier
 * 
 * ══════════════════════════════════════════════════════════════════════════════
 * EXAMPLE SCENARIOS
 * ══════════════════════════════════════════════════════════════════════════════
 * 
 * Example 1: €15M total revenue = Tier 6
 * - €5M Garage revenue × 1.31% = €65,536
 * - €5M Shop revenue × 2.22% = €110,926
 * - €5M Mobile revenue × 4.44% = €221,853
 * - Total annual cost: €398,315 (2.66% effective rate)
 * 
 * Example 2: €100k total revenue = Tier 1
 * - €50k Garage revenue × 4.00% = €2,000
 * - €50k Shop revenue × 5.00% = €2,500
 * - Total annual cost: €4,500 (4.50% effective rate)
 * 
 * Example 3: €80M total revenue = Tier 8
 * - €40M Garage revenue × 0.84% = €335,544
 * - €30M Shop revenue × 1.60% = €481,498
 * - €10M Mobile revenue × 3.21% = €320,999
 * - Total annual cost: €1,138,041 (1.42% effective rate)
 */

const INITIAL_SPAN = 100_000;
const RANGE_MULTIPLIER = 2.5;

/**
 * Complete rate table for all tiers and services.
 * Each service has a base rate that decreases by a cooldown % per tier.
 * 
 * Garage: 4.00% base, 20% cooldown per tier
 * Shop: 5.00% base, 15% cooldown per tier  
 * Mobile: 10.00% base, 15% cooldown per tier
 */
export const TIER_RATES = {
  garage: [4.00, 3.20, 2.56, 2.05, 1.64, 1.31, 1.05, 0.84, 0.67, 0.54],
  shop: [5.00, 4.25, 3.61, 3.07, 2.61, 2.22, 1.89, 1.60, 1.36, 1.16],
  mobile: [10.00, 8.50, 7.23, 6.14, 5.22, 4.44, 3.77, 3.21, 2.73, 2.32]
};

/**
 * Detect which tier a given total revenue falls into (1-10).
 * Tiers are defined by the cumulative revenue boundaries.
 * 
 * Tier boundaries (approximate):
 * - Tier 1: €0 - €100k
 * - Tier 2: €100k - €350k
 * - Tier 3: €350k - €1.225M
 * - Tier 4: €1.225M - €4.289M (≈€2.5M midpoint)
 * - Tier 5: €4.289M - €15.01M
 * - Tier 6: €15.01M - €52.54M
 * - Tier 7: €52.54M - €183.9M (≈€40M lower bound)
 * - Tier 8: €183.9M - €643.6M
 * - Tier 9: €643.6M - €2.253B
 * - Tier 10: €2.253B+
 */
export function detectCurrentTier(totalRevenue: number): number {
  let span = INITIAL_SPAN;
  let boundary = 0;
  
  for (let tier = 1; tier <= 10; tier++) {
    boundary += span;
    if (totalRevenue < boundary || tier === 10) {
      return tier;
    }
    span *= RANGE_MULTIPLIER;
  }
  
  return 10;
}

/**
 * Get a descriptive label for a tier.
 */
export function getTierLabel(tier: number): string {
  if (tier <= 4) return 'Emerging';
  if (tier <= 7) return 'Large';
  return 'Enterprise';
}

/**
 * Get color class for a tier badge.
 */
export function getTierColor(tier: number): string {
  if (tier <= 4) return 'bg-green-600 text-white border-green-700';
  if (tier <= 7) return 'bg-amber-500 text-white border-amber-600';
  return 'bg-gradient-primary text-primary-foreground border-primary';
}

/**
 * Example effective rates calculated for reference scenarios.
 */
export const EXAMPLE_RATES = {
  small: { revenue: 1_000_000, rate: 4.89 }, // €1M total
  large: { revenue: 10_000_000, rate: 2.87 }, // €10M total
  enterprise: { revenue: 80_000_000, rate: 1.42 }, // €80M total
};
