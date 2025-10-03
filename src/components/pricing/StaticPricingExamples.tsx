import { Card } from "@/components/ui/card";
import { formatCurrency } from "@/utils/formatCurrency";
import { calculatePricing } from "@/utils/pricing";

interface StaticPricingExamplesProps {
  currency: string;
}

export function StaticPricingExamples({ currency }: StaticPricingExamplesProps) {
  const examples = [
    {
      description: "Small Business",
      revenues: { garage: 750_000, shop: 200_000, mobile: 50_000 },
      label: "€1M total revenue"
    },
    {
      description: "Growing Business",
      revenues: { garage: 5_000_000, shop: 3_000_000, mobile: 0 },
      label: "€8M total (no mobile)"
    },
    {
      description: "Large Business",
      revenues: { garage: 6_000_000, shop: 3_000_000, mobile: 1_000_000 },
      label: "€10M total revenue"
    },
    {
      description: "Enterprise",
      revenues: { garage: 90_000_000, shop: 80_000_000, mobile: 24_000_000 },
      label: "€194M total revenue"
    }
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-foreground mb-2">Example Pricing Scenarios</h2>
        <p className="text-sm text-muted-foreground">
          See what businesses like yours typically pay (with yearly contract)
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {examples.map((example) => {
          const result = calculatePricing(
            example.revenues,
            { includeMobile: example.revenues.mobile > 0, contractType: 'yearly' }
          );

          return (
            <Card key={example.description} className="p-5 hover:shadow-md transition-all duration-200">
              <div className="space-y-3">
                <div>
                  <h4 className="font-semibold text-foreground">{example.description}</h4>
                  <p className="text-xs text-muted-foreground">{example.label}</p>
                </div>

                <div className="space-y-1 text-sm">
                  {example.revenues.garage > 0 && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Garage:</span>
                      <span className="font-medium">{formatCurrency(example.revenues.garage, currency)}</span>
                    </div>
                  )}
                  {example.revenues.shop > 0 && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Shop:</span>
                      <span className="font-medium">{formatCurrency(example.revenues.shop, currency)}</span>
                    </div>
                  )}
                  {example.revenues.mobile > 0 && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Mobile:</span>
                      <span className="font-medium">{formatCurrency(example.revenues.mobile, currency)}</span>
                    </div>
                  )}
                </div>

                <div className="pt-3 border-t border-border flex justify-between items-center">
                  <span className="text-sm font-semibold text-foreground">Annual Cost:</span>
                  <span className="text-lg font-bold text-primary">{formatCurrency(result.total, currency)}</span>
                </div>

                <div className="text-xs text-muted-foreground">
                  Effective rate: ~{result.effectiveRate.toFixed(2)}%
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      <p className="text-xs text-muted-foreground text-center italic">
        These are examples only. Your actual rate depends on your exact revenue mix.
      </p>
    </div>
  );
}
