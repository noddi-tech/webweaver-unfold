import { useState } from 'react';
import { Slider } from '@/components/ui/slider';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { formatCompactCurrency, formatCurrency } from '@/utils/formatCurrency';
import { convertFromEUR } from '@/utils/currencyConversion';
import { calculatePricing } from '@/utils/pricing';
import { ArrowRight, Info } from 'lucide-react';
import { CurrencyFlag } from './CurrencyFlag';

const getCurrencySymbol = (currency: string) => {
  const symbols: Record<string, string> = {
    EUR: '€', USD: '$', GBP: '£', SEK: 'kr',
    DKK: 'kr', NOK: 'kr', CHF: 'Fr', PLN: 'zł'
  };
  return symbols[currency] || currency;
};

interface PricingSliderProps {
  currency: string;
  onCurrencyChange: (currency: string) => void;
  contractType: 'none' | 'monthly' | 'yearly';
  onContractTypeChange: (type: 'none' | 'monthly' | 'yearly') => void;
  onOpenCalculator: () => void;
  textContent: any[];
}

// Logarithmic presets in EUR (source of truth)
// These are the ONLY values the slider can snap to
const PRESETS_EUR = [
  100_000,     // €100k - Very small
  500_000,     // €500k - Small
  2_000_000,   // €2M - Small-Medium
  5_000_000,   // €5M - Medium
  7_000_000,   // €7M - Medium
  10_000_000,  // €10M - Medium-Large
  15_000_000,  // €15M - Large
  20_000_000,  // €20M - Large
  40_000_000,  // €40M - Very Large
  60_000_000,  // €60M - Very Large
  80_000_000,  // €80M - Very Large
  100_000_000, // €100M - Enterprise
  200_000_000  // €200M - Enterprise
];

