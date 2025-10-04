import { getCurrencyConfig, DEFAULT_CURRENCY } from '@/config/pricing';

/**
 * Convert an amount from EUR (base currency) to any target currency.
 * 
 * @param amountEUR - The amount in EUR (base currency)
 * @param targetCurrency - The target currency code (e.g., 'USD', 'GBP')
 * @returns The converted amount in the target currency
 */
export function convertFromEUR(amountEUR: number, targetCurrency: string = DEFAULT_CURRENCY): number {
  const config = getCurrencyConfig(targetCurrency);
  return amountEUR * config.conversionRate;
}

/**
 * Convert an amount from any source currency back to EUR (base currency).
 * Used for calculations that need to be performed in EUR.
 * 
 * @param amount - The amount in the source currency
 * @param sourceCurrency - The source currency code
 * @returns The converted amount in EUR
 */
export function convertToEUR(amount: number, sourceCurrency: string = DEFAULT_CURRENCY): number {
  const config = getCurrencyConfig(sourceCurrency);
  return amount / config.conversionRate;
}
