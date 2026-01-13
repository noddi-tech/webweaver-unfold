import { Rocket, Check } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { type LaunchConfig } from '@/config/newPricing';
import { useCurrency } from '@/contexts/CurrencyContext';

interface LaunchTierCardProps {
  config: LaunchConfig;
  onSelect?: () => void;
  isSelected?: boolean;
}

export function LaunchTierCard({ config, onSelect, isSelected }: LaunchTierCardProps) {
  const { formatAmount } = useCurrency();
  
  const features = [
    'Single location setup',
    'Full platform access',
    'Standard support',
    'Basic analytics',
    'Email notifications'
  ];

  return (
    <Card className={`relative overflow-hidden transition-all duration-300 border-2 border-emerald-500 ${isSelected ? 'ring-2 ring-emerald-500 shadow-lg shadow-emerald-500/20' : 'hover:shadow-md hover:border-emerald-400'}`}>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Rocket className="w-6 h-6 text-primary" />
            </div>
            <div>
              <CardTitle className="text-2xl">Launch</CardTitle>
              <CardDescription>For getting started</CardDescription>
            </div>
          </div>
          <Badge variant="secondary">Simple</Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Pricing */}
        <div className="space-y-2">
          <div className="flex items-baseline gap-1">
            <span className="text-4xl font-bold">{formatAmount(config.fixedMonthly)}</span>
            <span className="text-muted-foreground">/month</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-lg font-semibold text-primary">+{(config.revenuePercentage * 100).toFixed(0)}%</span>
            <span className="text-muted-foreground">of platform revenue</span>
          </div>
        </div>
        
        {/* Divider */}
        <div className="border-t border-border" />
        
        {/* Features */}
        <div className="space-y-3">
          <p className="font-medium text-sm text-muted-foreground uppercase tracking-wide">Includes</p>
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
            Single locations and businesses with less than €1M annual revenue
          </p>
        </div>
        
        {/* CTA */}
        {onSelect && (
          <Button 
            onClick={onSelect} 
            variant={isSelected ? 'default' : 'outline'} 
            className="w-full"
          >
            {isSelected ? 'Selected' : 'Choose Launch'}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
