import React from "react";
import { Calendar, Zap, Smartphone, RefreshCw, ArrowRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { useAppTranslation } from "@/hooks/useAppTranslation";
import { EditableTranslation } from "@/components/EditableTranslation";
import { LockedText } from "@/components/LockedText";

export default function HowItWorks() {
  const { ref, isVisible } = useScrollAnimation({ threshold: 0.2 });
  const { t } = useAppTranslation();

  const steps = [
    {
      icon: Calendar,
      title: t('how_it_works.step_1.title', 'Customer books service'),
      description: t('how_it_works.step_1.description', 'Online booking or in-garage entry'),
      details: t('how_it_works.step_1.details', 'Mobile + desktop support with one-minute funnel')
    },
    {
      icon: Zap,
      title: t('how_it_works.step_2.title', 'Platform auto-plans routes & capacity'),
      description: t('how_it_works.step_2.description', 'Proprietary optimization algorithms'),
      details: t('how_it_works.step_2.details', 'Real-time resource allocation and workforce dispatch')
    },
    {
      icon: Smartphone,
      title: t('how_it_works.step_3.title', 'Technicians execute with Noddi Worker app'),
      description: t('how_it_works.step_3.description', 'Native app for mobile + garage workflows'),
      details: t('how_it_works.step_3.details', 'Standardized inspection capture and tire sales')
    },
    {
      icon: RefreshCw,
      title: t('how_it_works.step_4.title', 'System captures data → triggers actions'),
      description: t('how_it_works.step_4.description', 'Auto-recall campaigns, tire sales, inventory updates'),
      details: t('how_it_works.step_4.details', 'No manual follow-up needed—fully automated')
    }
  ];

  return (
    <section ref={ref as any} className="py-section">
      <div className="container max-w-container px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <EditableTranslation translationKey="how_it_works.title">
            <h2 className="text-4xl font-bold mb-6 text-foreground">
              {t('how_it_works.title', 'How Noddi Powers Your Operations')}
            </h2>
          </EditableTranslation>
          <EditableTranslation translationKey="how_it_works.subtitle">
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              {t('how_it_works.subtitle', 'From customer booking to back-office automation—all in one unified platform')}
            </p>
          </EditableTranslation>
        </div>

        {/* Desktop: Horizontal Flow */}
        <div className="hidden lg:grid lg:grid-cols-[1fr_auto_1fr_auto_1fr_auto_1fr] gap-4 mb-12 items-stretch">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <React.Fragment key={index}>
                <div 
                  className={`h-full transition-all duration-500 ${
                    isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
                  }`}
                  style={{ transitionDelay: `${index * 100}ms` }}
                >
                <Card className="hover-scale h-full">
                  <CardContent className="p-6 h-full flex flex-col">
                    <div className="w-14 h-14 rounded-xl bg-gradient-primary flex items-center justify-center mb-4 shadow-lg">
                      <Icon className="w-7 h-7 text-primary-foreground" />
                    </div>
                    <LockedText reason="Step number - Update in code">
                      <div className="text-sm font-bold text-primary mb-2">{t('how_it_works.step_label', 'Step {index}').replace('{index}', String(index + 1))}</div>
                    </LockedText>
                    <EditableTranslation translationKey={`how_it_works.step_${index + 1}.title`}>
                      <h3 className="text-lg font-semibold mb-2 text-foreground">{step.title}</h3>
                    </EditableTranslation>
                    <EditableTranslation translationKey={`how_it_works.step_${index + 1}.description`}>
                      <p className="text-sm text-muted-foreground mb-2">{step.description}</p>
                    </EditableTranslation>
                    <EditableTranslation translationKey={`how_it_works.step_${index + 1}.details`}>
                      <p className="text-xs text-muted-foreground">{step.details}</p>
                    </EditableTranslation>
                  </CardContent>
                </Card>
                </div>
                {index < steps.length - 1 && (
                  <div className="flex items-center justify-center">
                    <ArrowRight className="w-6 h-6 text-primary" />
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </div>

        {/* Mobile: Vertical Flow */}
        <div className="lg:hidden space-y-6 mb-12">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <div 
                key={index} 
                className={`relative transition-all duration-500 ${
                  isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
                }`}
                style={{ transitionDelay: `${index * 100}ms` }}
              >
                <Card className="hover-scale h-full">
                  <CardContent className="p-6 h-full flex flex-col">
                    <div className="flex items-start gap-4">
                      <div className="w-14 h-14 rounded-xl bg-gradient-primary flex items-center justify-center flex-shrink-0 shadow-lg">
                        <Icon className="w-7 h-7 text-primary-foreground" />
                      </div>
                      <div className="flex-1">
                        <LockedText reason="Step number - Update in code">
                          <div className="text-sm font-bold text-primary mb-2">{t('how_it_works.step_label', 'Step {index}').replace('{index}', String(index + 1))}</div>
                        </LockedText>
                        <EditableTranslation translationKey={`how_it_works.step_${index + 1}.title`}>
                          <h3 className="text-lg font-semibold mb-2 text-foreground">{step.title}</h3>
                        </EditableTranslation>
                        <EditableTranslation translationKey={`how_it_works.step_${index + 1}.description`}>
                          <p className="text-sm text-muted-foreground mb-2">{step.description}</p>
                        </EditableTranslation>
                        <EditableTranslation translationKey={`how_it_works.step_${index + 1}.details`}>
                          <p className="text-xs text-muted-foreground">{step.details}</p>
                        </EditableTranslation>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                {index < steps.length - 1 && (
                  <div className="flex justify-center py-2">
                    <div className="w-0.5 h-8 bg-gradient-primary" />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Caption */}
        <div className="text-center">
          <div className="inline-block px-8 py-4 bg-primary/10 border-2 border-primary/20 rounded-xl">
            <EditableTranslation translationKey="how_it_works.caption_main">
              <p className="text-base md:text-lg font-semibold text-foreground mb-1">
                {t('how_it_works.caption_main', "It's not automation. It's orchestration.")}
              </p>
            </EditableTranslation>
            <EditableTranslation translationKey="how_it_works.caption_sub">
              <p className="text-sm text-muted-foreground font-medium">
                {t('how_it_works.caption_sub', 'One platform. Every function. Zero friction.')}
              </p>
            </EditableTranslation>
          </div>
        </div>
      </div>
    </section>
  );
}
