import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getCurrencyConfig } from "@/config/pricing";
import { calculatePricing } from "@/utils/pricing";
import { formatCurrency, formatCompactCurrency } from "@/utils/formatCurrency";

interface PricingFeatureCardsProps {
  currency: string;
  contractType: 'none' | 'monthly' | 'yearly';
}

export function PricingFeatureCards({ currency, contractType }: PricingFeatureCardsProps) {
  const config = getCurrencyConfig(currency);
  const symbol = config.symbol;

  const scenarios = [
    {
      tier: "Emerging",
      range: `Up to ${symbol}${currency === 'NOK' ? '20M' : '2M'}`,
      color: "bg-green-600 text-white border-green-700",
      revenues: {
        garage: currency === 'NOK' ? 7_500_000 : 750_000,
        shop: currency === 'NOK' ? 2_000_000 : 200_000,
        mobile: currency === 'NOK' ? 500_000 : 50_000
      },
      cta: "Book Demo"
    },
    {
      tier: "Large",
      range: `${symbol}${currency === 'NOK' ? '20M – 400M' : '2M – 40M'}`,
      color: "bg-amber-500 text-white border-amber-600",
      revenues: {
        garage: currency === 'NOK' ? 60_000_000 : 6_000_000,
        shop: currency === 'NOK' ? 30_000_000 : 3_000_000,
        mobile: currency === 'NOK' ? 10_000_000 : 1_000_000
      },
      cta: "Book Demo"
    },
    {
      tier: "Enterprise",
      range: `${symbol}${currency === 'NOK' ? '400M+' : '40M+'}`,
      color: "bg-gradient-primary text-primary-foreground border-primary",
      revenues: {
        garage: currency === 'NOK' ? 900_000_000 : 90_000_000,
        shop: currency === 'NOK' ? 800_000_000 : 80_000_000,
        mobile: currency === 'NOK' ? 240_000_000 : 24_000_000
      },
      cta: "Book Demo"
    }
  ];

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
            className={`p-4 md:p-6 space-y-4 md:space-y-6 relative transition-all duration-200 hover:shadow-lg border-l-4 ${borderColor}`}
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
              <h4 className="text-sm md:text-base font-semibold text-foreground">Example scenario:</h4>
              <ul className="text-xs md:text-sm text-muted-foreground space-y-1">
                <li>• Garage: {formatCompactCurrency(scenario.revenues.garage, currency)}</li>
                <li>• Shop: {formatCompactCurrency(scenario.revenues.shop, currency)}</li>
                <li>• Mobile: {formatCompactCurrency(scenario.revenues.mobile, currency)}</li>
              </ul>
            </div>

            {/* Annual Cost with Discount Display */}
            <div className="space-y-2">
              <h4 className="text-sm md:text-base font-semibold text-foreground">Annual cost:</h4>
              
              {hasDiscount && (
                <div className="text-sm text-muted-foreground line-through">
                  {formatCurrency(baseResult.total, currency)}
                </div>
              )}
              
              <div className="text-lg md:text-xl lg:text-2xl font-bold text-foreground">
                {formatCurrency(discountedResult.total, currency)}
              </div>
              
              {hasDiscount && savings > 0 && (
                <div className="bg-green-500/10 text-green-700 dark:text-green-400 border border-green-500/20 text-xs font-semibold px-3 py-1 rounded-md inline-block">
                  Save {formatCurrency(savings, currency)}
                </div>
              )}
              
              <div className="text-xs md:text-sm text-muted-foreground">
                Effective rate: ~{discountedResult.effectiveRate.toFixed(2)}%
              </div>
            </div>
          </Card>
        );
      })}
      </div>
      
      {/* Single CTA below all cards */}
      <div className="text-center mt-8 md:mt-12">
        <Button size="lg" className="text-lg px-8" asChild>
          <a 
            href="https://calendly.com/joachim-noddi/30min"
            target="_blank"
            rel="noopener noreferrer"
          >
            Book a demo
          </a>
        </Button>
      </div>
    </>
  );
}
