// New Pricing Calculator for Launch and Scale tiers
import { LAUNCH_CONFIG, SCALE_CONFIG, generateScaleTiers, type ScaleTier, type LaunchConfig, type ScaleConfig } from '@/config/newPricing';

export interface LaunchPricingResult {
  type: 'launch';
  fixedCostMonthly: number;
  fixedCostYearly: number;
  revenueCost: number;
  totalMonthly: number;
  totalYearly: number;
  effectiveRate: number;
}

export interface ScalePricingResult {
  type: 'scale';
  tier: number;
  tierTakeRate: number;
  fixedCostMonthly: number;
  perDepartmentCostMonthly: number;
  totalFixedMonthly: number;
  totalFixedYearly: number;
  revenueCost: number;
  totalYearly: number;
  effectiveRate: number;
  numberOfDepartments: number;
}

export interface PricingComparison {
  launch: LaunchPricingResult;
  scale: ScalePricingResult;
  recommendation: 'launch' | 'scale';
  savingsAmount: number;
  savingsPercentage: number;
}

// Calculate Launch tier pricing
export function calculateLaunchPricing(
  annualRevenue: number,
  config: LaunchConfig = LAUNCH_CONFIG
): LaunchPricingResult {
  const fixedCostMonthly = config.fixedMonthly;
  const fixedCostYearly = fixedCostMonthly * 12;
  const revenueCost = annualRevenue * config.revenuePercentage;
  const totalYearly = fixedCostYearly + revenueCost;
  const totalMonthly = totalYearly / 12;
  const effectiveRate = annualRevenue > 0 ? (totalYearly / annualRevenue) * 100 : 0;
  
  return {
    type: 'launch',
    fixedCostMonthly,
    fixedCostYearly,
    revenueCost,
    totalMonthly,
    totalYearly,
    effectiveRate
  };
}

// Detect which Scale tier based on annual revenue
export function detectScaleTier(
  annualRevenue: number,
  tiers: ScaleTier[] = generateScaleTiers()
): { tier: number; takeRate: number } {
  // Find the highest tier where revenue exceeds threshold
  let selectedTier = tiers[0];
  
  for (const tier of tiers) {
    if (annualRevenue >= tier.revenueThreshold) {
      selectedTier = tier;
    } else {
      break;
    }
  }
  
  return {
    tier: selectedTier.tier,
    takeRate: selectedTier.takeRate
  };
}

// Calculate Scale tier pricing
export function calculateScalePricing(
  annualRevenue: number,
  numberOfDepartments: number,
  config: ScaleConfig = SCALE_CONFIG,
  tiers: ScaleTier[] = generateScaleTiers()
): ScalePricingResult {
  const { tier, takeRate } = detectScaleTier(annualRevenue, tiers);
  
  const fixedCostMonthly = config.fixedMonthly;
  const perDepartmentCostMonthly = config.perDepartment * numberOfDepartments;
  const totalFixedMonthly = fixedCostMonthly + perDepartmentCostMonthly;
  const totalFixedYearly = totalFixedMonthly * 12;
  const revenueCost = annualRevenue * takeRate;
  const totalYearly = totalFixedYearly + revenueCost;
  const effectiveRate = annualRevenue > 0 ? (totalYearly / annualRevenue) * 100 : 0;
  
  return {
    type: 'scale',
    tier,
    tierTakeRate: takeRate,
    fixedCostMonthly,
    perDepartmentCostMonthly,
    totalFixedMonthly,
    totalFixedYearly,
    revenueCost,
    totalYearly,
    effectiveRate,
    numberOfDepartments
  };
}

// Compare Launch vs Scale and recommend best option
export function comparePricing(
  annualRevenue: number,
  numberOfDepartments: number,
  launchConfig: LaunchConfig = LAUNCH_CONFIG,
  scaleConfig: ScaleConfig = SCALE_CONFIG,
  scaleTiers: ScaleTier[] = generateScaleTiers()
): PricingComparison {
  const launch = calculateLaunchPricing(annualRevenue, launchConfig);
  const scale = calculateScalePricing(annualRevenue, numberOfDepartments, scaleConfig, scaleTiers);
  
  const recommendation = launch.totalYearly <= scale.totalYearly ? 'launch' : 'scale';
  const cheaperCost = Math.min(launch.totalYearly, scale.totalYearly);
  const expensiveCost = Math.max(launch.totalYearly, scale.totalYearly);
  const savingsAmount = expensiveCost - cheaperCost;
  const savingsPercentage = expensiveCost > 0 ? (savingsAmount / expensiveCost) * 100 : 0;
  
  return {
    launch,
    scale,
    recommendation,
    savingsAmount,
    savingsPercentage
  };
}

// Format currency with proper symbol and locale
export function formatPricingCurrency(
  amount: number,
  currency: string = 'EUR',
  conversionRate: number = 1
): string {
  const convertedAmount = amount * conversionRate;
  
  const formatter = new Intl.NumberFormat('en-EU', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  });
  
  return formatter.format(convertedAmount);
}

// Format percentage
export function formatPercentage(value: number, decimals: number = 2): string {
  return `${value.toFixed(decimals)}%`;
}

// Format large numbers with abbreviations
export function formatRevenue(amount: number): string {
  if (amount >= 1_000_000_000) {
    return `€${(amount / 1_000_000_000).toFixed(1)}B`;
  }
  if (amount >= 1_000_000) {
    return `€${(amount / 1_000_000).toFixed(1)}M`;
  }
  if (amount >= 1_000) {
    return `€${(amount / 1_000).toFixed(0)}K`;
  }
  return `€${amount.toFixed(0)}`;
}
