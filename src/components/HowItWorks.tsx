import React, { useState } from "react";
import { Calendar, Zap, Smartphone, RefreshCw, ArrowRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { useAppTranslation } from "@/hooks/useAppTranslation";
import { EditableTranslation } from "@/components/EditableTranslation";
import { LockedText } from "@/components/LockedText";
import { EditableBackground } from "@/components/EditableBackground";
import { EditableIcon } from "@/components/EditableIcon";
import { useAllowedBackgrounds } from "@/hooks/useAllowedBackgrounds";

export default function HowItWorks() {
  const { ref, isVisible } = useScrollAnimation({ threshold: 0.2 });
  const { t } = useAppTranslation();
  const [refreshKey, setRefreshKey] = useState(0);
  const { allowedBackgrounds } = useAllowedBackgrounds();

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
      title: t('how_it_works.step_3.title', 'Technicians execute with Navio Worker app'),
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
    <section ref={ref as any} className="py-12 md:py-16 lg:py-section">
      <div className="container max-w-container px-4 sm:px-6 lg:px-8" key={refreshKey}>
        <div className="text-center mb-16">
          <EditableTranslation translationKey="how_it_works.title" onSave={() => setRefreshKey(prev => prev + 1)}>
            <h2 className="text-4xl font-bold mb-6 text-foreground">
              {t('how_it_works.title', 'How Navio Powers Your Operations')}
            </h2>
          </EditableTranslation>
          <EditableTranslation translationKey="how_it_works.subtitle" onSave={() => setRefreshKey(prev => prev + 1)}>
            <p className="text-xl text-foreground max-w-3xl mx-auto">
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
                  <EditableBackground
                    elementId={`how-it-works-step-${index}`}
                    defaultBackground="bg-card"
                    allowedBackgrounds={allowedBackgrounds}
                  >
                    <Card className="hover-scale h-full">
                      <CardContent className="p-6 h-full flex flex-col overflow-visible">
                        <EditableIcon
                          elementId={`how-it-works-icon-${index}`}
                          icon={Icon}
                          defaultBackground="bg-gradient-primary"
                          className="mb-8"
                        />
                        <EditableTranslation 
                          translationKey={`how_it_works.step_${index + 1}.label`} 
                          onSave={() => setRefreshKey(prev => prev + 1)}
                        >
                          <div className="text-sm font-bold text-primary mb-2">
                            {t(`how_it_works.step_${index + 1}.label`, `Step ${index + 1}`)}
                          </div>
                        </EditableTranslation>
                        <EditableTranslation translationKey={`how_it_works.step_${index + 1}.title`} onSave={() => setRefreshKey(prev => prev + 1)}>
                          <h3 className="text-lg font-semibold mb-2">{step.title}</h3>
                        </EditableTranslation>
                        <EditableTranslation translationKey={`how_it_works.step_${index + 1}.description`} onSave={() => setRefreshKey(prev => prev + 1)}>
                          <p className="text-sm mb-2 flex-grow">{step.description}</p>
                        </EditableTranslation>
                        <EditableTranslation translationKey={`how_it_works.step_${index + 1}.details`} onSave={() => setRefreshKey(prev => prev + 1)}>
                          <p className="text-xs">{step.details}</p>
                        </EditableTranslation>
                      </CardContent>
                    </Card>
                  </EditableBackground>
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
                <EditableBackground
                  elementId={`how-it-works-step-${index}`}
                  defaultBackground="bg-card"
                  allowedBackgrounds={allowedBackgrounds}
                >
                  <Card className="hover-scale h-full">
                    <CardContent className="p-6 h-full flex flex-col overflow-visible">
                      <div className="flex items-start gap-4">
                        <EditableIcon
                          elementId={`how-it-works-icon-${index}`}
                          icon={Icon}
                          defaultBackground="bg-gradient-primary"
                          className="flex-shrink-0"
                        />
                        <div className="flex-1">
                          <EditableTranslation 
                            translationKey={`how_it_works.step_${index + 1}.label`} 
                            onSave={() => setRefreshKey(prev => prev + 1)}
                          >
                            <div className="text-sm font-bold text-primary mb-2">
                              {t(`how_it_works.step_${index + 1}.label`, `Step ${index + 1}`)}
                            </div>
                          </EditableTranslation>
                          <EditableTranslation translationKey={`how_it_works.step_${index + 1}.title`} onSave={() => setRefreshKey(prev => prev + 1)}>
                            <h3 className="text-lg font-semibold mb-2">{step.title}</h3>
                          </EditableTranslation>
                        <EditableTranslation translationKey={`how_it_works.step_${index + 1}.description`} onSave={() => setRefreshKey(prev => prev + 1)}>
                          <p className="text-sm mb-2 flex-grow">{step.description}</p>
                        </EditableTranslation>
                          <EditableTranslation translationKey={`how_it_works.step_${index + 1}.details`} onSave={() => setRefreshKey(prev => prev + 1)}>
                            <p className="text-xs">{step.details}</p>
                          </EditableTranslation>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </EditableBackground>
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
          <EditableBackground
            elementId="how-it-works-caption"
            defaultBackground="bg-primary/10"
            allowedBackgrounds={allowedBackgrounds}
          >
            <div className="inline-block px-8 py-4 border-2 border-primary/20 rounded-xl">
              <EditableTranslation translationKey="how_it_works.caption_main" onSave={() => setRefreshKey(prev => prev + 1)}>
                <p className="text-base md:text-lg font-semibold text-foreground mb-1">
                  {t('how_it_works.caption_main', "It's not automation. It's orchestration.")}
                </p>
              </EditableTranslation>
              <EditableTranslation translationKey="how_it_works.caption_sub" onSave={() => setRefreshKey(prev => prev + 1)}>
                <p className="text-sm text-foreground font-medium">
                  {t('how_it_works.caption_sub', 'One platform. Every function. Zero friction.')}
                </p>
              </EditableTranslation>
            </div>
          </EditableBackground>
        </div>
      </div>
    </section>
  );
}
