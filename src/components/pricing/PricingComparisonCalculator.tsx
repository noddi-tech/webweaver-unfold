import { useState, useMemo } from 'react';
import { Calculator, Rocket, TrendingUp, ArrowRight, Building2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { usePricingConfig } from '@/hooks/usePricingConfig';
import { comparePricing, formatPercentage } from '@/utils/newPricingCalculator';
import { useCurrency } from '@/contexts/CurrencyContext';
import { CurrencySwitcher } from '@/components/pricing/CurrencySwitcher';

export function PricingComparisonCalculator() {
  const { formatAmount, formatRevenue, config: currencyConfig } = useCurrency();
  const { launch, scale, scaleTiers, isLoading } = usePricingConfig();
  
  // Revenue presets for slider (in EUR)
  const revenuePresets = [
    100_000, 250_000, 500_000, 750_000,
    1_000_000, 2_000_000, 3_000_000, 5_000_000,
    10_000_000, 20_000_000, 50_000_000, 100_000_000
  ];
  
  const [revenueIndex, setRevenueIndex] = useState(4); // Default to €1M
  const [departments, setDepartments] = useState(2);
  
  const annualRevenue = revenuePresets[revenueIndex];
  
  const comparison = useMemo(() => {
    return comparePricing(annualRevenue, departments, launch, scale, scaleTiers);
  }, [annualRevenue, departments, launch, scale, scaleTiers]);
  
  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <div className="animate-pulse text-muted-foreground">Loading calculator...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-primary/5 to-primary/10 border-b">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Calculator className="w-6 h-6 text-primary" />
            </div>
            <div>
              <CardTitle>Pricing Calculator</CardTitle>
              <CardDescription>Find the best tier for your business</CardDescription>
            </div>
          </div>
          <CurrencySwitcher variant="compact" />
        </div>
      </CardHeader>
      
      <CardContent className="p-6 space-y-8">
        {/* Inputs */}
        <div className="space-y-6">
          {/* Revenue slider */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-base">Annual Revenue</Label>
              <span className="text-2xl font-bold text-primary">
                {formatRevenue(annualRevenue)}
              </span>
            </div>
            <Slider
              value={[revenueIndex]}
              onValueChange={([value]) => setRevenueIndex(value)}
              min={0}
              max={revenuePresets.length - 1}
              step={1}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{formatRevenue(100_000)}</span>
              <span>{formatRevenue(100_000_000)}</span>
            </div>
          </div>
          
          {/* Departments slider */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-base flex items-center gap-2">
                <Building2 className="w-4 h-4" />
                Number of Locations
              </Label>
              <span className="text-2xl font-bold text-primary">
                {departments}
              </span>
            </div>
            <Slider
              value={[departments]}
              onValueChange={([value]) => setDepartments(value)}
              min={1}
              max={50}
              step={1}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>1 location</span>
              <span>50 locations</span>
            </div>
          </div>
        </div>
        
        {/* Results */}
        <div className="grid md:grid-cols-2 gap-4">
          {/* Launch result */}
          <div className={`p-4 rounded-lg border-2 transition-all ${
            comparison.recommendation === 'launch' 
              ? 'border-primary bg-primary/5' 
              : 'border-border bg-muted/30'
          }`}>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Rocket className="w-5 h-5 text-primary" />
                <span className="font-semibold">Launch</span>
              </div>
              {comparison.recommendation === 'launch' && (
                <Badge className="bg-green-500 hover:bg-green-600">Best Value</Badge>
              )}
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Fixed (yearly)</span>
                <span>{formatAmount(comparison.launch.fixedCostYearly)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Revenue ({(launch.revenuePercentage * 100).toFixed(0)}%)</span>
                <span>{formatAmount(comparison.launch.revenueCost)}</span>
              </div>
              <div className="border-t pt-2 mt-2">
                <div className="flex justify-between font-semibold">
                  <span>Total/year</span>
                  <span className="text-lg">{formatAmount(comparison.launch.totalYearly)}</span>
                </div>
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Effective rate</span>
                  <span>{formatPercentage(comparison.launch.effectiveRate)}</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Scale result */}
          <div className={`p-4 rounded-lg border-2 transition-all ${
            comparison.recommendation === 'scale' 
              ? 'border-primary bg-primary/5' 
              : 'border-border bg-muted/30'
          }`}>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-primary" />
                <span className="font-semibold">Scale</span>
                <Badge variant="outline" className="text-xs">Tier {comparison.scale.tier}</Badge>
              </div>
              {comparison.recommendation === 'scale' && (
                <Badge className="bg-green-500 hover:bg-green-600">Best Value</Badge>
              )}
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Fixed (yearly)</span>
                <span>{formatAmount(comparison.scale.totalFixedYearly)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Revenue ({formatPercentage(comparison.scale.tierTakeRate * 100)})</span>
                <span>{formatAmount(comparison.scale.revenueCost)}</span>
              </div>
              <div className="border-t pt-2 mt-2">
                <div className="flex justify-between font-semibold">
                  <span>Total/year</span>
                  <span className="text-lg">{formatAmount(comparison.scale.totalYearly)}</span>
                </div>
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Effective rate</span>
                  <span>{formatPercentage(comparison.scale.effectiveRate)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Savings callout */}
        {comparison.savingsAmount > 0 && (
          <div className="p-4 rounded-lg bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800">
            <div className="flex items-center gap-2 text-green-700 dark:text-green-400">
              <ArrowRight className="w-5 h-5" />
              <span className="font-medium">
                Save {formatAmount(comparison.savingsAmount)}/year ({formatPercentage(comparison.savingsPercentage, 0)}) with {comparison.recommendation === 'launch' ? 'Launch' : 'Scale'}
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
