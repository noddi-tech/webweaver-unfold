import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Database, Zap, Cloud, Shield, Plug, Gauge } from "lucide-react";
import { useTypography } from "@/hooks/useTypography";
import { useAppTranslation } from "@/hooks/useAppTranslation";
import { EditableTranslation } from "@/components/EditableTranslation";
import { EditableBackground } from "@/components/EditableBackground";

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
          <EditableTranslation translationKey="architecture.principles.title">
            <h2 className={`${h2} mb-4 text-foreground`}>
              {t('architecture.principles.title', 'Core Principles')}
            </h2>
          </EditableTranslation>
          <EditableTranslation translationKey="architecture.principles.subtitle">
            <p className={`${body} text-muted-foreground max-w-2xl mx-auto`}>
              {t('architecture.principles.subtitle', 'How Noddi is built to scale, secure, and perform.')}
            </p>
          </EditableTranslation>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {principles.map((principle, index) => {
            const Icon = principle.icon;
            return (
              <EditableBackground
                key={index}
                elementId={`architecture-principle-${index}`}
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
                <Card className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-primary/10 mb-4">
                      <Icon className="w-6 h-6 text-primary" />
                    </div>
                    <EditableTranslation translationKey={`architecture.principles.${['unified', 'reactive', 'scalable', 'secure', 'open', 'fast'][index]}.title`}>
                      <CardTitle className="text-xl">{principle.headline}</CardTitle>
                    </EditableTranslation>
                  </CardHeader>
                  <CardContent>
                    <EditableTranslation translationKey={`architecture.principles.${['unified', 'reactive', 'scalable', 'secure', 'open', 'fast'][index]}.description`}>
                      <p className="text-muted-foreground">{principle.subtext}</p>
                    </EditableTranslation>
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
