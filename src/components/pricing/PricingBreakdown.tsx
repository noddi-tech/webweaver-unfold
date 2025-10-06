import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { formatCurrency, formatPercentage } from "@/utils/formatCurrency";
import { PricingResult } from "@/utils/pricing";
import { detectCurrentTier, getTierLabel, getTierColor } from "@/utils/pricingHelpers";
import { Sparkles, ChevronDown, Info } from "lucide-react";
import { convertFromEUR } from "@/utils/currencyConversion";

// Base example rates in EUR (source of truth)
const EXAMPLE_RATES_EUR = {
  small: { revenue: 1_000_000, rate: 4.89 },
  large: { revenue: 10_000_000, rate: 2.87 },
  enterprise: { revenue: 80_000_000, rate: 1.42 },
};

interface PricingBreakdownProps {
  result: PricingResult;
  currency: string;
  contractType: 'none' | 'monthly' | 'yearly';
  includeMobile: boolean;
  revenues: {
    garage: number;
    shop: number;
    mobile: number;
  };
}

export function PricingBreakdown({ result, currency, contractType, includeMobile, revenues }: PricingBreakdownProps) {
  const [examplesOpen, setExamplesOpen] = useState(false);
  
  const services = [
    { 
      name: 'Garage', 
      usage: result.usage.garage, 
      rate: revenues.garage > 0 ? (result.usage.garage / revenues.garage) * 100 : 0,
      show: true 
    },
    { 
      name: 'Shop', 
      usage: result.usage.shop, 
      rate: revenues.shop > 0 ? (result.usage.shop / revenues.shop) * 100 : 0,
      show: true 
    },
    { 
      name: 'Mobile', 
      usage: result.usage.mobile, 
      rate: revenues.mobile > 0 ? (result.usage.mobile / revenues.mobile) * 100 : 0,
      show: includeMobile 
    },
  ];

  const totalUsage = result.usage.garage + result.usage.shop + result.usage.mobile;

  // Calculate total revenue and detect tier
  const totalRevenue = Object.values(result.usage).reduce((sum, val) => {
    // Reverse-engineer approximate revenue from usage (this is a simplification)
    return sum + val;
  }, 0);
  
  // Use a better approximation: total cost / effective rate
  const calculatedRevenue = result.effectiveRate > 0 
    ? (result.total / (result.effectiveRate / 100)) 
    : 0;
  
  const currentTier = detectCurrentTier(calculatedRevenue);
  const tierLabel = getTierLabel(currentTier);

  return (
    <Card className="glass-card p-6 space-y-6 animate-fade-in">
      <div className="space-y-2">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h3 className="text-lg font-semibold text-foreground">Annual Cost Breakdown</h3>
            <p className="text-sm text-muted-foreground">
              Revenue-based pricing that scales with your business
            </p>
          </div>
          {contractType !== 'none' && result.discount > 0 && (
            <Badge className="bg-[hsl(var(--tier-low))] text-white w-fit animate-scale-in">
              <Sparkles className="w-3 h-3 mr-1" />
              Save {formatCurrency(result.discount, currency)}
            </Badge>
          )}
        </div>
      </div>

      <div className="space-y-4">
        {/* Usage Costs */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium text-foreground">Annual Usage Cost</h4>
            <span className="text-sm font-semibold text-primary">
              {formatCurrency(totalUsage, currency)}
            </span>
          </div>
          <div className="space-y-2 pl-4 border-l-2 border-primary/20">
            {services.filter(s => s.show).map((service) => (
              <div key={service.name} className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">
                  {service.name} <span className="text-xs opacity-70">({formatPercentage(service.rate / 100)})</span>
                </span>
                <span className="font-medium text-foreground">{formatCurrency(service.usage, currency)}</span>
              </div>
            ))}
          </div>
          <p className="text-xs text-muted-foreground pl-4 pt-2">
            Revenue-based pricing with no separate SaaS licence fee
          </p>
        </div>

        <Separator />

        {/* Total Revenue */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium text-foreground">Total Revenue</h4>
            <span className="text-sm font-semibold text-primary">
              {formatCurrency(revenues.garage + revenues.shop + revenues.mobile, currency)}
            </span>
          </div>
        </div>

        <Separator />

        {/* Total */}
        <div className="space-y-3">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
            <div className="space-y-2">
              <h4 className="text-lg font-bold text-foreground">Total Annual Cost</h4>
              <div className="flex flex-wrap items-center gap-2">
                <Badge className={`text-xs font-semibold ${getTierColor(currentTier)} transition-all duration-300`}>
                  Tier {currentTier}
                </Badge>
                <span className="text-xs text-muted-foreground">
                  {tierLabel}
                </span>
              </div>
            </div>
            <span className="text-3xl lg:text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent transition-all duration-300">
              {formatCurrency(result.total, currency)}
            </span>
          </div>
          <div className="grid sm:grid-cols-2 gap-3 pt-2">
            <div className="flex items-center justify-between sm:justify-start sm:gap-2 text-sm p-3 rounded-lg bg-muted/30">
              <span className="text-muted-foreground">Monthly avg:</span>
              <span className="font-semibold text-foreground">{formatCurrency(result.total / 12, currency)}</span>
            </div>
            <div className="flex items-center justify-between sm:justify-start sm:gap-2 text-sm p-3 rounded-lg bg-muted/30">
              <span className="text-muted-foreground">Effective rate:</span>
              <span className="font-semibold text-foreground">{formatPercentage(result.effectiveRate / 100)}</span>
            </div>
          </div>
        </div>
      </div>

      {contractType !== 'none' && result.discount > 0 && (
        <div className="bg-[hsl(var(--tier-low))]/10 rounded-lg p-4 border border-[hsl(var(--tier-low))]/20">
          <p className="text-sm font-medium text-foreground">
            💰 You're saving {formatCurrency(result.discount, currency)} per year with your {contractType} contract!
          </p>
        </div>
      )}

      {/* Example Rates Section */}
      <Collapsible open={examplesOpen} onOpenChange={setExamplesOpen}>
        <CollapsibleTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="w-full flex items-center justify-between"
          >
            <span className="flex items-center gap-2 text-sm font-medium">
              <Info className="w-4 h-4" />
              See Example Rates
            </span>
            <ChevronDown className={`w-4 h-4 transition-transform ${examplesOpen ? 'rotate-180' : ''}`} />
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent className="space-y-3 pt-4">
          <p className="text-xs text-muted-foreground">
            Example effective rates at different revenue levels:
          </p>
          <div className="space-y-2">
            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
              <div>
                <div className="text-sm font-medium text-foreground">Small ({formatCurrency(convertFromEUR(EXAMPLE_RATES_EUR.small.revenue, currency), currency)})</div>
                <div className="text-xs text-muted-foreground">Tiers 1-4</div>
              </div>
              <div className="text-sm font-bold text-primary">~{EXAMPLE_RATES_EUR.small.rate}%</div>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
              <div>
                <div className="text-sm font-medium text-foreground">Large ({formatCurrency(convertFromEUR(EXAMPLE_RATES_EUR.large.revenue, currency), currency)})</div>
                <div className="text-xs text-muted-foreground">Tiers 5-7</div>
              </div>
              <div className="text-sm font-bold text-primary">~{EXAMPLE_RATES_EUR.large.rate}%</div>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
              <div>
                <div className="text-sm font-medium text-foreground">Enterprise ({formatCurrency(convertFromEUR(EXAMPLE_RATES_EUR.enterprise.revenue, currency), currency)})</div>
                <div className="text-xs text-muted-foreground">Tiers 8-10</div>
              </div>
              <div className="text-sm font-bold text-primary">~{EXAMPLE_RATES_EUR.enterprise.rate}%</div>
            </div>
          </div>
          <p className="text-xs text-muted-foreground italic">
            Rates shown are effective rates (total cost ÷ total revenue) and decrease continuously.
          </p>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}
