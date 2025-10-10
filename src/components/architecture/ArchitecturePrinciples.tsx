import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Database, Zap, Cloud, Shield, Plug, Gauge } from "lucide-react";
import { useTypography } from "@/hooks/useTypography";
import { useAppTranslation } from "@/hooks/useAppTranslation";

export default function ArchitecturePrinciples() {
  const { h2, body } = useTypography();
  const { t } = useAppTranslation();

  const principles = [
    {
      icon: Database,
      headline: t('architecture.principles.unified.title', 'Everything speaks the same language.'),
      subtext: t('architecture.principles.unified.description', 'One schema for customers, bookings, and tires.'),
    },
    {
      icon: Zap,
      headline: t('architecture.principles.reactive.title', 'The system reacts before you can.'),
      subtext: t('architecture.principles.reactive.description', 'Real-time automation on every action.'),
    },
    {
      icon: Cloud,
      headline: t('architecture.principles.scalable.title', 'Built for cities, not just garages.'),
      subtext: t('architecture.principles.scalable.description', 'Regional deployments, multi-tenant by default.'),
    },
    {
      icon: Shield,
      headline: t('architecture.principles.secure.title', 'Privacy isn\'t a feature — it\'s architecture.'),
      subtext: t('architecture.principles.secure.description', 'Encryption, roles, audit trails.'),
    },
    {
      icon: Plug,
      headline: t('architecture.principles.open.title', 'Open by default.'),
      subtext: t('architecture.principles.open.description', 'REST + GraphQL endpoints for anything external.'),
    },
    {
      icon: Gauge,
      headline: t('architecture.principles.fast.title', 'Fast. Always.'),
      subtext: t('architecture.principles.fast.description', '99.9% uptime and sub-second load speeds.'),
    },
  ];
  
  return (
    <section className="py-section">
      <div className="container max-w-container px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className={`${h2} mb-4 text-foreground`}>
            {t('architecture.principles.title', 'Core Principles')}
          </h2>
          <p className={`${body} text-muted-foreground max-w-2xl mx-auto`}>
            {t('architecture.principles.subtitle', 'How Noddi is built to scale, secure, and perform.')}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {principles.map((principle, index) => {
            const Icon = principle.icon;
            return (
              <Card key={index} className="glass-card hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-primary/10 mb-4">
                    <Icon className="w-6 h-6 text-primary" />
                  </div>
                  <CardTitle className="text-xl">{principle.headline}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{principle.subtext}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
