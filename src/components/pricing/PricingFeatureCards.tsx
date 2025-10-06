import { useState } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getCurrencyConfig } from "@/config/pricing";
import { calculatePricing } from "@/utils/pricing";
import { formatCurrency, formatCompactCurrency } from "@/utils/formatCurrency";
import { convertFromEUR } from "@/utils/currencyConversion";
import { ChevronDown, ChevronUp } from 'lucide-react';

interface TextContent {
  id: string;
  page_location: string;
  section: string;
  element_type: string;
  content: string;
  active: boolean;
  sort_order: number | null;
  color_token?: string;
  content_type: string;
}

interface PricingFeatureCardsProps {
  currency: string;
  contractType: 'none' | 'monthly' | 'yearly';
  textContent: TextContent[];
}

export function PricingFeatureCards({ currency, contractType, textContent }: PricingFeatureCardsProps) {
  const config = getCurrencyConfig(currency);
  const symbol = config.symbol;
  
  // Helper to get CMS content
  const getCMSContent = (elementType: string, fallback: string = ''): string => {
    const item = textContent.find(tc => tc.element_type === elementType);
    return item?.content || fallback;
  };

  // Base scenarios defined in EUR (source of truth)
  const BASE_SCENARIOS_EUR = [
    {
      tier: "Emerging",
      maxRange: 2_000_000, // €2M
      revenues: {
        garage: 750_000,
        shop: 200_000,
        mobile: 50_000
      }
    },
    {
      tier: "Large",
      minRange: 2_000_000, // €2M
      maxRange: 40_000_000, // €40M
      revenues: {
        garage: 6_000_000,
        shop: 3_000_000,
        mobile: 1_000_000
      }
    },
    {
      tier: "Enterprise",
      minRange: 40_000_000, // €40M+
      revenues: {
        garage: 90_000_000,
        shop: 80_000_000,
        mobile: 24_000_000
      }
    }
  ];

  // Convert EUR base values to selected currency
  const scenarios = BASE_SCENARIOS_EUR.map((base) => {
    const convertedRevenues = {
      garage: convertFromEUR(base.revenues.garage, currency),
      shop: convertFromEUR(base.revenues.shop, currency),
      mobile: convertFromEUR(base.revenues.mobile, currency)
    };

    let range = '';
    if (base.tier === 'Emerging') {
      range = `Up to ${formatCompactCurrency(convertFromEUR(base.maxRange, currency), currency)}`;
    } else if (base.tier === 'Large') {
      range = `${formatCompactCurrency(convertFromEUR(base.minRange, currency), currency)} – ${formatCompactCurrency(convertFromEUR(base.maxRange, currency), currency)}`;
    } else {
      range = `${formatCompactCurrency(convertFromEUR(base.minRange, currency), currency)}+`;
    }

    return {
      tier: base.tier,
      range,
      color: base.tier === "Emerging" ? "bg-green-600 text-white border-green-700" :
             base.tier === "Large" ? "bg-amber-500 text-white border-amber-600" :
             "bg-gradient-primary text-primary-foreground border-primary",
      revenues: convertedRevenues, // For DISPLAY
      revenuesEUR: base.revenues,   // For CALCULATION
      cta: "Book Demo"
    };
  });

  return (
    <>
      <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
        {scenarios.map((scenario, index) => {
        // Calculate using EUR revenues (correct input for calculatePricing)
        const baseResultEUR = calculatePricing(scenario.revenuesEUR, { 
          includeMobile: true, 
          contractType: 'none' 
        });

        const discountedResultEUR = calculatePricing(scenario.revenuesEUR, { 
          includeMobile: true, 
          contractType 
        });

        // Convert results to target currency for display
        const baseResult = {
          ...baseResultEUR,
          total: convertFromEUR(baseResultEUR.total, currency),
          garageCost: convertFromEUR(baseResultEUR.garageCost, currency),
          shopCost: convertFromEUR(baseResultEUR.shopCost, currency),
          mobileCost: convertFromEUR(baseResultEUR.mobileCost, currency),
        };

        const discountedResult = {
          ...discountedResultEUR,
          total: convertFromEUR(discountedResultEUR.total, currency),
          garageCost: convertFromEUR(discountedResultEUR.garageCost, currency),
          shopCost: convertFromEUR(discountedResultEUR.shopCost, currency),
          mobileCost: convertFromEUR(discountedResultEUR.mobileCost, currency),
        };

        const hasDiscount = contractType !== 'none';
        const savings = baseResult.total - discountedResult.total;

        // State for collapsible breakdown (default collapsed for better UX)
        const [showDetails, setShowDetails] = useState(false);

        // Calculate per-category rates using converted display values
        const garageRate = scenario.revenues.garage > 0 
          ? (discountedResult.garageCost / scenario.revenues.garage) * 100 
          : 0;
        const shopRate = scenario.revenues.shop > 0 
          ? (discountedResult.shopCost / scenario.revenues.shop) * 100 
          : 0;
        const mobileRate = scenario.revenues.mobile > 0 
          ? (discountedResult.mobileCost / scenario.revenues.mobile) * 100 
          : 0;

        const borderColor = scenario.tier === 'Emerging' ? 'border-l-green-500' : 
                           scenario.tier === 'Large' ? 'border-l-amber-500' : 'border-l-primary';
        
        return (
          <Card 
            key={scenario.tier}
            className={`liquid-glass p-4 md:p-6 space-y-4 md:space-y-6 relative transition-all duration-200 hover:shadow-lg border-l-4 ${borderColor} [@media(max-width:768px)]:text-sm [@media(max-width:768px)]:space-y-3`}
            role="article"
            aria-label={`Pricing tier: ${scenario.tier}`}
          >
            {/* Revenue Range as Heading */}
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <h3 className="text-xl md:text-2xl font-bold text-foreground">
                  {scenario.range}
                </h3>
              </div>
              <Badge variant="secondary" className="text-xs">
                {scenario.tier}
              </Badge>
            </div>

            {/* Example Scenario Breakdown */}
            <div className="space-y-2">
              <h4 className="text-sm md:text-base font-semibold glass-text-high-contrast">
                {getCMSContent('h4_example', 'Example scenario:')}
              </h4>
              <ul className="text-xs md:text-sm glass-text-high-contrast space-y-1">
                <li>• {getCMSContent('label_garage', 'Garage:')} {formatCompactCurrency(scenario.revenues.garage, currency)}</li>
                <li>• {getCMSContent('label_shop', 'Shop:')} {formatCompactCurrency(scenario.revenues.shop, currency)}</li>
                <li>• {getCMSContent('label_mobile', 'Mobile:')} {formatCompactCurrency(scenario.revenues.mobile, currency)}</li>
              </ul>
            </div>

            {/* Annual Cost with Discount Display */}
            <div className="space-y-2">
              <h4 className="text-sm md:text-base font-semibold glass-text-high-contrast">
                {getCMSContent('h4_cost', 'Annual cost:')}
              </h4>
              
              {hasDiscount && (
                <div className="text-sm glass-text-high-contrast line-through">
                  {formatCurrency(baseResult.total, currency)}
                </div>
              )}
              
              <div className="text-lg md:text-xl lg:text-2xl font-bold glass-text-large">
                {formatCurrency(discountedResult.total, currency)}
              </div>
              
              {hasDiscount && savings > 0 && (
                <div className="bg-green-600 text-white border-green-700 text-xs font-semibold px-3 py-1 rounded-md inline-block">
                  💰 Save {formatCurrency(savings, currency)}
                </div>
              )}
              
              <div className="text-xs md:text-sm glass-text-high-contrast font-semibold">
                {getCMSContent('label_rate', 'Effective rate:')} ~{discountedResult.effectiveRate.toFixed(2)}%
              </div>
            </div>

            {/* Collapsible Category Breakdown */}
            <div className="pt-4 border-t border-border/50">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowDetails(!showDetails)}
                className="w-full accessible-focus hover:bg-primary/10"
                aria-expanded={showDetails}
                aria-controls={`breakdown-${index}`}
                aria-label={showDetails ? 'Hide detailed breakdown' : 'Show detailed breakdown'}
              >
                {showDetails ? (
                  <>
                    <ChevronUp className="w-4 h-4 mr-2" />
                    {getCMSContent('button_hide_details', 'Hide breakdown')}
                  </>
                ) : (
                  <>
                    <ChevronDown className="w-4 h-4 mr-2" />
                    {getCMSContent('button_show_details', 'Show breakdown')}
                  </>
                )}
              </Button>

              {showDetails && (
                <div 
                  id={`breakdown-${index}`}
                  className="space-y-3 pt-4 animate-fade-in"
                  role="region"
                  aria-live="polite"
                >
                  <h5 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    Category Breakdown
                  </h5>
                  
                  {/* Per-category rates */}
                  <div className="space-y-2 text-xs glass-text-high-contrast">
                    <div className="flex justify-between items-center p-2 bg-primary/5 rounded">
                      <span>{getCMSContent('label_garage_rate', 'Garage rate:')}</span>
                      <span className="font-semibold">{garageRate.toFixed(2)}%</span>
                    </div>
                    <div className="flex justify-between items-center p-2 bg-primary/5 rounded">
                      <span>{getCMSContent('label_shop_rate', 'Shop rate:')}</span>
                      <span className="font-semibold">{shopRate.toFixed(2)}%</span>
                    </div>
                    <div className="flex justify-between items-center p-2 bg-primary/5 rounded">
                      <span>{getCMSContent('label_mobile_rate', 'Mobile rate:')}</span>
                      <span className="font-semibold">{mobileRate.toFixed(2)}%</span>
                    </div>
                  </div>

                  {/* Per-category costs */}
                  <div className="grid grid-cols-3 gap-2 pt-2 text-xs">
                    <div className="text-center p-2 bg-muted/50 rounded">
                      <div className="text-muted-foreground mb-1">{getCMSContent('label_garage', 'Garage')}</div>
                      <div className="font-semibold text-foreground">
                        {formatCompactCurrency(discountedResult.garageCost, currency)}
                      </div>
                    </div>
                    <div className="text-center p-2 bg-muted/50 rounded">
                      <div className="text-muted-foreground mb-1">{getCMSContent('label_shop', 'Shop')}</div>
                      <div className="font-semibold text-foreground">
                        {formatCompactCurrency(discountedResult.shopCost, currency)}
                      </div>
                    </div>
                    <div className="text-center p-2 bg-muted/50 rounded">
                      <div className="text-muted-foreground mb-1">{getCMSContent('label_mobile', 'Mobile')}</div>
                      <div className="font-semibold text-foreground">
                        {formatCompactCurrency(discountedResult.mobileCost, currency)}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </Card>
        );
      })}
      </div>
      
      {/* Single CTA below all cards */}
      <div className="text-center mt-8 md:mt-12">
        <Button size="lg" className="text-lg px-8 accessible-focus" asChild>
          <a 
            href="https://calendly.com/joachim-noddi/30min"
            target="_blank"
            rel="noopener noreferrer"
          >
            {getCMSContent('cta_button_demo', 'Book a demo')}
          </a>
        </Button>
      </div>
    </>
  );
}
