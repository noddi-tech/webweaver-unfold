import { getCurrencyConfig } from '@/config/pricing';

/**
 * Format a number as currency using the specified currency code.
 * 
 * @param amount - The amount to format
 * @param currencyCode - The currency code (e.g., 'EUR', 'NOK')
 * @param options - Additional formatting options
 * @returns Formatted currency string
 */
export function formatCurrency(
  amount: number,
  currencyCode: string = 'EUR',
  options: { compact?: boolean; maximumFractionDigits?: number } = {}
): string {
  const config = getCurrencyConfig(currencyCode);
  const { compact = false, maximumFractionDigits = 0 } = options;

  const formatter = new Intl.NumberFormat(config.locale, {
    style: 'currency',
    currency: config.code,
    maximumFractionDigits,
    ...(compact && amount >= 1000 ? { notation: 'compact' } : {}),
  });

  return formatter.format(amount);
}

/**
 * Format a number as a compact currency string (e.g., €1.2M).
 * 
 * @param amount - The amount to format
 * @param currencyCode - The currency code
 * @returns Compact formatted currency string
 */
export function formatCompactCurrency(amount: number, currencyCode: string = 'EUR'): string {
  return formatCurrency(amount, currencyCode, { compact: true });
}

/**
 * Format a number as a percentage with specified decimal places.
 * 
 * @param value - The decimal value (e.g., 0.15 for 15%)
 * @param decimals - Number of decimal places
 * @returns Formatted percentage string
 */
export function formatPercentage(value: number, decimals: number = 1): string {
  return `${(value * 100).toFixed(decimals)}%`;
}
