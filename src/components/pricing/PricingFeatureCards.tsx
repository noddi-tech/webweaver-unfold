import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
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
      tier: "Small/Basic",
      range: `Up to ${symbol}${currency === 'NOK' ? '20M' : '2M'}`,
      color: "bg-green-600 text-white border-green-700",
      revenues: {
        garage: currency === 'NOK' ? 7_500_000 : 750_000,
        shop: currency === 'NOK' ? 2_000_000 : 200_000,
        mobile: currency === 'NOK' ? 500_000 : 50_000
      },
      cta: "Talk to Sales"
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
      cta: "Book a Demo"
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
      cta: "Contact Sales"
    }
  ];

  return (
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

        return (
          <Card 
            key={scenario.tier}
            className="p-6 space-y-6 relative transition-all duration-200 hover:shadow-lg hover-scale"
          >
            <div className="space-y-3">
              <Badge className={`${scenario.color} text-xs font-semibold px-3 py-1`}>
                {scenario.tier}
              </Badge>
              <div className="text-sm text-muted-foreground">{scenario.range}</div>
            </div>

            {/* Example Scenario Breakdown */}
            <div className="space-y-2">
              <h4 className="text-sm font-semibold text-foreground">Example Scenario:</h4>
              <ul className="text-xs text-muted-foreground space-y-1">
                <li>• Garage: {formatCompactCurrency(scenario.revenues.garage, currency)}</li>
                <li>• Shop: {formatCompactCurrency(scenario.revenues.shop, currency)}</li>
                <li>• Mobile: {formatCompactCurrency(scenario.revenues.mobile, currency)}</li>
              </ul>
            </div>

            {/* Annual Cost with Discount Display */}
            <div className="space-y-2">
              <h4 className="text-sm font-semibold text-foreground">Annual Cost:</h4>
              
              {hasDiscount && (
                <div className="text-sm text-muted-foreground line-through">
                  {formatCurrency(baseResult.total, currency)}
                </div>
              )}
              
              <div className="text-xl font-bold text-foreground">
                {formatCurrency(discountedResult.total, currency)}
              </div>
              
              {hasDiscount && savings > 0 && (
                <Badge className="bg-green-600 text-white border-green-700">
                  💰 Save {formatCurrency(savings, currency)}
                </Badge>
              )}
              
              <div className="text-xs text-muted-foreground">
                Effective rate: ~{discountedResult.effectiveRate.toFixed(2)}%
              </div>
            </div>

            <Button
              className="w-full"
              variant="outline"
              asChild
            >
              <Link to="/contact">{scenario.cta}</Link>
            </Button>
          </Card>
        );
      })}
    </div>
  );
}
