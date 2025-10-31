import { MapPin, Palette, DollarSign, Rocket, CheckCircle2, Zap } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAppTranslation } from "@/hooks/useAppTranslation";
import { EditableTranslation } from "@/components/EditableTranslation";

export default function RapidOnboarding() {
  const { t } = useAppTranslation();

  const onboardingSteps = [
    {
      icon: MapPin,
      title: t('rapid_onboarding.step_1.title', 'Draw service area'),
      description: t('rapid_onboarding.step_1.description', 'Define your geographic coverage on the map')
    },
    {
      icon: Palette,
      title: t('rapid_onboarding.step_2.title', 'Configure brand/logo'),
      description: t('rapid_onboarding.step_2.description', 'Upload your branding assets and customize the look')
    },
    {
      icon: DollarSign,
      title: t('rapid_onboarding.step_3.title', 'Upload price list'),
      description: t('rapid_onboarding.step_3.description', 'Import your service pricing and packages')
    },
    {
      icon: Rocket,
      title: t('rapid_onboarding.step_4.title', 'Launch'),
      description: t('rapid_onboarding.step_4.description', 'Enable automatic SEO and go live')
    }
  ];

  const benefits = [
    t('rapid_onboarding.benefit_1', 'Expansion to new services/regions is plug-and-play'),
    t('rapid_onboarding.benefit_2', 'Backend and frontend unified for rapid scaling'),
    t('rapid_onboarding.benefit_3', 'No integration complexity or API dependencies'),
    t('rapid_onboarding.benefit_4', 'Single configuration process for all services')
  ];
  return (
    <section className="py-section">
      <div className="container max-w-container px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <EditableTranslation translationKey="rapid_onboarding.title">
              <h2 className="text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                {t('rapid_onboarding.title', 'Launch in Less Than 1 Day')}
              </h2>
            </EditableTranslation>
            <Badge variant="default" className="text-lg px-4 py-2 bg-gradient-primary shadow-lg animate-pulse">
              <Zap className="w-4 h-4 mr-1" />
              <EditableTranslation translationKey="rapid_onboarding.badge">
                <span>{t('rapid_onboarding.badge', '< 24h')}</span>
              </EditableTranslation>
            </Badge>
          </div>
          <EditableTranslation translationKey="rapid_onboarding.subtitle">
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              {t('rapid_onboarding.subtitle', 'Onboard new partners in any geography with plug-and-play simplicity')}
            </p>
          </EditableTranslation>
        </div>

        {/* Onboarding Timeline */}
        <div className="mb-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {onboardingSteps.map((step, index) => {
              const Icon = step.icon;
              return (
                <Card key={index} className="relative hover-scale">
                  <CardContent className="p-6 text-center">
                    <div className="absolute -top-3 -left-3 w-8 h-8 rounded-full bg-gradient-primary flex items-center justify-center shadow-lg">
                      <span className="text-sm font-bold text-primary-foreground">{index + 1}</span>
                    </div>
                    <div className="w-16 h-16 mx-auto rounded-xl bg-gradient-primary flex items-center justify-center mb-4 shadow-lg">
                      <Icon className="w-8 h-8 text-primary-foreground" />
                    </div>
                    <EditableTranslation translationKey={`rapid_onboarding.step_${index + 1}.title`}>
                      <h3 className="text-lg font-semibold mb-2 text-foreground">{step.title}</h3>
                    </EditableTranslation>
                    <EditableTranslation translationKey={`rapid_onboarding.step_${index + 1}.description`}>
                      <p className="text-sm text-muted-foreground">{step.description}</p>
                    </EditableTranslation>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Benefits List */}
        <div className="max-w-3xl mx-auto">
          <EditableTranslation translationKey="rapid_onboarding.benefits.title">
            <h3 className="text-2xl font-bold text-center mb-6 text-foreground">{t('rapid_onboarding.benefits.title', 'Key Benefits')}</h3>
          </EditableTranslation>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {benefits.map((benefit, index) => (
              <div key={index} className="flex items-start gap-3 p-4 rounded-lg bg-muted/50 border border-border hover-scale">
                <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                <EditableTranslation translationKey={`rapid_onboarding.benefit_${index + 1}`}>
                  <p className="text-sm text-foreground">{benefit}</p>
                </EditableTranslation>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-12">
          <div className="inline-block px-6 py-3 bg-primary/10 border border-primary/20 rounded-lg">
            <EditableTranslation translationKey="rapid_onboarding.bottom_cta">
              <p className="text-base font-medium text-primary">
                {t('rapid_onboarding.bottom_cta', 'Scale globally without technical barriers — Noddi handles the complexity')}
              </p>
            </EditableTranslation>
          </div>
        </div>
      </div>
    </section>
  );
}
