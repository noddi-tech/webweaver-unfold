import { TrendingUp, Check, Building2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { type ScaleConfig, type ScaleTier } from '@/config/newPricing';
import { useCurrency } from '@/contexts/CurrencyContext';

interface ScaleTierCardProps {
  config: ScaleConfig;
  tiers: ScaleTier[];
  onSelect?: () => void;
  isSelected?: boolean;
}

export function ScaleTierCard({ config, tiers, onSelect, isSelected }: ScaleTierCardProps) {
  const { formatAmount, formatRevenue } = useCurrency();
  
  const minRate = tiers.length > 0 ? Math.min(...tiers.map(t => t.takeRate)) * 100 : 0.7;
  const maxRate = tiers.length > 0 ? Math.max(...tiers.map(t => t.takeRate)) * 100 : 1.5;
  
  // Get first and last tier for display
  const firstTier = tiers[0];
  const lastTier = tiers[tiers.length - 1];
  
  const features = [
    'Unlimited locations',
    'Full platform access',
    'Priority support',
    'Advanced analytics',
    'API access',
    'Custom integrations',
    'Dedicated account manager'
  ];

  return (
    <Card className={`relative overflow-hidden transition-all duration-300 ${isSelected ? 'ring-2 ring-primary shadow-lg' : 'hover:shadow-md'}`}>
      {/* Popular badge */}
      <div className="absolute top-0 right-0">
        <Badge className="rounded-none rounded-bl-lg bg-primary text-primary-foreground">
          Most Popular
        </Badge>
      </div>
      
      <CardHeader className="pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <TrendingUp className="w-6 h-6 text-primary" />
          </div>
          <div>
            <CardTitle className="text-2xl">Scale</CardTitle>
            <CardDescription>For growing businesses</CardDescription>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Pricing */}
        <div className="space-y-2">
          <div className="flex items-baseline gap-1">
            <span className="text-4xl font-bold">{formatAmount(config.fixedMonthly)}</span>
            <span className="text-muted-foreground">/month</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Building2 className="w-4 h-4" />
            <span>+ {formatAmount(config.perDepartment)}/location/month</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-lg font-semibold text-primary">
              {minRate.toFixed(1)}% – {maxRate.toFixed(1)}%
            </span>
            <span className="text-muted-foreground">tiered revenue</span>
          </div>
        </div>
        
        {/* Tier preview */}
        <div className="p-3 rounded-lg bg-gradient-to-r from-primary/5 to-primary/10 border border-primary/20">
          <p className="text-xs font-medium text-primary mb-2">{tiers.length} Revenue Tiers</p>
          <p className="text-sm text-muted-foreground">
            Rate decreases as your revenue grows, from {maxRate.toFixed(1)}% at {firstTier ? formatRevenue(firstTier.revenueThreshold) : '€1M'} to {minRate.toFixed(1)}% at {lastTier ? formatRevenue(lastTier.revenueThreshold) : '€389M'}+
          </p>
        </div>
        
        {/* Divider */}
        <div className="border-t border-border" />
        
        {/* Features */}
        <div className="space-y-3">
          <p className="font-medium text-sm text-muted-foreground uppercase tracking-wide">Includes everything in Launch, plus</p>
          <ul className="space-y-2">
            {features.map((feature, index) => (
              <li key={index} className="flex items-center gap-2 text-sm">
                <Check className="w-4 h-4 text-primary flex-shrink-0" />
                <span>{feature}</span>
              </li>
            ))}
          </ul>
        </div>
        
        {/* Best for */}
        <div className="p-4 rounded-lg bg-muted/50">
          <p className="text-sm font-medium mb-1">Best for:</p>
          <p className="text-sm text-muted-foreground">
            Multi-location businesses with €1M+ annual revenue looking for the best value
          </p>
        </div>
        
        {/* CTA */}
        {onSelect && (
          <Button 
            onClick={onSelect} 
            variant={isSelected ? 'default' : 'outline'} 
            className="w-full"
          >
            {isSelected ? 'Selected' : 'Choose Scale'}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
