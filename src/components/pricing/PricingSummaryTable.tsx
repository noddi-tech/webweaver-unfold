import { getCurrencyConfig } from "@/config/pricing";

interface PricingSummaryTableProps {
  currency: string;
}

export function PricingSummaryTable({ currency }: PricingSummaryTableProps) {
  const config = getCurrencyConfig(currency);
  const symbol = config.symbol;

  return (
    <div className="max-w-5xl mx-auto">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left py-4 px-4 text-sm font-semibold text-foreground">Category</th>
              <th className="text-left py-4 px-4 text-sm font-semibold text-foreground">Revenue Range</th>
              <th className="text-left py-4 px-4 text-sm font-semibold text-foreground">Starting Take-Rates</th>
              <th className="text-left py-4 px-4 text-sm font-semibold text-foreground">Effective Rate Example*</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-border/50 hover:bg-muted/30 transition-colors">
              <td className="py-4 px-4">
                <div className="font-semibold text-foreground">Small/Basic</div>
              </td>
              <td className="py-4 px-4 text-sm text-muted-foreground">
                Up to {symbol}{currency === 'NOK' ? '20M' : '2M'}
              </td>
              <td className="py-4 px-4 text-sm text-muted-foreground">
                <div>Garage: 4%</div>
                <div>Shop: 5%</div>
                <div>Mobile: 10%</div>
              </td>
              <td className="py-4 px-4 text-sm font-semibold text-primary">
                ~3.7% at {symbol}{currency === 'NOK' ? '10M' : '1M'}
              </td>
            </tr>
            <tr className="border-b border-border/50 hover:bg-muted/30 transition-colors">
              <td className="py-4 px-4">
                <div className="font-semibold text-foreground">Large</div>
              </td>
              <td className="py-4 px-4 text-sm text-muted-foreground">
                {symbol}{currency === 'NOK' ? '20M – 400M' : '2M – 40M'}
              </td>
              <td className="py-4 px-4 text-sm text-muted-foreground">
                Rates decrease ~20% per tier
              </td>
              <td className="py-4 px-4 text-sm font-semibold text-primary">
                ~3.4% at {symbol}{currency === 'NOK' ? '100M' : '10M'}
              </td>
            </tr>
            <tr className="hover:bg-muted/30 transition-colors">
              <td className="py-4 px-4">
                <div className="font-semibold text-foreground">Enterprise</div>
              </td>
              <td className="py-4 px-4 text-sm text-muted-foreground">
                {symbol}{currency === 'NOK' ? '400M+' : '40M+'}
              </td>
              <td className="py-4 px-4 text-sm text-muted-foreground">
                Lowest rates, down to ~1%
              </td>
              <td className="py-4 px-4 text-sm font-semibold text-primary">
                ~2.9% at {symbol}{currency === 'NOK' ? '800M' : '80M'}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <p className="text-xs text-muted-foreground text-center mt-4 italic">
        *Approximate ranges. Rates decrease continuously across all revenue levels.
      </p>
    </div>
  );
}
