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
 * - Each service has a base rate (Tier 1) and dual cooldown structure
 * - Tiers 1-5: 15% cooldown per tier
 * - Tiers 6-10: 10% cooldown per tier (Garage/Shop), 5% cooldown per tier (Mobile)
 * - Garage: 4.00% base
 * - Shop: 5.00% base
 * - Mobile: 10.00% base
 * 
 * ══════════════════════════════════════════════════════════════════════════════
 * EXAMPLE SCENARIOS
 * ══════════════════════════════════════════════════════════════════════════════
 * 
 * Example 1: €15M total revenue = Tier 6
 * - €5M Garage revenue × 1.88% = €94,000
 * - €5M Shop revenue × 2.35% = €117,500
 * - €5M Mobile revenue × 4.96% = €248,000
 * - Total annual cost: €459,500 (3.06% effective rate)
 * 
 * Example 2: €100k total revenue = Tier 1
 * - €50k Garage revenue × 4.00% = €2,000
 * - €50k Shop revenue × 5.00% = €2,500
 * - Total annual cost: €4,500 (4.50% effective rate)
 * 
 * Example 3: €80M total revenue = Tier 8
 * - €40M Garage revenue × 1.52% = €608,000
 * - €30M Shop revenue × 1.90% = €570,000
 * - €10M Mobile revenue × 4.47% = €447,000
 * - Total annual cost: €1,625,000 (2.03% effective rate)
 */

const INITIAL_SPAN = 100_000;
const RANGE_MULTIPLIER = 2.5;

/**
 * Complete rate table for all tiers and services.
 * Dual cooldown structure:
 * - Tiers 1-5: 15% for all services
 * - Tiers 6-10: 10% for Garage/Shop, 5% for Mobile
 * 
 * Garage: 4.00% base
 * Shop: 5.00% base
 * Mobile: 10.00% base
 */
export const TIER_RATES = {
  garage: [4.00, 3.40, 2.89, 2.46, 2.09, 1.88, 1.69, 1.52, 1.37, 1.23],
  shop: [5.00, 4.25, 3.61, 3.07, 2.61, 2.35, 2.11, 1.90, 1.71, 1.54],
  mobile: [10.00, 8.50, 7.23, 6.14, 5.22, 4.96, 4.71, 4.47, 4.25, 4.04]
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
