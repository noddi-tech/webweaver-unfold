import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight, Eye } from "lucide-react";
import { LanguageLink } from "@/components/LanguageLink";
import { useTypography } from "@/hooks/useTypography";
import { useAppTranslation } from "@/hooks/useAppTranslation";
import { EditableTranslation } from "@/components/EditableTranslation";
import { EditableUniversalMedia } from "@/components/EditableUniversalMedia";
import { supabase } from "@/integrations/supabase/client";
import coreLoopIllustration from "@/assets/core-loop-illustration.png";

export default function FunctionsHero() {
  const { h1, h2, body } = useTypography();
  const { t } = useAppTranslation();
  const [imageUrl, setImageUrl] = useState<string>(coreLoopIllustration);

  const loadMediaSettings = async () => {
    const { data: settings } = await supabase
      .from('image_carousel_settings')
      .select('image_url')
      .eq('location_id', 'functions-core-loop')
      .maybeSingle();
    
    if (settings?.image_url) {
      setImageUrl(settings.image_url);
    }
  };

  useEffect(() => {
    loadMediaSettings();
  }, []);
  
  return (
    <section className="pt-20 sm:pt-24 lg:pt-32 pb-12 md:pb-16 lg:pb-section" data-header-color="dark">
      <div className="container max-w-container px-4 sm:px-6 lg:px-8">
        {/* Hero Text Content */}
        <div className="text-center max-w-4xl mx-auto">
          <EditableTranslation translationKey="functions_hero.h1">
            <h1 className={`${h1} mb-6 text-foreground`}>
              {t('functions_hero.h1', 'Every function. One platform.')}
            </h1>
          </EditableTranslation>
          <EditableTranslation translationKey="core_loop.subtitle">
            <p className={`${body} text-muted-foreground mb-8`}>
              {t('core_loop.subtitle', 'Every step feeds the next. No gaps. No manual handoffs.')}
            </p>
          </EditableTranslation>
        </div>

        {/* Core Loop Section */}
        <div className="mt-12 sm:mt-16 lg:mt-20">
          {/* 1. Illustration FIRST */}
          <div className="flex justify-center">
            <div className="w-full max-w-6xl px-0 sm:px-4 lg:px-8">
              <EditableUniversalMedia
                locationId="functions-core-loop"
                onSave={loadMediaSettings}
                placeholder="Click to upload Core Loop illustration"
              >
                <img 
                  src={imageUrl}
                  alt="The Core Loop: 1. Book - customer picks time, 2. Plan - routes auto-optimize, 3. Execute - technicians get workflows, 4. Analyze - data flows to insights, 5. Re-engage - customers return"
                  className="w-full h-auto rounded-lg sm:rounded-xl"
                />
              </EditableUniversalMedia>
            </div>
          </div>

          {/* Mobile: Ultra-compact inline stepper */}
          <div className="flex flex-wrap items-center justify-center gap-x-1 gap-y-2 sm:hidden mt-8 px-4">
            {[
              { number: 1, title: 'Book' },
              { number: 2, title: 'Plan' },
              { number: 3, title: 'Execute' },
              { number: 4, title: 'Analyze' },
              { number: 5, title: 'Re-engage' },
            ].map((step, index) => (
              <span key={step.number} className="flex items-center">
                <span className="text-sm font-bold text-primary">{step.number}.</span>
                <span className="text-sm font-medium text-foreground ml-1">{step.title}</span>
                {index < 4 && (
                  <span 
                    className="mx-2 w-4 h-0.5 inline-block"
                    style={{ 
                      backgroundImage: 'linear-gradient(to right, hsl(266 85% 58%), hsl(321 59% 85%), hsl(25 95% 70%))',
                      backgroundSize: '400% 100%',
                      backgroundPosition: `${(index / 3) * 100}% 0`
                    }}
                  />
                )}
              </span>
            ))}
          </div>

          {/* Desktop/Tablet: Full Core Loop Steps */}
          <div className="hidden sm:block mt-12 lg:mt-16">
            <div className="relative grid grid-cols-5 gap-6 lg:gap-8 max-w-6xl mx-auto px-4">
              {[
                { number: 1, titleKey: 'core_loop.step_1.title', descKey: 'core_loop.step_1.description', defaultTitle: 'Book.', defaultDesc: 'The customer picks a time — Navio handles the rest.' },
                { number: 2, titleKey: 'core_loop.step_2.title', descKey: 'core_loop.step_2.description', defaultTitle: 'Plan.', defaultDesc: 'Routes and lanes auto-optimize in real time.' },
                { number: 3, titleKey: 'core_loop.step_3.title', descKey: 'core_loop.step_3.description', defaultTitle: 'Execute.', defaultDesc: 'Technicians get clear, connected workflows.' },
                { number: 4, titleKey: 'core_loop.step_4.title', descKey: 'core_loop.step_4.description', defaultTitle: 'Analyze.', defaultDesc: 'Data flows instantly into insights.' },
                { number: 5, titleKey: 'core_loop.step_5.title', descKey: 'core_loop.step_5.description', defaultTitle: 'Re-engage.', defaultDesc: 'Customers return before they even think to.' },
              ].map((step, index) => (
                <div key={step.number} className="text-center relative p-4 rounded-xl">
                  {/* Connecting line to next step */}
                  {index < 4 && (
                    <div 
                      className="hidden lg:block absolute top-10 left-[calc(50%+24px)] w-[calc(100%-8px)] h-0.5 z-0"
                      style={{ 
                        backgroundImage: 'linear-gradient(to right, hsl(266 85% 58%), hsl(321 59% 85%), hsl(25 95% 70%))',
                        backgroundSize: '400% 100%',
                        backgroundPosition: `${(index / 3) * 100}% 0`
                      }}
                    />
                  )}
                  <div className="mx-auto mb-3 w-12 h-12 rounded-full bg-background flex items-center justify-center relative z-10">
                    <div className="absolute inset-0 rounded-full bg-primary/10" />
                    <span className="text-lg font-bold text-primary relative">{step.number}</span>
                  </div>
                  <EditableTranslation translationKey={step.titleKey}>
                    <h3 className="text-lg font-bold text-foreground mb-2">
                      {t(step.titleKey, step.defaultTitle)}
                    </h3>
                  </EditableTranslation>
                  <EditableTranslation translationKey={step.descKey}>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {t(step.descKey, step.defaultDesc)}
                    </p>
                  </EditableTranslation>
                </div>
              ))}
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mt-8">
            <Button size="lg" className="text-lg px-8 py-6 group" asChild>
              <LanguageLink to="/contact">
                <EditableTranslation translationKey="functions_hero.button_primary">
                  <span>{t('functions_hero.button_primary', 'Book a demo')}</span>
                </EditableTranslation>
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </LanguageLink>
            </Button>
            <Button size="lg" variant="outline" className="text-lg px-8 py-6" asChild>
              <LanguageLink to="/architecture">
                <Eye className="w-5 h-5 mr-2" />
                <EditableTranslation translationKey="functions_hero.button_secondary">
                  <span>{t('functions_hero.button_secondary', 'See how the system thinks')}</span>
                </EditableTranslation>
              </LanguageLink>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
