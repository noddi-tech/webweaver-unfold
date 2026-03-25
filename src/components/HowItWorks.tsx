import React, { useState, useEffect } from "react";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { useAppTranslation } from "@/hooks/useAppTranslation";
import { EditableTranslation } from "@/components/EditableTranslation";
import { EditableUniversalMedia } from "@/components/EditableUniversalMedia";
import { supabase } from "@/integrations/supabase/client";
import coreLoopIllustration from "@/assets/core-loop-illustration.png";

export default function HowItWorks() {
  const { ref, isVisible } = useScrollAnimation({ threshold: 0.2 });
  const { t } = useAppTranslation();
  const [refreshKey, setRefreshKey] = useState(0);
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

  const coreLoopSteps = [
    { number: 1, titleKey: 'core_loop.step_1.title', descKey: 'core_loop.step_1.description', defaultTitle: 'Book.', defaultDesc: 'The customer picks a time — Navio handles the rest.' },
    { number: 2, titleKey: 'core_loop.step_2.title', descKey: 'core_loop.step_2.description', defaultTitle: 'Plan.', defaultDesc: 'Routes and lanes auto-optimize in real time.' },
    { number: 3, titleKey: 'core_loop.step_3.title', descKey: 'core_loop.step_3.description', defaultTitle: 'Execute.', defaultDesc: 'Technicians get clear, connected workflows.' },
    { number: 4, titleKey: 'core_loop.step_4.title', descKey: 'core_loop.step_4.description', defaultTitle: 'Analyze.', defaultDesc: 'Data flows instantly into insights.' },
    { number: 5, titleKey: 'core_loop.step_5.title', descKey: 'core_loop.step_5.description', defaultTitle: 'Re-engage.', defaultDesc: 'Customers return before they even think to.' },
  ];

  return (
    <section ref={ref as any} className="py-12 md:py-16 lg:py-section" data-header-color="dark">
      <div className="container max-w-container px-4 sm:px-6 lg:px-8" key={refreshKey}>
        {/* Section Heading */}
        <div className="text-center mb-8 md:mb-12">
          <EditableTranslation translationKey="how_it_works.eyebrow" onSave={() => setRefreshKey(prev => prev + 1)}>
            <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              {t('how_it_works.eyebrow', 'HOW IT WORKS')}
            </span>
          </EditableTranslation>
          <EditableTranslation translationKey="how_it_works.title" onSave={() => setRefreshKey(prev => prev + 1)}>
            <h2 className="text-4xl font-bold mb-6 text-foreground mt-3">
              {t('how_it_works.title', 'How Navio Powers Your Operations')}
            </h2>
          </EditableTranslation>
          <EditableTranslation translationKey="how_it_works.subtitle" onSave={() => setRefreshKey(prev => prev + 1)}>
            <p className="text-xl text-foreground max-w-3xl mx-auto">
              {t('how_it_works.subtitle', 'From customer booking to back-office automation—all in one unified platform')}
            </p>
          </EditableTranslation>
        </div>

        {/* Core Loop Illustration */}
        <div className="flex justify-center mb-8 sm:mb-12">
          <div className="w-full max-w-6xl px-0 sm:px-4 lg:px-8">
            <EditableUniversalMedia
              locationId="functions-core-loop"
              onSave={loadMediaSettings}
              placeholder="Click to upload Core Loop illustration"
            >
              <img 
                src={imageUrl}
                alt="The Core Loop: 1. Book, 2. Plan, 3. Execute, 4. Analyze, 5. Re-engage"
                className={`w-full h-auto rounded-lg sm:rounded-xl transition-all duration-700 ${
                  isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
                }`}
              />
            </EditableUniversalMedia>
          </div>
        </div>

        {/* Mobile: Ultra-compact inline stepper */}
        <div className="flex flex-wrap items-center justify-center gap-x-1 gap-y-2 sm:hidden mb-12 px-4">
          {coreLoopSteps.map((step, index) => (
            <span key={step.number} className="flex items-center">
              <span className="text-sm font-bold text-primary">{step.number}.</span>
              <span className="text-sm font-medium text-foreground ml-1">{step.defaultTitle.replace('.', '')}</span>
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
        <div className="hidden sm:block mb-12">
          <div className="relative grid grid-cols-5 gap-6 lg:gap-8 max-w-6xl mx-auto px-4">
            {coreLoopSteps.map((step, index) => (
              <div 
                key={step.number} 
                className={`text-center relative p-4 rounded-xl transition-all duration-500 ${
                  isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
                }`}
                style={{ transitionDelay: `${index * 100}ms` }}
              >
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
                <EditableTranslation translationKey={step.titleKey} onSave={() => setRefreshKey(prev => prev + 1)}>
                  <h3 className="text-lg font-bold text-foreground mb-2">
                    {t(step.titleKey, step.defaultTitle)}
                  </h3>
                </EditableTranslation>
                <EditableTranslation translationKey={step.descKey} onSave={() => setRefreshKey(prev => prev + 1)}>
                  <p className="text-sm text-muted-foreground leading-relaxed hidden sm:block">
                    {t(step.descKey, step.defaultDesc)}
                  </p>
                </EditableTranslation>
              </div>
            ))}
          </div>
        </div>

        {/* Caption */}
        <div className="text-center">
          <div className="inline-block px-8 py-4 bg-primary/10 border-2 border-primary/20 rounded-xl">
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
        </div>
      </div>
    </section>
  );
}
