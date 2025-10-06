import * as Flags from 'country-flag-icons/react/3x2';

interface CurrencyFlagProps {
  currency: string;
  className?: string;
}

// Map currency codes to country codes for flags
const CURRENCY_TO_COUNTRY: Record<string, keyof typeof Flags> = {
  EUR: 'EU',
  USD: 'US',
  GBP: 'GB',
  SEK: 'SE',
  DKK: 'DK',
  NOK: 'NO',
  CHF: 'CH',
  PLN: 'PL',
};

export function CurrencyFlag({ currency, className = "w-4 h-3" }: CurrencyFlagProps) {
  const countryCode = CURRENCY_TO_COUNTRY[currency];
  
  if (!countryCode) return null;
  
  const FlagComponent = Flags[countryCode];
  
  if (!FlagComponent) return null;
  
  return <FlagComponent className={className} />;
}
