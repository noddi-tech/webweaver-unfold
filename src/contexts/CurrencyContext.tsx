import { createContext, useContext, useState, useEffect, useMemo, ReactNode } from 'react';
import { CURRENCY_RATES, CURRENCY_SYMBOLS } from '@/config/newPricing';

export interface CurrencyConfig {
  code: string;
  symbol: string;
  conversionRate: number;
  locale: string;
}

interface CurrencyContextType {
  currency: string;
  setCurrency: (currency: string) => void;
  config: CurrencyConfig;
  convertAmount: (amountEUR: number) => number;
  formatAmount: (amountEUR: number, showDecimals?: boolean) => string;
  formatAmountWithSpaces: (amountEUR: number, showDecimals?: boolean) => string;
  formatRevenue: (amountEUR: number) => string;
}

const STORAGE_KEY = 'navio-pricing-currency';

const CURRENCY_LOCALES: Record<string, string> = {
  EUR: 'de-DE',
  NOK: 'nb-NO',
  SEK: 'sv-SE',
  USD: 'en-US',
  GBP: 'en-GB'
};

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [currency, setCurrencyState] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(STORAGE_KEY) || 'EUR';
    }
    return 'EUR';
  });

  const setCurrency = (newCurrency: string) => {
    setCurrencyState(newCurrency);
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, newCurrency);
    }
  };

  const config: CurrencyConfig = useMemo(() => ({
    code: currency,
    symbol: CURRENCY_SYMBOLS[currency] || '€',
    conversionRate: CURRENCY_RATES[currency] || 1,
    locale: CURRENCY_LOCALES[currency] || 'en-US'
  }), [currency]);

  const convertAmount = (amountEUR: number): number => {
    return amountEUR * config.conversionRate;
  };

  const formatAmount = (amountEUR: number, showDecimals: boolean = false): string => {
    const converted = convertAmount(amountEUR);
    
    const formatter = new Intl.NumberFormat(config.locale, {
      style: 'currency',
      currency: config.code,
      minimumFractionDigits: showDecimals ? 2 : 0,
      maximumFractionDigits: showDecimals ? 2 : 0
    });
    
    return formatter.format(converted);
  };

  // Format with space as thousands separator (European style: 7 000 000)
  const formatAmountWithSpaces = (amountEUR: number, showDecimals: boolean = false): string => {
    const converted = convertAmount(amountEUR);
    
    // Use fr-FR locale which uses space as thousands separator
    const numberPart = new Intl.NumberFormat('fr-FR', {
      minimumFractionDigits: showDecimals ? 2 : 0,
      maximumFractionDigits: showDecimals ? 2 : 0
    }).format(converted);
    
    return `${numberPart} ${config.symbol}`;
  };

  const formatRevenue = (amountEUR: number): string => {
    const converted = convertAmount(amountEUR);
    const symbol = config.symbol;
    
    if (converted >= 1_000_000_000) {
      return `${symbol}${(converted / 1_000_000_000).toFixed(1)}B`;
    }
    if (converted >= 1_000_000) {
      return `${symbol}${(converted / 1_000_000).toFixed(1)}M`;
    }
    if (converted >= 1_000) {
      return `${symbol}${(converted / 1_000).toFixed(0)}K`;
    }
    return `${symbol}${converted.toFixed(0)}`;
  };

  const value: CurrencyContextType = {
    currency,
    setCurrency,
    config,
    convertAmount,
    formatAmount,
    formatAmountWithSpaces,
    formatRevenue
  };

  return (
    <CurrencyContext.Provider value={value}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency(): CurrencyContextType {
  const context = useContext(CurrencyContext);
  if (context === undefined) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
}

// Export supported currencies for dropdown
export const SUPPORTED_CURRENCIES = [
  { code: 'EUR', name: 'Euro', flag: 'EU' },
  { code: 'NOK', name: 'Norwegian Krone', flag: 'NO' },
  { code: 'SEK', name: 'Swedish Krona', flag: 'SE' },
  { code: 'USD', name: 'US Dollar', flag: 'US' },
  { code: 'GBP', name: 'British Pound', flag: 'GB' }
];
