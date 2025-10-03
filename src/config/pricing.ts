/**
 * Pricing configuration for multi-currency support.
 * Allows easy switching between EUR, NOK, and other currencies.
 */

export interface CurrencyConfig {
  code: string;
  symbol: string;
  locale: string;
  maxRevenue: number;
  name: string;
}

export const SUPPORTED_CURRENCIES: Record<string, CurrencyConfig> = {
  EUR: {
    code: 'EUR',
    symbol: '€',
    locale: 'en-IE',
    maxRevenue: 40_000_000,
    name: 'Euro',
  },
  NOK: {
    code: 'NOK',
    symbol: 'kr',
    locale: 'nb-NO',
    maxRevenue: 400_000_000,
    name: 'Norwegian Krone',
  },
};

export const DEFAULT_CURRENCY = 'EUR';

export function getCurrencyConfig(currencyCode: string = DEFAULT_CURRENCY): CurrencyConfig {
  return SUPPORTED_CURRENCIES[currencyCode] || SUPPORTED_CURRENCIES[DEFAULT_CURRENCY];
}
