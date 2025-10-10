import { Card } from "@/components/ui/card";
import { formatCurrency } from "@/utils/formatCurrency";
import { calculatePricing } from "@/utils/pricing";
import { useAppTranslation } from "@/hooks/useAppTranslation";

interface StaticPricingExamplesProps {
  currency: string;
  contractType: 'none' | 'monthly' | 'yearly';
}

export function StaticPricingExamples({ currency, contractType }: StaticPricingExamplesProps) {
  const { t } = useAppTranslation();

  const examples = [
    {
      description: t('pricing.examples.small.title', 'Small Business'),
      revenues: { garage: 750_000, shop: 200_000, mobile: 50_000 },
      label: t('pricing.examples.small.label', '€1M total revenue')
    },
    {
      description: t('pricing.examples.growing.title', 'Growing Business'),
      revenues: { garage: 5_000_000, shop: 3_000_000, mobile: 0 },
      label: t('pricing.examples.growing.label', '€8M total (no mobile)')
    },
    {
      description: t('pricing.examples.large.title', 'Large Business'),
      revenues: { garage: 6_000_000, shop: 3_000_000, mobile: 1_000_000 },
      label: t('pricing.examples.large.label', '€10M total revenue')
    },
    {
      description: t('pricing.examples.enterprise.title', 'Enterprise'),
      revenues: { garage: 90_000_000, shop: 80_000_000, mobile: 24_000_000 },
      label: t('pricing.examples.enterprise.label', '€194M total revenue')
    }
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-foreground mb-2">
          {t('pricing.examples.title', 'Example Pricing Scenarios')}
        </h2>
        <p className="text-sm text-muted-foreground">
          {contractType === 'none' 
            ? t('pricing.examples.subtitle_base', 'See what businesses like yours typically pay (base pricing)')
            : contractType === 'monthly'
            ? t('pricing.examples.subtitle_monthly', 'See what businesses like yours typically pay (with monthly contract - Save 15%)')
            : t('pricing.examples.subtitle_yearly', 'See what businesses like yours typically pay (with yearly contract - Save 25%)')
          }
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {examples.map((example) => {
          const result = calculatePricing(
            example.revenues,
            { includeMobile: example.revenues.mobile > 0, contractType }
          );

          // Calculate base price (without discount) for comparison
          const baseResult = calculatePricing(
            example.revenues,
            { includeMobile: example.revenues.mobile > 0, contractType: 'none' }
          );

          const hasDiscount = contractType !== 'none';
          const savings = hasDiscount ? baseResult.total - result.total : 0;

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
                      <span className="text-muted-foreground">{t('pricing.examples.label_garage', 'Garage')}:</span>
                      <span className="font-medium">{formatCurrency(example.revenues.garage, currency)}</span>
                    </div>
                  )}
                  {example.revenues.shop > 0 && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">{t('pricing.examples.label_shop', 'Shop')}:</span>
                      <span className="font-medium">{formatCurrency(example.revenues.shop, currency)}</span>
                    </div>
                  )}
                  {example.revenues.mobile > 0 && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">{t('pricing.examples.label_mobile', 'Mobile')}:</span>
                      <span className="font-medium">{formatCurrency(example.revenues.mobile, currency)}</span>
                    </div>
                  )}
                </div>

                <div className="pt-3 border-t border-border space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-semibold text-foreground">
                      {t('pricing.examples.annual_cost', 'Annual Cost')}:
                    </span>
                    <div className="text-right">
                      {hasDiscount && (
                        <div className="text-sm text-muted-foreground line-through">
                          {formatCurrency(baseResult.total, currency)}
                        </div>
                      )}
                      <div className="text-lg font-bold text-primary">
                        {formatCurrency(result.total, currency)}
                      </div>
                    </div>
                  </div>
                  
                  {hasDiscount && (
                    <div className="bg-green-500/10 text-green-700 dark:text-green-400 text-xs font-medium px-2 py-1 rounded">
                      💰 {t('pricing.examples.save', 'Save')} {formatCurrency(savings, currency)} {t('pricing.examples.with_contract', 'with')} {contractType} {t('pricing.examples.contract', 'contract')}
                    </div>
                  )}
                </div>

                <div className="text-xs text-muted-foreground">
                  {t('pricing.examples.effective_rate', 'Effective rate')}: ~{result.effectiveRate.toFixed(2)}%
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      <p className="text-xs text-muted-foreground text-center italic">
        {t('pricing.examples.disclaimer', 'These are examples only. Your actual rate depends on your exact revenue mix.')}
      </p>
    </div>
  );
}
