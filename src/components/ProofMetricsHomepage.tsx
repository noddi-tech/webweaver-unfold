import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, Users, Award, Target } from "lucide-react";
import { Counter } from "@/components/ui/counter";
import { Button } from "@/components/ui/button";
import { LanguageLink } from "@/components/LanguageLink";
import { ArrowRight } from "lucide-react";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { useAppTranslation } from "@/hooks/useAppTranslation";
import { EditableBackground } from "@/components/EditableBackground";

export default function ProofMetricsHomepage() {
  const { ref, isVisible } = useScrollAnimation({ threshold: 0.2 });
  const { t } = useAppTranslation();

  const metrics = [
    {
      icon: Award,
      value: 90,
      suffix: "",
      prefix: "~",
      label: t('proof_metrics.metric_1.label', "NPS Score"),
      context: t('proof_metrics.metric_1.context', "Industry-leading customer satisfaction")
    },
    {
      icon: TrendingUp,
      value: 20000,
      suffix: "+",
      prefix: "",
      label: t('proof_metrics.metric_2.label', "Bookings Completed"),
      context: t('proof_metrics.metric_2.context', "Proven at scale")
    },
    {
      icon: Users,
      value: 50,
      suffix: "+",
      prefix: "",
      label: t('proof_metrics.metric_3.label', "Active Locations"),
      context: t('proof_metrics.metric_3.context', "Across Scandinavia")
    },
    {
      icon: Target,
      value: 95,
      suffix: "%",
      prefix: "",
      label: t('proof_metrics.metric_4.label', "Automation Rate"),
      context: t('proof_metrics.metric_4.context', "Manual tasks eliminated")
    }
  ];

  return (
    <section ref={ref as any} className="py-section">
      <div className="container max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-foreground">
            {t('proof_metrics.title', 'Built for production. Proven in practice.')}
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            {t('proof_metrics.subtitle', 'Numbers that matter—from real operations')}
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {metrics.map((metric, index) => {
            const Icon = metric.icon;
            return (
              <EditableBackground
                key={index}
                elementId={`proof-metric-card-${index}`}
                defaultBackground="bg-card"
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
                <Card 
                  className={`hover-scale transition-all duration-500 ${
                    isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
                  }`}
                  style={{ transitionDelay: `${index * 100}ms` }}
                >
                  <CardContent className="p-6 text-center">
                    <div className="w-12 h-12 rounded-lg bg-gradient-primary flex items-center justify-center mx-auto mb-4 shadow-lg">
                      <Icon className="w-6 h-6 text-primary-foreground" />
                    </div>
                    <div className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent mb-2">
                      <Counter 
                        end={metric.value} 
                        suffix={metric.suffix}
                        prefix={metric.prefix}
                      />
                    </div>
                    <div className="text-sm font-semibold text-foreground mb-2">
                      {metric.label}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {metric.context}
                    </p>
                  </CardContent>
                </Card>
              </EditableBackground>
            );
          })}
        </div>

        <div className="text-center">
          <LanguageLink to="/partners">
            <Button size="lg" variant="secondary" className="text-lg px-8 py-6 group">
              {t('proof_metrics.cta', 'See Customer Stories')}
              <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </LanguageLink>
        </div>
      </div>
    </section>
  );
}
