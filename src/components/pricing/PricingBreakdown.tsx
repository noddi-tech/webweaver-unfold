import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { formatCurrency, formatPercentage } from "@/utils/formatCurrency";
import { PricingResult } from "@/utils/pricing";
import { detectCurrentTier, getTierLabel, EXAMPLE_RATES } from "@/utils/pricingHelpers";
import { Sparkles, ChevronDown, Info } from "lucide-react";

interface PricingBreakdownProps {
  result: PricingResult;
  currency: string;
  contractType: 'none' | 'monthly' | 'yearly';
  includeMobile: boolean;
}

export function PricingBreakdown({ result, currency, contractType, includeMobile }: PricingBreakdownProps) {
  const [examplesOpen, setExamplesOpen] = useState(false);
  
  const services = [
    { name: 'Garage', usage: result.usage.garage, licence: result.licence.garage, show: true },
    { name: 'Shop', usage: result.usage.shop, licence: result.licence.shop, show: true },
    { name: 'Mobile', usage: result.usage.mobile, licence: result.licence.mobile, show: includeMobile },
  ];

  const totalUsage = result.usage.garage + result.usage.shop + result.usage.mobile;
  const totalLicence = result.licence.garage + result.licence.shop + result.licence.mobile;

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
    <Card className="glass-card p-6 space-y-6">
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-foreground">Annual Cost Breakdown</h3>
          {contractType !== 'none' && result.discount > 0 && (
            <Badge className="bg-gradient-primary text-primary-foreground">
              <Sparkles className="w-3 h-3 mr-1" />
              Save {formatCurrency(result.discount, currency)}
            </Badge>
          )}
        </div>
        <p className="text-sm text-muted-foreground">
          Revenue-based pricing that scales with your business
        </p>
      </div>

      <div className="space-y-4">
        {/* Usage Costs */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium text-foreground">Usage Costs</h4>
            <span className="text-sm font-semibold text-primary">
              {formatCurrency(totalUsage, currency)}
            </span>
          </div>
          <div className="space-y-2 pl-4 border-l-2 border-primary/20">
            {services.filter(s => s.show).map((service) => (
              <div key={service.name} className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">{service.name}</span>
                <span className="font-medium text-foreground">{formatCurrency(service.usage, currency)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* License Fees */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium text-foreground">License Fees</h4>
            <span className="text-sm font-semibold text-secondary-foreground">
              {formatCurrency(totalLicence, currency)}
            </span>
          </div>
          <div className="space-y-2 pl-4 border-l-2 border-secondary/40">
            {services.filter(s => s.show).map((service) => (
              <div key={service.name} className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">{service.name}</span>
                <span className="font-medium text-foreground">{formatCurrency(service.licence, currency)}</span>
              </div>
            ))}
          </div>
        </div>

        <Separator />

        {/* Total */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h4 className="text-lg font-bold text-foreground">Total Annual Cost</h4>
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="text-xs">
                  Tier {currentTier} - {tierLabel}
                </Badge>
              </div>
            </div>
            <span className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              {formatCurrency(result.total, currency)}
            </span>
          </div>
          <div className="text-sm text-muted-foreground">
            ≈ {formatCurrency(result.total / 12, currency)}/month
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Effective rate</span>
            <span className="font-semibold text-foreground">{formatPercentage(result.effectiveRate / 100)}</span>
          </div>
        </div>
      </div>

      {contractType !== 'none' && result.discount > 0 && (
        <div className="bg-gradient-primary/10 rounded-lg p-4 border border-primary/20">
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
                <div className="text-sm font-medium text-foreground">Small ({formatCurrency(EXAMPLE_RATES.small.revenue, currency)})</div>
                <div className="text-xs text-muted-foreground">Tiers 1-4</div>
              </div>
              <div className="text-sm font-bold text-primary">~{EXAMPLE_RATES.small.rate}%</div>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
              <div>
                <div className="text-sm font-medium text-foreground">Large ({formatCurrency(EXAMPLE_RATES.large.revenue, currency)})</div>
                <div className="text-xs text-muted-foreground">Tiers 5-7</div>
              </div>
              <div className="text-sm font-bold text-primary">~{EXAMPLE_RATES.large.rate}%</div>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
              <div>
                <div className="text-sm font-medium text-foreground">Enterprise ({formatCurrency(EXAMPLE_RATES.enterprise.revenue, currency)})</div>
                <div className="text-xs text-muted-foreground">Tiers 8-10</div>
              </div>
              <div className="text-sm font-bold text-primary">~{EXAMPLE_RATES.enterprise.rate}%</div>
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
