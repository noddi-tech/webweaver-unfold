import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatPercentage } from "@/utils/formatCurrency";
import { PricingResult } from "@/utils/pricing";
import { Sparkles } from "lucide-react";

interface PricingBreakdownProps {
  result: PricingResult;
  currency: string;
  contractType: 'none' | 'monthly' | 'yearly';
  includeMobile: boolean;
}

export function PricingBreakdown({ result, currency, contractType, includeMobile }: PricingBreakdownProps) {
  const services = [
    { name: 'Garage', usage: result.usage.garage, licence: result.licence.garage, show: true },
    { name: 'Shop', usage: result.usage.shop, licence: result.licence.shop, show: true },
    { name: 'Mobile', usage: result.usage.mobile, licence: result.licence.mobile, show: includeMobile },
  ];

  const totalUsage = result.usage.garage + result.usage.shop + result.usage.mobile;
  const totalLicence = result.licence.garage + result.licence.shop + result.licence.mobile;

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
            <h4 className="text-lg font-bold text-foreground">Total Annual Cost</h4>
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
    </Card>
  );
}
