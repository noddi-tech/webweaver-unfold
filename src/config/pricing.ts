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
  conversionRate: number; // Rate from EUR (EUR = 1.0)
}

export const SUPPORTED_CURRENCIES: Record<string, CurrencyConfig> = {
  EUR: {
    code: 'EUR',
    symbol: '€',
    locale: 'en-IE',
    maxRevenue: 40_000_000,
    name: 'Euro',
    conversionRate: 1.0, // Base currency
  },
  USD: {
    code: 'USD',
    symbol: '$',
    locale: 'en-US',
    maxRevenue: 44_000_000, // 40M EUR * 1.10
    name: 'US Dollar',
    conversionRate: 1.10,
  },
  GBP: {
    code: 'GBP',
    symbol: '£',
    locale: 'en-GB',
    maxRevenue: 34_000_000, // 40M EUR * 0.85
    name: 'British Pound',
    conversionRate: 0.85,
  },
  SEK: {
    code: 'SEK',
    symbol: 'kr',
    locale: 'sv-SE',
    maxRevenue: 460_000_000, // 40M EUR * 11.5
    name: 'Swedish Krona',
    conversionRate: 11.5,
  },
  DKK: {
    code: 'DKK',
    symbol: 'kr',
    locale: 'da-DK',
    maxRevenue: 298_000_000, // 40M EUR * 7.45
    name: 'Danish Krone',
    conversionRate: 7.45,
  },
  NOK: {
    code: 'NOK',
    symbol: 'kr',
    locale: 'nb-NO',
    maxRevenue: 460_000_000, // 40M EUR * 11.5
    name: 'Norwegian Krone',
    conversionRate: 11.5,
  },
  CHF: {
    code: 'CHF',
    symbol: 'Fr',
    locale: 'de-CH',
    maxRevenue: 38_000_000, // 40M EUR * 0.95
    name: 'Swiss Franc',
    conversionRate: 0.95,
  },
  PLN: {
    code: 'PLN',
    symbol: 'zł',
    locale: 'pl-PL',
    maxRevenue: 172_000_000, // 40M EUR * 4.30
    name: 'Polish Zloty',
    conversionRate: 4.30,
  },
};

export const DEFAULT_CURRENCY = 'EUR';

export function getCurrencyConfig(currencyCode: string = DEFAULT_CURRENCY): CurrencyConfig {
  return SUPPORTED_CURRENCIES[currencyCode] || SUPPORTED_CURRENCIES[DEFAULT_CURRENCY];
}
