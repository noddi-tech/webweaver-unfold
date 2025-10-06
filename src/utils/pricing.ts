/**
 * Pricing model for Noddi's revenue-based take-rate system.
 * 
 * ══════════════════════════════════════════════════════════════════════════════
 * SINGLE-TIER FLAT RATE SYSTEM
 * ══════════════════════════════════════════════════════════════════════════════
 * 
 * How it works:
 * 1. Total combined revenue (Garage + Shop + Mobile) determines ONE tier (1-10)
 * 2. Each service is charged at its FLAT RATE for that tier
 * 3. Rates decrease as you move up tiers using a cooldown formula:
 *    Rate(tier) = baseRate × (1 - cooldown)^(tier-1)
 * 
 * Important: NOT a progressive/marginal tax system - the entire revenue for 
 * each service is charged at the tier's flat rate.
 * 
 * Service Rates:
 * - Garage: 4.00% base, 15% cooldown (T1-T5), 10% cooldown (T6-T10) → [4.00%, 3.40%, 2.89%, 2.46%, 2.09%, 1.88%, 1.69%, 1.52%, 1.37%, 1.23%]
 * - Shop: 5.00% base, 15% cooldown (T1-T5), 10% cooldown (T6-T10) → [5.00%, 4.25%, 3.61%, 3.07%, 2.61%, 2.35%, 2.11%, 1.90%, 1.71%, 1.54%]
 * - Mobile: 10.00% base, 15% cooldown (T1-T5), 10% cooldown (T6-T10) → [10.00%, 8.50%, 7.23%, 6.14%, 5.22%, 4.70%, 4.23%, 3.81%, 3.43%, 3.08%]
 * 
 * **INPUT ASSUMPTION:** All revenue inputs are expected to be **annual revenue in EUR**.
 * 
 * See pricingHelpers.ts for tier boundaries and example scenarios.
 */

// Constants derived from the pricing spreadsheet
const INITIAL_SPAN = 100_000; // revenue span for the first tier (EUR)
const RANGE_MULTIPLIER = 2.5; // each subsequent tier is 2.5× larger

// Contract discounts: monthly subscribers get 10% off, yearly subscribers get 20% off.
const CONTRACT_DISCOUNT_MONTHLY = 0.10;
const CONTRACT_DISCOUNT_YEARLY = 0.20;

// Service‑specific base rates (exported for display purposes)
export const GARAGE_BASE_RATE = 0.04; // 4% on the first revenue tier
export const MOBILE_BASE_RATE = 0.10; // 10% on the first revenue tier
export const SHOP_BASE_RATE = 0.05;  // 5% on the first revenue tier

/**
 * Representation of a revenue range with an associated take‑rate.
 * 
 * Note: This interface is kept for backward compatibility but the 
 * generateRanges function below is no longer used in the current pricing model.
 */
interface RevenueRange {
  start: number;
  end: number;   // Infinity for the last range
  rate: number;  // percentage as a decimal (e.g. 0.032 for 3.2%)
}

/**
 * DEPRECATED: This function is not used in the current flat-rate tier system.
 * 
 * Previously generated progressive revenue ranges with decreasing rates,
 * but the current model uses a simpler tier detection with flat rates per tier.
 * 
 * Kept for reference only - see detectCurrentTier() and getRateForTier() instead.
 * 
 * @param baseRate      Starting take‑rate for tier 1 (e.g., 0.04 = 4%)
 * @param cooldown      Fractional reduction per tier (e.g., 0.2 = 20% reduction)
 * @param initialSpan   Size of tier 1 in revenue units (default: 100,000 EUR)
 * @param multiplier    Multiplier for subsequent tier spans (default: 2.5)
 * @param numRanges     Number of tiers to generate (default: 10)
 */
function generateRanges(
  baseRate: number,
  cooldown: number,
  initialSpan: number = INITIAL_SPAN,
  multiplier: number = RANGE_MULTIPLIER,
  numRanges = 10,
): RevenueRange[] {
  const ranges: RevenueRange[] = [];
  let span = initialSpan;
  let rate = baseRate;
  let start = 0;
  for (let i = 0; i < numRanges; i++) {
    const end = i === numRanges - 1 ? Infinity : start + span;
    ranges.push({ start, end, rate });
    start = end;
    span *= multiplier;
    rate = parseFloat((rate * (1 - cooldown)).toFixed(10));
  }
  return ranges;
}

