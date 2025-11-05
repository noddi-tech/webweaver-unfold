import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, Users, Handshake, BarChart, Globe, Euro } from "lucide-react";
import { useTypography } from "@/hooks/useTypography";
import { useAppTranslation } from "@/hooks/useAppTranslation";
import { EditableBackground } from "@/components/EditableBackground";

export default function ProofMetrics() {
  const { h2, body } = useTypography();
  const { t } = useAppTranslation();

  const metrics = [
    {
      icon: TrendingUp,
      headline: t('proof_metrics.metric_1.headline', '~90 NPS.'),
      context: t('proof_metrics.metric_1.context', 'Three times the industry average.'),
      comparison: t('proof_metrics.metric_1.comparison', 'vs. 20-30 industry standard'),
    },
    {
      icon: Users,
      headline: t('proof_metrics.metric_2.headline', '20,000+ bookings.'),
      context: t('proof_metrics.metric_2.context', 'Zero sync issues.'),
      comparison: t('proof_metrics.metric_2.comparison', 'And growing'),
    },
    {
      icon: Handshake,
      headline: t('proof_metrics.metric_3.headline', '4 SaaS partners.'),
      context: t('proof_metrics.metric_3.context', '1 shared platform.'),
      comparison: t('proof_metrics.metric_3.comparison', 'Active paying customers'),
    },
    {
      icon: BarChart,
      headline: t('proof_metrics.metric_4.headline', '>49% market growth YoY.'),
      context: t('proof_metrics.metric_4.context', 'In convenience services.'),
      comparison: t('proof_metrics.metric_4.comparison', 'Convenience services sector'),
    },
    {
      icon: Globe,
      headline: t('proof_metrics.metric_5.headline', '€65B addressable market.'),
      context: t('proof_metrics.metric_5.context', 'Global automotive services.'),
      comparison: t('proof_metrics.metric_5.comparison', 'Ready to scale'),
    },
    {
      icon: Euro,
      headline: t('proof_metrics.metric_6.headline', 'Performance-based model.'),
      context: t('proof_metrics.metric_6.context', 'We grow when you grow.'),
      comparison: t('proof_metrics.metric_6.comparison', 'Pure SaaS pricing'),
    },
  ];
  
  return (
    <section className="py-section">
      <div className="container max-w-container px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className={`${h2} mb-4 text-foreground`}>
            {t('proof_metrics.title', 'Real Numbers. Real Results.')}
          </h2>
          <p className={`${body} text-muted-foreground max-w-2xl mx-auto`}>
            {t('proof_metrics.subtitle', 'Noddi powers operations across Europe with proven performance.')}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {metrics.map((metric, index) => {
            const Icon = metric.icon;
            return (
              <EditableBackground
                key={index}
                elementId={`partners-metric-${index}`}
                defaultBackground="glass-card"
                allowedBackgrounds={[
                  'bg-gradient-hero',
                  'bg-gradient-sunset',
                  'bg-gradient-warmth',
                  'bg-gradient-ocean',
                  'bg-gradient-fire',
                  'glass-card',
                  'liquid-glass',
                  'glass-prominent',
                  'bg-card',
                  'bg-background',
                  'bg-muted'
                ]}
              >
                <Card className="text-center hover:shadow-lg transition-shadow">
                  <CardContent className="pt-8 pb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-6">
                      <Icon className="w-8 h-8 text-primary" />
                    </div>
                    <h3 className="text-2xl font-bold mb-2 text-foreground">
                      {metric.headline}
                    </h3>
                    <p className="text-base font-medium text-foreground mb-2">
                      {metric.context}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {metric.comparison}
                    </p>
                  </CardContent>
                </Card>
              </EditableBackground>
            );
          })}
        </div>
      </div>
    </section>
  );
}
