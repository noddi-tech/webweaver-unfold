import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { RevenueInput } from "./RevenueInput";
import { PricingBreakdown } from "./PricingBreakdown";
import { calculatePricing } from "@/utils/pricing";
import { getCurrencyConfig, DEFAULT_CURRENCY } from "@/config/pricing";
import { Sparkles, Settings } from "lucide-react";
import { convertFromEUR, convertToEUR } from "@/utils/currencyConversion";

// Base presets in EUR (source of truth)
const BASE_PRESETS_EUR = {
  small: { garage: 1_000_000, shop: 500_000, mobile: 200_000 },
  large: { garage: 20_000_000, shop: 15_000_000, mobile: 5_000_000 },
  enterprise: { garage: 150_000_000, shop: 100_000_000, mobile: 50_000_000 },
};

export function PricingCalculator() {
  // Load currency from localStorage or use default
  const [currency, setCurrency] = useState(() => {
    const saved = localStorage.getItem('noddi-pricing-currency');
    return saved || DEFAULT_CURRENCY;
  });

  const currencyConfig = getCurrencyConfig(currency);
  
  const [garageRevenue, setGarageRevenue] = useState(5_000_000);
  const [shopRevenue, setShopRevenue] = useState(3_000_000);
  const [mobileRevenue, setMobileRevenue] = useState(1_000_000);
  const [includeMobile, setIncludeMobile] = useState(true);
  const [contractType, setContractType] = useState<'none' | 'monthly' | 'yearly'>('yearly');

  // Persist currency selection
  useEffect(() => {
    localStorage.setItem('noddi-pricing-currency', currency);
  }, [currency]);

  // Apply preset values (convert from EUR to selected currency)
  const applyPreset = (preset: keyof typeof BASE_PRESETS_EUR) => {
    const valuesEUR = BASE_PRESETS_EUR[preset];
    setGarageRevenue(convertFromEUR(valuesEUR.garage, currency));
    setShopRevenue(convertFromEUR(valuesEUR.shop, currency));
    setMobileRevenue(includeMobile ? convertFromEUR(valuesEUR.mobile, currency) : 0);
  };

  // Convert user inputs to EUR for calculation (pricing.ts is source of truth)
  const resultEUR = calculatePricing(
    { 
      garage: convertToEUR(garageRevenue, currency), 
      shop: convertToEUR(shopRevenue, currency), 
      mobile: convertToEUR(mobileRevenue, currency) 
    },
    { includeMobile, contractType }
  );

  // Convert all cost fields to target currency for display
  const result = {
    ...resultEUR,
    total: convertFromEUR(resultEUR.total, currency),
    usage: {
      garage: convertFromEUR(resultEUR.usage.garage, currency),
      shop: convertFromEUR(resultEUR.usage.shop, currency),
      mobile: convertFromEUR(resultEUR.usage.mobile, currency),
    },
    garageCost: convertFromEUR(resultEUR.garageCost, currency),
    shopCost: convertFromEUR(resultEUR.shopCost, currency),
    mobileCost: convertFromEUR(resultEUR.mobileCost, currency),
    discount: convertFromEUR(resultEUR.discount, currency),
    // effectiveRate stays the same (it's a percentage)
  };

  return (
    <div className="grid lg:grid-cols-2 gap-8">
      {/* Controls */}
      <Card className="glass-card p-6 space-y-6 h-fit animate-fade-in">
        <div>
          <h3 className="text-xl font-bold text-foreground mb-2">Calculate Your Price</h3>
          <p className="text-sm text-muted-foreground">
            Enter your annual revenue per service to see your pricing
          </p>
        </div>

        {/* Currency Selector */}
        <div className="space-y-3">
          <Label className="text-sm font-medium text-foreground">Currency</Label>
          <ToggleGroup
            type="single"
            value={currency}
            onValueChange={(value) => value && setCurrency(value)}
            className="grid grid-cols-4 gap-2"
          >
            <ToggleGroupItem value="EUR" className="data-[state=on]:bg-primary data-[state=on]:text-primary-foreground text-xs">
              EUR (€)
            </ToggleGroupItem>
            <ToggleGroupItem value="USD" className="data-[state=on]:bg-primary data-[state=on]:text-primary-foreground text-xs">
              USD ($)
            </ToggleGroupItem>
            <ToggleGroupItem value="GBP" className="data-[state=on]:bg-primary data-[state=on]:text-primary-foreground text-xs">
              GBP (£)
            </ToggleGroupItem>
            <ToggleGroupItem value="SEK" className="data-[state=on]:bg-primary data-[state=on]:text-primary-foreground text-xs">
              SEK (kr)
            </ToggleGroupItem>
            <ToggleGroupItem value="DKK" className="data-[state=on]:bg-primary data-[state=on]:text-primary-foreground text-xs">
              DKK (kr)
            </ToggleGroupItem>
            <ToggleGroupItem value="NOK" className="data-[state=on]:bg-primary data-[state=on]:text-primary-foreground text-xs">
              NOK (kr)
            </ToggleGroupItem>
            <ToggleGroupItem value="CHF" className="data-[state=on]:bg-primary data-[state=on]:text-primary-foreground text-xs">
              CHF (Fr)
            </ToggleGroupItem>
            <ToggleGroupItem value="PLN" className="data-[state=on]:bg-primary data-[state=on]:text-primary-foreground text-xs">
              PLN (zł)
            </ToggleGroupItem>
          </ToggleGroup>
        </div>

        {/* Preset Scenarios */}
        <div className="space-y-3">
          <Label className="text-sm font-medium text-foreground">Quick Presets</Label>
          <div className="grid grid-cols-3 gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => applyPreset('small')}
              className="flex flex-col h-auto py-3"
            >
              <span className="text-xs font-semibold">Small</span>
              <span className="text-xs text-muted-foreground">≤ {currencyConfig.symbol}2M</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => applyPreset('large')}
              className="flex flex-col h-auto py-3"
            >
              <span className="text-xs font-semibold">Large</span>
              <span className="text-xs text-muted-foreground">{currencyConfig.symbol}2-40M</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => applyPreset('enterprise')}
              className="flex flex-col h-auto py-3 relative"
            >
              <Sparkles className="w-3 h-3 absolute top-1 right-1 text-primary" />
              <span className="text-xs font-semibold">Enterprise</span>
              <span className="text-xs text-muted-foreground">{currencyConfig.symbol}40M+</span>
            </Button>
          </div>
          <p className="text-xs text-muted-foreground italic">
            * Revenue bands are approximate. Pricing decreases continuously as revenue grows.
          </p>
        </div>

        {/* Revenue Inputs - Mobile Accordion */}
        <div className="block lg:hidden">
          <Accordion type="single" collapsible defaultValue="revenue-inputs">
            <AccordionItem value="revenue-inputs" className="border-none">
              <AccordionTrigger className="hover:no-underline">
                <div className="flex items-center gap-2">
                  <Settings className="w-4 h-4" />
                  <span className="font-medium">Revenue Inputs</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="space-y-6 pt-4">
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
                    <Label htmlFor="mobile-toggle-mobile" className="text-sm font-medium text-foreground">
                      Offer Mobile Service?
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      Enable if you provide mobile/on-site services
                    </p>
                  </div>
                  <Switch
                    id="mobile-toggle-mobile"
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
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>

        {/* Revenue Inputs - Desktop */}
        <div className="hidden lg:block space-y-6">
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
          <div className="flex items-center justify-between p-4 rounded-lg bg-muted/30 border border-border transition-all duration-200">
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
            <div className="animate-fade-in">
              <RevenueInput
                label={`Mobile Annual Revenue (${currencyConfig.symbol})`}
                value={mobileRevenue}
                onChange={setMobileRevenue}
                max={currencyConfig.maxRevenue}
                currency={currency}
                tooltip="Enter your total annual revenue from mobile/on-site services"
              />
            </div>
          )}
        </div>

        {/* Contract Type Selector */}
        <div className="space-y-3">
          <Label className="text-sm font-medium text-foreground">Contract Type</Label>
          <p className="text-xs text-muted-foreground">
            All rates decrease continuously across 10 revenue tiers—no sudden jumps.
          </p>
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
      </Card>

      {/* Results */}
      <div className="space-y-4">
        <PricingBreakdown
          result={result}
          currency={currency}
          contractType={contractType}
          includeMobile={includeMobile}
          revenues={{
            garage: garageRevenue,
            shop: shopRevenue,
            mobile: mobileRevenue,
          }}
        />
      </div>
    </div>
  );
}
