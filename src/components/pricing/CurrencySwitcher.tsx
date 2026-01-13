import { ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useCurrency, SUPPORTED_CURRENCIES } from '@/contexts/CurrencyContext';
import { CurrencyFlag } from '@/components/pricing/CurrencyFlag';

interface CurrencySwitcherProps {
  variant?: 'default' | 'compact';
  darkMode?: boolean;
  showLabel?: boolean;
  className?: string;
}

export function CurrencySwitcher({ 
  variant = 'default', 
  darkMode = false,
  showLabel = false,
  className = '' 
}: CurrencySwitcherProps) {
  const { currency, setCurrency } = useCurrency();
  
  const currentCurrency = SUPPORTED_CURRENCIES.find(c => c.code === currency) || SUPPORTED_CURRENCIES[0];

  return (
    <div className={showLabel ? 'flex flex-col gap-1' : ''}>
      {showLabel && (
        <span className={`text-xs font-medium ${darkMode ? 'text-primary-foreground/80' : 'text-muted-foreground'}`}>
          Change currency
        </span>
      )}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="outline" 
            size={variant === 'compact' ? 'sm' : 'default'}
            className={`gap-2 ${darkMode ? 'border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground' : ''} ${className}`}
          >
            <CurrencyFlag currency={currentCurrency.code} className="w-5 h-4" />
            <span className="font-medium">{currentCurrency.code}</span>
            <ChevronDown className={`w-4 h-4 ${darkMode ? 'opacity-70' : 'opacity-50'}`} />
          </Button>
        </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        {SUPPORTED_CURRENCIES.map((curr) => (
          <DropdownMenuItem
            key={curr.code}
            onClick={() => setCurrency(curr.code)}
            className={`gap-3 cursor-pointer ${currency === curr.code ? 'bg-primary/10' : ''}`}
          >
            <CurrencyFlag currency={curr.code} className="w-5 h-4" />
            <div className="flex flex-col">
              <span className="font-medium">{curr.code}</span>
              <span className="text-xs text-muted-foreground">{curr.name}</span>
            </div>
            {currency === curr.code && (
              <span className="ml-auto text-primary">✓</span>
            )}
          </DropdownMenuItem>
        ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
