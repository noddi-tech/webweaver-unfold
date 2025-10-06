import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { NumericStepperInput } from "./NumericStepperInput";
import { PricingBreakdown } from "./PricingBreakdown";
import { calculatePricing } from "@/utils/pricing";
import { getCurrencyConfig, DEFAULT_CURRENCY } from "@/config/pricing";
import { Sparkles } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Info } from "lucide-react";
import { convertFromEUR, convertToEUR } from "@/utils/currencyConversion";
import { CurrencyFlag } from "./CurrencyFlag";

const getCurrencySymbol = (currency: string) => {
  const symbols: Record<string, string> = {
    EUR: '€', USD: '$', GBP: '£', SEK: 'kr',
    DKK: 'kr', NOK: 'kr', CHF: 'Fr', PLN: 'zł'
  };
  return symbols[currency] || currency;
};

interface PricingCalculatorModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}


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
    if (revenue < 50_000_000) return 5_000_000;
    return 10_000_000;
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
              <Select value={currency} onValueChange={(value) => value && setCurrency(value)}>
                <SelectTrigger className="w-full">
                  <SelectValue>
                    <div className="flex items-center gap-2">
                      <CurrencyFlag currency={currency} className="w-4 h-3" />
                      <span>{currency} ({getCurrencySymbol(currency)})</span>
                    </div>
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="EUR">
                    <div className="flex items-center gap-2">
                      <CurrencyFlag currency="EUR" className="w-4 h-3" />
                      <span>EUR (€)</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="USD">
                    <div className="flex items-center gap-2">
                      <CurrencyFlag currency="USD" className="w-4 h-3" />
                      <span>USD ($)</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="GBP">
                    <div className="flex items-center gap-2">
                      <CurrencyFlag currency="GBP" className="w-4 h-3" />
                      <span>GBP (£)</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="SEK">
                    <div className="flex items-center gap-2">
                      <CurrencyFlag currency="SEK" className="w-4 h-3" />
                      <span>SEK (kr)</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="DKK">
                    <div className="flex items-center gap-2">
                      <CurrencyFlag currency="DKK" className="w-4 h-3" />
                      <span>DKK (kr)</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="NOK">
                    <div className="flex items-center gap-2">
                      <CurrencyFlag currency="NOK" className="w-4 h-3" />
                      <span>NOK (kr)</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="CHF">
                    <div className="flex items-center gap-2">
                      <CurrencyFlag currency="CHF" className="w-4 h-3" />
                      <span>CHF (Fr)</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="PLN">
                    <div className="flex items-center gap-2">
                      <CurrencyFlag currency="PLN" className="w-4 h-3" />
                      <span>PLN (zł)</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
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
                  {currencyConfig.symbol}{(garageRevenue + shopRevenue + (includeMobile ? mobileRevenue : 0)).toLocaleString()}
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
