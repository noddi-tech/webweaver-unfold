/**
 * Pricing calculation utilities for Noddi's revenue‑based pricing model.
 *
 * This module encapsulates the logic defined in the shared pricing sheet. It
 * generates revenue tiers on the fly based on a base take‑rate, a step
 * reduction (cooldown), an initial revenue span and a range multiplier. The
 * resulting ranges are then used to compute usage costs for garage, mobile
 * and shop services. The take‑rates include all costs—there is no separate
 * SaaS licence fee. Optional contract discounts are applied to the usage fees.
 *
 * **INPUT ASSUMPTION:** All revenue inputs are expected to be **annual revenue in EUR**.
 */

// Constants derived from the pricing spreadsheet
const INITIAL_SPAN = 100_000; // revenue span for the first tier (EUR)
const RANGE_MULTIPLIER = 2.5; // each subsequent tier is 2.5× larger

// Contract discounts: monthly subscribers get 15% off, yearly subscribers get 25% off.
const CONTRACT_DISCOUNT_MONTHLY = 0.15;
const CONTRACT_DISCOUNT_YEARLY = 0.25;

// Service‑specific base rates and cooldowns
const GARAGE_BASE_RATE = 0.04; // 4% on the first revenue tier
const GARAGE_COOLDOWN = 0.20;  // 20% reduction per tier

const MOBILE_BASE_RATE = 0.10; // 10% on the first revenue tier
const MOBILE_COOLDOWN = 0.15;  // 15% reduction per tier

const SHOP_BASE_RATE = 0.05;  // 5% on the first revenue tier
const SHOP_COOLDOWN = 0.15;   // 15% reduction per tier

/**
 * Representation of a revenue range with an associated take‑rate.
 */
interface RevenueRange {
  start: number;
  end: number;   // Infinity for the last range
  rate: number;  // percentage as a decimal (e.g. 0.032 for 3.2%)
}

/**
 * Generate an array of revenue ranges for a particular service.
 * 
 * **IMPORTANT: Tier 1 is billable. There is no free tier.**
 * - Tier 1: €0 - €100,000 charged at base rate (e.g., 4% for garage)
 * - Tier 2+: Spans increase by 2.5× with cooldown applied per tier
 * 
 * Each range covers a span of revenue and has its own take‑rate. The base rate
 * is reduced on each subsequent tier by the given cooldown factor. The final
 * range has an end of Infinity, meaning any revenue beyond the previous
 * tiers will be charged at the last rate.
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
    // Tier 1 (i=0) starts at 0 and is fully billable at baseRate.
    // No free tier exists.
    ranges.push({ start, end, rate });
    // prepare for next tier
    start = end;
    span *= multiplier;
    rate = parseFloat((rate * (1 - cooldown)).toFixed(10));
  }
  return ranges;
}

/**
 * Detect which tier a given total revenue falls into (1-10).
 * Tiers are defined by cumulative revenue boundaries.
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
 * Rate = baseRate * (1 - cooldown)^(tier - 1)
 */
function getRateForTier(baseRate: number, cooldown: number, tier: number): number {
  return baseRate * Math.pow(1 - cooldown, tier - 1);
}

export interface PricingResult {
  usage: { garage: number; shop: number; mobile: number };
  total: number;
  effectiveRate: number;
  discount: number;
  garageCost: number;
  shopCost: number;
  mobileCost: number;
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
 * receive a 15% discount and yearly contracts receive a 25% discount.
 *
 * @param revenues An object containing annual revenue for each service (in EUR)
 * @param options  Additional options:
 *                 - includeMobile: whether to include the mobile service in the calculation.
 *                 - contractType: 'none', 'monthly' or 'yearly' to apply no discount,
 *                   a 15% discount or a 25% discount, respectively.
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
  const garageRate = getRateForTier(GARAGE_BASE_RATE, GARAGE_COOLDOWN, tier);
  const shopRate = getRateForTier(SHOP_BASE_RATE, SHOP_COOLDOWN, tier);
  const mobileRate = getRateForTier(MOBILE_BASE_RATE, MOBILE_COOLDOWN, tier);
  
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
  };
}