export function PricingSlider({ currency, onCurrencyChange, contractType, onContractTypeChange, onOpenCalculator, textContent }: PricingSliderProps) {
  // Default to index 2 (€2M preset)
  const [sliderValue, setSliderValue] = useState(2);
  
  const getCMSContent = (elementType: string, fallback: string) => {
    return textContent.find(tc => tc.element_type === elementType)?.content || fallback;
  };

  // Get preset revenue in EUR
  const revenueEUR = PRESETS_EUR[sliderValue];
  // Convert to selected currency for display
  const revenue = convertFromEUR(revenueEUR, currency);

  // Calculate estimated cost using simplified split (60/30/10)
  const estimatedRevenues = {
    garage: revenueEUR * 0.6,
    shop: revenueEUR * 0.3,
    mobile: revenueEUR * 0.1
  };

  // Calculate in EUR
  const resultEUR = calculatePricing(estimatedRevenues, { 
    includeMobile: true, 
    contractType 
  });

  // Convert all costs to target currency for display
  const result = {
    ...resultEUR,
    total: convertFromEUR(resultEUR.total, currency),
    garageCost: convertFromEUR(resultEUR.garageCost, currency),
    shopCost: convertFromEUR(resultEUR.shopCost, currency),
    mobileCost: convertFromEUR(resultEUR.mobileCost, currency),
  };

  // Calculate savings (cost without contract vs with contract)
  const resultWithoutContract = calculatePricing(estimatedRevenues, { 
    includeMobile: true, 
    contractType: 'none' 
  });
  const savingsEUR = resultWithoutContract.total - resultEUR.total;
  const savings = convertFromEUR(savingsEUR, currency);

  return (
    <Card className="liquid-glass p-6 md:p-8 max-w-4xl mx-auto">
      <div className="space-y-6">
        {/* Currency Selector */}
        <div className="space-y-3">
          <Label className="text-sm text-muted-foreground text-center block">
            {getCMSContent('label_currency', 'View pricing in:')}
          </Label>
          <Select value={currency} onValueChange={onCurrencyChange}>
            <SelectTrigger className="w-full">
              <SelectValue>
                <div className="flex items-center gap-2">
                  <CurrencyFlag currency={currency} className="w-4 h-3" />
                  <span>{currency} ({getCurrencySymbol(currency)})</span>
                </div>
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="EUR">
                <div className="flex items-center gap-2">
                  <CurrencyFlag currency="EUR" className="w-4 h-3" />
                  <span>EUR (€)</span>
                </div>
              </SelectItem>
              <SelectItem value="USD">
                <div className="flex items-center gap-2">
                  <CurrencyFlag currency="USD" className="w-4 h-3" />
                  <span>USD ($)</span>
                </div>
              </SelectItem>
              <SelectItem value="GBP">
                <div className="flex items-center gap-2">
                  <CurrencyFlag currency="GBP" className="w-4 h-3" />
                  <span>GBP (£)</span>
                </div>
              </SelectItem>
              <SelectItem value="SEK">
                <div className="flex items-center gap-2">
                  <CurrencyFlag currency="SEK" className="w-4 h-3" />
                  <span>SEK (kr)</span>
                </div>
              </SelectItem>
              <SelectItem value="DKK">
                <div className="flex items-center gap-2">
                  <CurrencyFlag currency="DKK" className="w-4 h-3" />
                  <span>DKK (kr)</span>
                </div>
              </SelectItem>
              <SelectItem value="NOK">
                <div className="flex items-center gap-2">
                  <CurrencyFlag currency="NOK" className="w-4 h-3" />
                  <span>NOK (kr)</span>
                </div>
              </SelectItem>
              <SelectItem value="CHF">
                <div className="flex items-center gap-2">
                  <CurrencyFlag currency="CHF" className="w-4 h-3" />
                  <span>CHF (Fr)</span>
                </div>
              </SelectItem>
              <SelectItem value="PLN">
                <div className="flex items-center gap-2">
                  <CurrencyFlag currency="PLN" className="w-4 h-3" />
                  <span>PLN (zł)</span>
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Revenue Display */}
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 flex-wrap">
            <h3 className="text-3xl md:text-4xl font-bold text-foreground">
              {getCMSContent('label_revenue', 'Revenue')}:
            </h3>
            <div className="text-3xl md:text-4xl font-bold text-foreground">
              {formatCompactCurrency(revenue, currency)}
            </div>
          </div>
        </div>

        {/* Slider with discrete snap points */}
        <div className="px-4">
          <Slider
            value={[sliderValue]}
            onValueChange={(value) => setSliderValue(value[0])}
            min={0}
            max={PRESETS_EUR.length - 1}
            step={1} // Force discrete steps - no in-between values
            className="cursor-pointer touch-none h-3 md:h-2"
            aria-label="Select revenue range"
          />
          <div className="flex justify-between text-xs text-muted-foreground mt-2">
            <span>{formatCompactCurrency(convertFromEUR(PRESETS_EUR[0], currency), currency)}</span>
            <span>{formatCompactCurrency(convertFromEUR(PRESETS_EUR[PRESETS_EUR.length - 1], currency), currency)}+</span>
          </div>
        </div>

        {/* Contract Type Selector */}
        <div className="space-y-3">
          <Label className="text-sm text-foreground">{getCMSContent('label_contract', 'Lock-in-period')}</Label>
          <ToggleGroup
            type="single"
            value={contractType}
            onValueChange={(value) => value && onContractTypeChange(value as 'none' | 'monthly' | 'yearly')}
            className="liquid-glass-tab rounded-lg p-1 w-full"
          >
            <ToggleGroupItem
              value="none"
              aria-label="No Contract"
              className="data-[state=on]:bg-primary data-[state=on]:text-primary-foreground flex-1 text-xs sm:text-sm px-2"
            >
              None
            </ToggleGroupItem>
            <ToggleGroupItem
              value="monthly"
              aria-label="Monthly Contract (Save 10%)"
              className="data-[state=on]:bg-primary data-[state=on]:text-primary-foreground flex-1 text-xs sm:text-sm px-2 flex items-center justify-center whitespace-nowrap"
            >
              Monthly <span className="hidden sm:inline text-xs ml-1 opacity-75 whitespace-nowrap">(Save 10%)</span>
              <span className="sm:hidden text-[10px] ml-0.5 opacity-75">-10%</span>
            </ToggleGroupItem>
            <ToggleGroupItem
              value="yearly"
              aria-label="Yearly Contract (Save 20%)"
              className="data-[state=on]:bg-primary data-[state=on]:text-primary-foreground flex-1 text-xs sm:text-sm px-2 flex items-center justify-center whitespace-nowrap"
            >
              Yearly <span className="hidden sm:inline text-xs ml-1 opacity-75 whitespace-nowrap">(Save 20%)</span>
              <span className="sm:hidden text-[10px] ml-0.5 opacity-75">-20%</span>
            </ToggleGroupItem>
          </ToggleGroup>
        </div>

        {/* Cost Preview */}
        <div className="bg-card/50 border border-border rounded-lg p-4 text-center">
          <div className="text-sm text-muted-foreground mb-1 glass-text-high-contrast">
            {getCMSContent('preview_label', 'Estimated annual cost:')}
          </div>
          <div className="grid gap-2 justify-items-center">
            <div className="text-2xl md:text-3xl font-bold text-foreground glass-text-large">
              {formatCurrency(result.total, currency)}
            </div>
            {contractType !== 'none' && savings > 0 && (
              <Badge className="bg-green-600/90 text-white hover:bg-green-600 border-green-500/20 text-sm">
                ↓ Save {formatCurrency(savings, currency)}
              </Badge>
            )}
          </div>
          <div className="text-sm text-muted-foreground mt-1">
            ≈ {result.effectiveRate.toFixed(2)}% effective rate
          </div>
        </div>

        {/* Link to Advanced Calculator */}
        <div className="text-center">
          <Button 
            variant="ghost" 
            className="accessible-focus group"
            onClick={onOpenCalculator}
            aria-label="Open advanced pricing calculator"
          >
            {getCMSContent('link_text', 'Calculate your full breakdown »')} 
            <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
          </Button>
        </div>

        {/* Clarifier Message */}
        <div className="bg-card/50 border border-border rounded-lg p-4 flex items-start gap-3">
          <Info className="w-5 h-5 text-foreground shrink-0 mt-0.5" />
          <p className="text-sm text-foreground">
            {getCMSContent('clarifier', 'Your cost is a small percentage of your processed revenue — this calculator shows what that means for your business.')}
          </p>
        </div>
      </div>
    </Card>
  );
}