/**
 * Detect which tier a given total revenue falls into (1-10).
 * Uses the same logic as the tier boundaries to compute on-the-fly.
 * 
 * Note: This function is also exported from pricingHelpers.ts for convenience
 * in UI components. Both implementations use identical logic.
 * 
 * Tier boundaries (approximate):
 * - Tier 1: €0 - €100k
 * - Tier 2: €100k - €350k
 * - Tier 3: €350k - €1.225M
 * - Tier 4: €1.225M - €4.289M
 * - Tier 5: €4.289M - €15.01M
 * - Tier 6: €15.01M - €52.54M
 * - Tier 7: €52.54M - €183.9M
 * - Tier 8: €183.9M - €643.6M
 * - Tier 9: €643.6M - €2.253B
 * - Tier 10: €2.253B+
 */
function detectCurrentTier(totalRevenue: number): number {
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
 * Calculate the flat rate for a service at a given tier.
 * Uses dual cooldown structure:
 * - Tiers 1-5: 15% cooldown
 * - Tiers 6-10: 10% cooldown
 */
export function getRateForTier(baseRate: number, tier: number): number {
  if (tier <= 5) {
    // Tiers 1-5: 15% cooldown
    return baseRate * Math.pow(1 - 0.15, tier - 1);
  } else {
    // Tiers 6-10: 10% cooldown
    // First calculate tier 5 rate, then apply 10% cooldown for remaining tiers
    const tier5Rate = baseRate * Math.pow(1 - 0.15, 4);
    return tier5Rate * Math.pow(1 - 0.10, tier - 5);
  }
}

export interface PricingResult {
  usage: { garage: number; shop: number; mobile: number };
  total: number;
  effectiveRate: number;
  discount: number;
  garageCost: number;
  shopCost: number;
  mobileCost: number;
  tier: number;
}

/**
 * Compute the pricing breakdown for the provided annual revenues.
 * 
 * **IMPORTANT:** All revenue inputs should be **annual revenue in EUR**.
 * 
 * This function calculates usage fees for garage, shop and mobile services.
 * The take‑rates already include all costs—there is no separate licence fee.
 * Optionally, a contract discount is applied to the usage fees. The `contractType`
 * option specifies whether no contract (`'none'`), a monthly contract (`'monthly'`)
 * or a yearly contract (`'yearly'`) discount should be applied. Monthly contracts
 * receive a 10% discount and yearly contracts receive a 20% discount.
 *
 * @param revenues An object containing annual revenue for each service (in EUR)
 * @param options  Additional options:
 *                 - includeMobile: whether to include the mobile service in the calculation.
 *                 - contractType: 'none', 'monthly' or 'yearly' to apply no discount,
 *                   a 10% discount or a 20% discount, respectively.
 * @returns Pricing breakdown with usage, total costs, effective rate, and discount amount
 */
export function calculatePricing(
  revenues: { garage: number; shop: number; mobile: number },
  options: { includeMobile?: boolean; contractType?: 'none' | 'monthly' | 'yearly' } = {},
): PricingResult {
  const { includeMobile = true, contractType = 'none' } = options;
  
  // Determine the discount factor based on the contract type.
  let discount = 0;
  if (contractType === 'monthly') discount = CONTRACT_DISCOUNT_MONTHLY;
  else if (contractType === 'yearly') discount = CONTRACT_DISCOUNT_YEARLY;
  const discountFactor = 1 - discount;

  // Calculate total revenue to determine the tier
  const totalRevenue = revenues.garage + revenues.shop + (includeMobile ? revenues.mobile : 0);
  
  // Determine the single tier based on total revenue
  const tier = detectCurrentTier(totalRevenue);
  
  // Get the flat rate for each service at this tier
  const garageRate = getRateForTier(GARAGE_BASE_RATE, tier);
  const shopRate = getRateForTier(SHOP_BASE_RATE, tier);
  const mobileRate = getRateForTier(MOBILE_BASE_RATE, tier);
  
  // Calculate usage costs by applying the flat rate to each service's revenue
  const garageUsage = revenues.garage * garageRate * discountFactor;
  const shopUsage = revenues.shop * shopRate * discountFactor;
  const mobileUsage = includeMobile ? revenues.mobile * mobileRate * discountFactor : 0;

  const totalUsage = garageUsage + shopUsage + mobileUsage;
  const total = totalUsage; // No separate licence component
  
  // Calculate effective rate (total cost as % of total revenue)
  const effectiveRate = totalRevenue > 0 ? (total / totalRevenue) * 100 : 0;
  
  // Calculate discount amount saved (usage only, no licence)
  const totalWithoutDiscount = (garageUsage + shopUsage + mobileUsage) / discountFactor;
  const discountAmount = totalWithoutDiscount - total;

  return {
    usage: {
      garage: garageUsage,
      shop: shopUsage,
      mobile: mobileUsage,
    },
    total,
    effectiveRate,
    discount: discountAmount,
    garageCost: garageUsage,
    shopCost: shopUsage,
    mobileCost: mobileUsage,
    tier,
  };
}
