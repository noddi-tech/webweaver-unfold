import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { type ScaleTier } from '@/config/newPricing';
import { formatRevenue, formatPercentage } from '@/utils/newPricingCalculator';

interface ScaleTierTableProps {
  tiers: ScaleTier[];
  currentTier?: number;
}

export function ScaleTierTable({ tiers, currentTier }: ScaleTierTableProps) {
  return (
    <div className="rounded-lg border border-border overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50">
            <TableHead className="w-[80px]">Tier</TableHead>
            <TableHead>Revenue Threshold</TableHead>
            <TableHead className="text-right">Take Rate</TableHead>
            <TableHead className="text-right hidden sm:table-cell">Multiplier</TableHead>
            <TableHead className="text-right hidden sm:table-cell">Rate Change</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {tiers.map((tier) => (
            <TableRow 
              key={tier.tier}
              className={currentTier === tier.tier ? 'bg-primary/5 border-l-2 border-l-primary' : ''}
            >
              <TableCell>
                <div className="flex items-center gap-2">
                  <span className="font-medium">{tier.tier}</span>
                  {currentTier === tier.tier && (
                    <Badge variant="default" className="text-xs">You</Badge>
                  )}
                </div>
              </TableCell>
              <TableCell>
                <span className="font-medium">{formatRevenue(tier.revenueThreshold)}</span>
                {tier.tier < tiers.length && (
                  <span className="text-muted-foreground text-sm ml-1">
                    – {formatRevenue(tiers[tier.tier]?.revenueThreshold || tier.revenueThreshold * 1.5)}
                  </span>
                )}
                {tier.tier === tiers.length && (
                  <span className="text-muted-foreground text-sm ml-1">+</span>
                )}
              </TableCell>
              <TableCell className="text-right">
                <span className={`font-semibold ${tier.tier <= 3 ? 'text-foreground' : 'text-primary'}`}>
                  {formatPercentage(tier.takeRate * 100, 2)}
                </span>
              </TableCell>
              <TableCell className="text-right hidden sm:table-cell">
                {tier.revenueMultiplier ? (
                  <span className="text-muted-foreground">×{tier.revenueMultiplier}</span>
                ) : (
                  <span className="text-muted-foreground">—</span>
                )}
              </TableCell>
              <TableCell className="text-right hidden sm:table-cell">
                {tier.rateReduction ? (
                  <span className="text-green-600">
                    -{formatPercentage(tier.rateReduction * 100, 2)}
                  </span>
                ) : (
                  <span className="text-muted-foreground">—</span>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
