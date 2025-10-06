import { useState } from 'react';
import { Slider } from '@/components/ui/slider';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { formatCompactCurrency, formatCurrency } from '@/utils/formatCurrency';
import { convertFromEUR } from '@/utils/currencyConversion';
import { calculatePricing } from '@/utils/pricing';
import { ArrowRight } from 'lucide-react';

interface PricingSliderProps {
  currency: string;
  contractType: 'none' | 'monthly' | 'yearly';
  onOpenCalculator: () => void;
  textContent: any[];
}

// Logarithmic presets in EUR (source of truth)
// These are the ONLY values the slider can snap to
const PRESETS_EUR = [
  100_000,    // €100k - Very small
  500_000,    // €500k - Small
  2_000_000,  // €2M - Medium
  10_000_000, // €10M - Large
  40_000_000, // €40M - Very Large
  200_000_000 // €200M - Enterprise
];

export function PricingSlider({ currency, contractType, onOpenCalculator, textContent }: PricingSliderProps) {
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

  return (
    <Card className="liquid-glass p-6 md:p-8 max-w-3xl mx-auto">
      <div className="space-y-6">
        {/* Revenue Display */}
        <div className="text-center">
          <h3 className="text-lg font-semibold text-foreground mb-2 glass-text-high-contrast">
            {getCMSContent('label', 'Total annual revenue:')}
          </h3>
          <div className="text-3xl md:text-4xl font-bold gradient-text">
            {formatCompactCurrency(revenue, currency)}
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

        {/* Cost Preview */}
        <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 text-center">
          <div className="text-sm text-muted-foreground mb-1 glass-text-high-contrast">
            {getCMSContent('preview_label', 'Estimated annual cost:')}
          </div>
          <div className="text-2xl md:text-3xl font-bold text-foreground glass-text-large">
            {formatCurrency(result.total, currency)}
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
      </div>
    </Card>
  );
}
