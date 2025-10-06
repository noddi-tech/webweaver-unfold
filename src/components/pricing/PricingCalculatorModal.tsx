import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Button } from "@/components/ui/button";
import { NumericStepperInput } from "./NumericStepperInput";
import { PricingBreakdown } from "./PricingBreakdown";
import { calculatePricing } from "@/utils/pricing";
import { getCurrencyConfig, DEFAULT_CURRENCY } from "@/config/pricing";
import { Sparkles } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Info } from "lucide-react";
import { convertFromEUR, convertToEUR } from "@/utils/currencyConversion";

interface PricingCalculatorModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// Base presets in EUR (source of truth)
const BASE_PRESETS_EUR = {
  small: { garage: 1_000_000, shop: 500_000, mobile: 200_000 },
  large: { garage: 20_000_000, shop: 15_000_000, mobile: 5_000_000 },
  enterprise: { garage: 150_000_000, shop: 100_000_000, mobile: 50_000_000 },
};

export function PricingCalculatorModal({ open, onOpenChange }: PricingCalculatorModalProps) {
  const [currency, setCurrency] = useState(() => {
    const saved = localStorage.getItem('noddi-pricing-currency');
    return saved || DEFAULT_CURRENCY;
  });
  const [previousCurrency, setPreviousCurrency] = useState(currency);

  const currencyConfig = getCurrencyConfig(currency);
  
  const [garageRevenue, setGarageRevenue] = useState(5_000_000);
  const [shopRevenue, setShopRevenue] = useState(3_000_000);
  const [mobileRevenue, setMobileRevenue] = useState(1_000_000);
  const [includeMobile, setIncludeMobile] = useState(true);
  const [contractType, setContractType] = useState<'none' | 'monthly' | 'yearly'>('yearly');

  useEffect(() => {
    if (currency !== previousCurrency) {
      // Auto-convert revenue values when currency changes
      const garageEUR = convertToEUR(garageRevenue, previousCurrency);
      const shopEUR = convertToEUR(shopRevenue, previousCurrency);
      const mobileEUR = convertToEUR(mobileRevenue, previousCurrency);
      
      setGarageRevenue(Math.round(convertFromEUR(garageEUR, currency)));
      setShopRevenue(Math.round(convertFromEUR(shopEUR, currency)));
      setMobileRevenue(Math.round(convertFromEUR(mobileEUR, currency)));
      
      setPreviousCurrency(currency);
    }
    localStorage.setItem('noddi-pricing-currency', currency);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currency, previousCurrency]);

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

  // Determine step size based on revenue scale
  const getStepSize = (revenue: number) => {
    if (revenue < 1_000_000) return 50_000;
    if (revenue < 10_000_000) return 500_000;
    return 5_000_000;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">Get a Detailed Estimate</DialogTitle>
          <DialogDescription>
            Enter your exact revenue figures to calculate your precise pricing
          </DialogDescription>
        </DialogHeader>

        <div className="grid lg:grid-cols-2 gap-6 pt-4">
          {/* Controls */}
          <div className="space-y-6">
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
            </div>

            {/* Revenue Inputs */}
            <div className="space-y-6">
              {/* Garage Revenue */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Label className="text-sm font-medium text-foreground">
                    Garage Annual Revenue ({currencyConfig.symbol})
                  </Label>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="w-4 h-4 text-muted-foreground cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent className="max-w-xs">
                        <p className="text-sm">Enter your total annual revenue from garage services (repairs, maintenance, etc.)</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <NumericStepperInput
                  value={garageRevenue}
                  onChange={setGarageRevenue}
                  currency={currency}
                  max={currencyConfig.maxRevenue}
                  step={getStepSize(garageRevenue)}
                />
              </div>

              {/* Shop Revenue */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Label className="text-sm font-medium text-foreground">
                    Shop Annual Revenue ({currencyConfig.symbol})
                  </Label>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="w-4 h-4 text-muted-foreground cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent className="max-w-xs">
                        <p className="text-sm">Enter your total annual revenue from shop/retail services (parts sales, accessories, etc.)</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <NumericStepperInput
                  value={shopRevenue}
                  onChange={setShopRevenue}
                  currency={currency}
                  max={currencyConfig.maxRevenue}
                  step={getStepSize(shopRevenue)}
                />
              </div>

              {/* Mobile Service Toggle */}
              <div className="flex items-center justify-between p-4 rounded-lg bg-muted/30 border border-border">
                <div className="space-y-1">
                  <Label htmlFor="mobile-toggle-modal" className="text-sm font-medium text-foreground">
                    Offer Mobile Service?
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Enable if you provide mobile/on-site services
                  </p>
                </div>
                <Switch
                  id="mobile-toggle-modal"
                  checked={includeMobile}
                  onCheckedChange={setIncludeMobile}
                />
              </div>

              {/* Mobile Revenue (conditional) */}
              {includeMobile && (
                <div className="space-y-3 animate-fade-in">
                  <div className="flex items-center gap-2">
                    <Label className="text-sm font-medium text-foreground">
                      Mobile Annual Revenue ({currencyConfig.symbol})
                    </Label>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Info className="w-4 h-4 text-muted-foreground cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent className="max-w-xs">
                          <p className="text-sm">Enter your total annual revenue from mobile/on-site services</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  <NumericStepperInput
                    value={mobileRevenue}
                    onChange={setMobileRevenue}
                    currency={currency}
                    max={currencyConfig.maxRevenue}
                    step={getStepSize(mobileRevenue)}
                  />
                </div>
              )}
            </div>

            {/* Total Revenue Display */}
            <Card className="p-4 bg-muted/30 border-border">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium text-foreground">Total Annual Revenue</Label>
                <span className="text-lg font-semibold text-primary">
                  {currencyConfig.symbol}{(garageRevenue + shopRevenue + mobileRevenue).toLocaleString()}
                </span>
              </div>
            </Card>
          </div>

          {/* Results */}
          <div>
              <PricingBreakdown
                result={result}
                currency={currency}
                contractType={contractType}
                onContractTypeChange={setContractType}
                includeMobile={includeMobile}
              />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
