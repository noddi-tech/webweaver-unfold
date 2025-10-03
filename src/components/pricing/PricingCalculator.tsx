import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { RevenueInput } from "./RevenueInput";
import { PricingBreakdown } from "./PricingBreakdown";
import { calculatePricing } from "@/utils/pricing";
import { getCurrencyConfig } from "@/config/pricing";

interface PricingCalculatorProps {
  currency?: string;
}

export function PricingCalculator({ currency = 'EUR' }: PricingCalculatorProps) {
  const currencyConfig = getCurrencyConfig(currency);
  
  const [garageRevenue, setGarageRevenue] = useState(5_000_000);
  const [shopRevenue, setShopRevenue] = useState(3_000_000);
  const [mobileRevenue, setMobileRevenue] = useState(1_000_000);
  const [includeMobile, setIncludeMobile] = useState(true);
  const [contractType, setContractType] = useState<'none' | 'monthly' | 'yearly'>('yearly');

  const result = calculatePricing(
    { garage: garageRevenue, shop: shopRevenue, mobile: mobileRevenue },
    { includeMobile, contractType }
  );

  return (
    <div className="grid lg:grid-cols-2 gap-8">
      {/* Controls */}
      <Card className="glass-card p-6 space-y-6 h-fit">
        <div>
          <h3 className="text-xl font-bold text-foreground mb-2">Calculate Your Price</h3>
          <p className="text-sm text-muted-foreground">
            Enter your annual revenue per service to see your pricing
          </p>
        </div>

        <div className="space-y-6">
          {/* Garage Revenue */}
          <RevenueInput
            label={`Garage Annual Revenue (${currencyConfig.symbol})`}
            value={garageRevenue}
            onChange={setGarageRevenue}
            max={currencyConfig.maxRevenue}
            currency={currency}
            tooltip="Enter your total annual revenue from garage services (repairs, maintenance, etc.)"
          />

          {/* Shop Revenue */}
          <RevenueInput
            label={`Shop Annual Revenue (${currencyConfig.symbol})`}
            value={shopRevenue}
            onChange={setShopRevenue}
            max={currencyConfig.maxRevenue}
            currency={currency}
            tooltip="Enter your total annual revenue from shop/retail services (parts sales, accessories, etc.)"
          />

          {/* Mobile Service Toggle */}
          <div className="flex items-center justify-between p-4 rounded-lg bg-muted/30 border border-border">
            <div className="space-y-1">
              <Label htmlFor="mobile-toggle" className="text-sm font-medium text-foreground">
                Offer Mobile Service?
              </Label>
              <p className="text-xs text-muted-foreground">
                Enable if you provide mobile/on-site services
              </p>
            </div>
            <Switch
              id="mobile-toggle"
              checked={includeMobile}
              onCheckedChange={setIncludeMobile}
            />
          </div>

          {/* Mobile Revenue (conditional) */}
          {includeMobile && (
            <RevenueInput
              label={`Mobile Annual Revenue (${currencyConfig.symbol})`}
              value={mobileRevenue}
              onChange={setMobileRevenue}
              max={currencyConfig.maxRevenue}
              currency={currency}
              tooltip="Enter your total annual revenue from mobile/on-site services"
            />
          )}

          {/* Contract Type Selector */}
          <div className="space-y-3">
            <Label className="text-sm font-medium text-foreground">Contract Type</Label>
            <ToggleGroup
              type="single"
              value={contractType}
              onValueChange={(value) => value && setContractType(value as typeof contractType)}
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
                  <div className="text-xs opacity-80">Save 15%</div>
                </div>
              </ToggleGroupItem>
              <ToggleGroupItem
                value="yearly"
                aria-label="Yearly contract"
                className="data-[state=on]:bg-primary data-[state=on]:text-primary-foreground relative"
              >
                <div className="text-center">
                  <div className="text-sm font-medium">Yearly</div>
                  <div className="text-xs opacity-80">Save 25%</div>
                </div>
              </ToggleGroupItem>
            </ToggleGroup>
          </div>
        </div>
      </Card>

      {/* Results */}
      <div className="space-y-4">
        <PricingBreakdown
          result={result}
          currency={currency}
          contractType={contractType}
          includeMobile={includeMobile}
        />
      </div>
    </div>
  );
}
