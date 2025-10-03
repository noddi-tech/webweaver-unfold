import { Card } from "@/components/ui/card";
import { TrendingDown } from "lucide-react";

export function RateReductionChart() {
  const dataPoints = [
    { tier: "Tier 1", rate: 4.0, label: "€0-100k (billable)" },
    { tier: "Tier 4", rate: 2.5, label: "€2.5M" },
    { tier: "Tier 7", rate: 1.8, label: "€40M" },
    { tier: "Tier 10", rate: 1.2, label: "€2B+" }
  ];

  const maxRate = 4.5;

  return (
    <Card className="p-6 max-w-3xl mx-auto">
      <div className="space-y-6">
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <TrendingDown className="w-5 h-5 text-primary" />
            <h3 className="text-xl font-bold text-foreground">How Your Rate Decreases as You Grow</h3>
          </div>
          <p className="text-sm text-muted-foreground">
            No sudden jumps—just continuous savings
          </p>
        </div>

        {/* Simple Bar Chart */}
        <div className="space-y-4">
          {dataPoints.map((point, index) => {
            const widthPercent = (point.rate / maxRate) * 100;
            
            return (
              <div key={point.tier} className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground font-medium">{point.tier}</span>
                  <span className="text-xs text-muted-foreground">{point.label}</span>
                </div>
                <div className="relative h-12 bg-muted/30 rounded-lg overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-primary to-primary/60 rounded-lg transition-all duration-700 ease-out flex items-center justify-end pr-3"
                    style={{ 
                      width: `${widthPercent}%`,
                      animationDelay: `${index * 100}ms` 
                    }}
                  >
                    <span className="text-sm font-bold text-white drop-shadow-lg">
                      {point.rate}%
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="text-center">
          <p className="text-xs text-muted-foreground italic">
            Effective take-rates shown. Your rate decreases continuously across 10 tiers as your revenue grows.
          </p>
        </div>
      </div>
    </Card>
  );
}
