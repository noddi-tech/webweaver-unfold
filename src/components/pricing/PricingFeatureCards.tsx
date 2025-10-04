import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getCurrencyConfig } from "@/config/pricing";
import { calculatePricing } from "@/utils/pricing";
import { formatCurrency, formatCompactCurrency } from "@/utils/formatCurrency";
import { convertFromEUR } from "@/utils/currencyConversion";

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
      revenues: convertedRevenues,
      cta: "Book Demo"
    };
  });

  return (
    <>
      <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
        {scenarios.map((scenario) => {
        // Calculate both base and discounted pricing
        const baseResult = calculatePricing(scenario.revenues, { 
          includeMobile: true, 
          contractType: 'none' 
        });

        const discountedResult = calculatePricing(scenario.revenues, { 
          includeMobile: true, 
          contractType 
        });

        const hasDiscount = contractType !== 'none';
        const savings = baseResult.total - discountedResult.total;

        const borderColor = scenario.tier === 'Emerging' ? 'border-l-green-500' : 
                           scenario.tier === 'Large' ? 'border-l-amber-500' : 'border-l-primary';
        
        return (
          <Card 
            key={scenario.tier}
            className={`liquid-glass p-4 md:p-6 space-y-4 md:space-y-6 relative transition-all duration-200 hover:shadow-lg border-l-4 ${borderColor}`}
          >
            {/* Revenue Range as Heading */}
            <div className="space-y-1">
              <h3 className="text-xl md:text-2xl font-bold text-foreground">
                {scenario.range}
              </h3>
              <div className="text-xs md:text-sm text-muted-foreground">{scenario.tier}</div>
            </div>

            {/* Example Scenario Breakdown */}
            <div className="space-y-2">
              <h4 className="text-sm md:text-base font-semibold glass-text-high-contrast">
                {getCMSContent('pricing_cards_h4_example', 'Example scenario:')}
              </h4>
              <ul className="text-xs md:text-sm glass-text-high-contrast space-y-1">
                <li>• {getCMSContent('pricing_cards_label_garage', 'Garage:')} {formatCompactCurrency(scenario.revenues.garage, currency)}</li>
                <li>• {getCMSContent('pricing_cards_label_shop', 'Shop:')} {formatCompactCurrency(scenario.revenues.shop, currency)}</li>
                <li>• {getCMSContent('pricing_cards_label_mobile', 'Mobile:')} {formatCompactCurrency(scenario.revenues.mobile, currency)}</li>
              </ul>
            </div>

            {/* Annual Cost with Discount Display */}
            <div className="space-y-2">
              <h4 className="text-sm md:text-base font-semibold glass-text-high-contrast">
                {getCMSContent('pricing_cards_label_annual', 'Annual cost:')}
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
                  💰 {getCMSContent('pricing_cards_save_prefix', 'Save')} {formatCurrency(savings, currency)}
                </div>
              )}
              
              <div className="text-xs md:text-sm glass-text-high-contrast font-semibold">
                {getCMSContent('pricing_cards_label_rate', 'Effective rate:')} ~{discountedResult.effectiveRate.toFixed(2)}%
              </div>
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
