/**
 * Helper functions for pricing calculations and tier detection.
 */

const INITIAL_SPAN = 100_000;
const RANGE_MULTIPLIER = 2.5;

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
