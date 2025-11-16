import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { formatCurrency, formatPercentage } from "@/utils/formatCurrency";
import { PricingResult, getRateForTier, GARAGE_BASE_RATE, SHOP_BASE_RATE, MOBILE_BASE_RATE } from "@/utils/pricing";
import { getTierLabel, getTierColor } from "@/utils/pricingHelpers";
import { Sparkles } from "lucide-react";

interface PricingBreakdownProps {
  result: PricingResult;
  currency: string;
  contractType: 'none' | 'monthly' | 'yearly';
  onContractTypeChange: (value: 'none' | 'monthly' | 'yearly') => void;
  includeMobile: boolean;
}

export function PricingBreakdown({ result, currency, contractType, onContractTypeChange, includeMobile }: PricingBreakdownProps) {
  
  // Use tier directly from pricing calculation
  const currentTier = result.tier;
  const tierLabel = getTierLabel(currentTier);

  // Calculate the percentage rates for each service at the current tier
  const garageRate = getRateForTier(GARAGE_BASE_RATE, currentTier);
  const shopRate = getRateForTier(SHOP_BASE_RATE, currentTier);
  const mobileRate = getRateForTier(MOBILE_BASE_RATE, currentTier, 'mobile');

  const services = [
    { 
      name: 'Garage', 
      usage: result.usage.garage, 
      rate: garageRate,
      show: true 
    },
    { 
      name: 'Shop', 
      usage: result.usage.shop, 
      rate: shopRate,
      show: true 
    },
    { 
      name: 'Mobile', 
      usage: result.usage.mobile,
      rate: mobileRate,
      show: includeMobile 
    },
  ];

  const totalUsage = result.usage.garage + result.usage.shop + result.usage.mobile;

  return (
    <Card className="glass-card p-6 space-y-6 animate-fade-in">
      <div className="space-y-2">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h3 className="text-lg font-semibold text-primary-foreground">Annual Cost Breakdown</h3>
            <p className="text-sm text-primary-foreground/80">
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
            <h4 className="text-sm font-medium text-primary-foreground">Annual Usage Cost</h4>
            <span className="text-sm font-semibold text-primary">
              {formatCurrency(totalUsage, currency)}
            </span>
          </div>
          <div className="space-y-2 pl-4 border-l-2 border-primary/20">
            {services.filter(s => s.show).map((service) => (
              <div key={service.name} className="flex items-center justify-between text-sm">
                <span className="text-primary-foreground/80">
                  <span className="font-medium">{service.name}</span>
                  <span className="text-xs ml-1.5 opacity-70">
                    ({formatPercentage(service.rate)})
                  </span>
                </span>
                <span className="font-medium text-primary-foreground">{formatCurrency(service.usage, currency)}</span>
              </div>
            ))}
          </div>
          <p className="text-xs text-primary-foreground/70 pl-4 pt-2">
            Revenue-based pricing with no separate SaaS licence fee
          </p>
        </div>

        <Separator />

        {/* Total */}
        <div className="space-y-3">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
            <div className="space-y-2">
              <h4 className="text-lg font-bold text-primary-foreground">Total Annual Cost</h4>
              <div className="flex flex-wrap items-center gap-2">
                <Badge className={`text-xs font-semibold ${getTierColor(currentTier)} transition-all duration-300`}>
                  Tier {currentTier}
                </Badge>
                <span className="text-xs text-primary-foreground/70">
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
              <span className="text-primary-foreground/80">Monthly avg:</span>
              <span className="font-semibold text-primary-foreground">{formatCurrency(result.total / 12, currency)}</span>
            </div>
            <div className="flex items-center justify-between sm:justify-start sm:gap-2 text-sm p-3 rounded-lg bg-muted/30">
              <span className="text-primary-foreground/80">Effective rate:</span>
              <span className="font-semibold text-primary-foreground">{formatPercentage(result.effectiveRate / 100)}</span>
            </div>
          </div>
        </div>

        <Separator />

        {/* Contract Type Selector */}
        <div className="space-y-3">
          <Label className="text-sm font-medium text-primary-foreground">Contract Type</Label>
          <ToggleGroup
            type="single"
            value={contractType}
            onValueChange={(value) => value && onContractTypeChange(value as typeof contractType)}
            className="grid grid-cols-3 gap-2"
          >
            <ToggleGroupItem
              value="none"
              aria-label="No contract"
              className="data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
            >
              <div className="text-center">
                <div className="text-sm font-medium">No Contract</div>
                <div className="text-xs opacity-80">Standard</div>
              </div>
            </ToggleGroupItem>
            <ToggleGroupItem
              value="monthly"
              aria-label="Monthly contract"
              className="data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
            >
              <div className="text-center">
                <div className="text-sm font-medium">Monthly</div>
                <div className="text-xs opacity-80">Save 10%</div>
              </div>
            </ToggleGroupItem>
            <ToggleGroupItem
              value="yearly"
              aria-label="Yearly contract"
              className="data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
            >
              <div className="text-center">
                <div className="text-sm font-medium">Yearly</div>
                <div className="text-xs opacity-80">Save 20%</div>
              </div>
            </ToggleGroupItem>
          </ToggleGroup>
        </div>
      </div>

      {contractType !== 'none' && result.discount > 0 && (
        <div className="bg-[hsl(var(--tier-low))]/10 rounded-lg p-4 border border-[hsl(var(--tier-low))]/20">
          <p className="text-sm font-medium text-primary-foreground">
            💰 You're saving {formatCurrency(result.discount, currency)} per year with your {contractType} contract!
          </p>
        </div>
      )}
    </Card>
  );
}
