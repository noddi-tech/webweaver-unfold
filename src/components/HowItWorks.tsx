import React, { useState } from "react";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { useAppTranslation } from "@/hooks/useAppTranslation";
import { EditableTranslation } from "@/components/EditableTranslation";

export default function HowItWorks() {
  const { ref, isVisible } = useScrollAnimation({ threshold: 0.15 });
  const { t } = useAppTranslation();
  const [refreshKey, setRefreshKey] = useState(0);

  const coreLoopSteps = [
    { number: 1, titleKey: 'core_loop.step_1.title', descKey: 'core_loop.step_1.description', defaultTitle: 'Book.', defaultDesc: 'The customer picks a time — Navio handles the rest.' },
    { number: 2, titleKey: 'core_loop.step_2.title', descKey: 'core_loop.step_2.description', defaultTitle: 'Plan.', defaultDesc: 'Routes and lanes auto-optimize in real time.' },
    { number: 3, titleKey: 'core_loop.step_3.title', descKey: 'core_loop.step_3.description', defaultTitle: 'Execute.', defaultDesc: 'Technicians get clear, connected workflows.' },
    { number: 4, titleKey: 'core_loop.step_4.title', descKey: 'core_loop.step_4.description', defaultTitle: 'Analyze.', defaultDesc: 'Data flows instantly into insights.' },
    { number: 5, titleKey: 'core_loop.step_5.title', descKey: 'core_loop.step_5.description', defaultTitle: 'Re-engage.', defaultDesc: 'Customers return before they even think to.' },
  ];

  const onSave = () => setRefreshKey(prev => prev + 1);

  return (
    <section ref={ref as any} className="py-8 md:py-12 lg:py-16" data-header-color="dark">
      <div className="container max-w-container px-4 sm:px-6 lg:px-8" key={refreshKey}>
        {/* Heading */}
        <div className="text-center mb-8 md:mb-12">
          <EditableTranslation translationKey="how_it_works.eyebrow" onSave={onSave}>
            <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              {t('how_it_works.eyebrow', 'HOW IT WORKS')}
            </span>
          </EditableTranslation>
          <EditableTranslation translationKey="how_it_works.title" onSave={onSave}>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mt-3">
              {t('how_it_works.title', 'How Navio works')}
            </h2>
          </EditableTranslation>
        </div>

        {/* Desktop: Alternating vertical timeline */}
        <div className="hidden lg:block max-w-4xl mx-auto">
          <div className="relative">
            {/* Vertical center line */}
            <div className="absolute left-1/2 top-0 bottom-0 w-px bg-border -translate-x-1/2" />

            {coreLoopSteps.map((step, index) => {
              const isLeft = index % 2 === 0;
              return (
                <div
                  key={step.number}
                  className={`relative grid grid-cols-[1fr_auto_1fr] gap-x-10 items-center py-8 transition-all duration-700 ${
                    isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                  }`}
                  style={{ transitionDelay: `${index * 120}ms` }}
                >
                  {/* Left column */}
                  <div className={isLeft ? 'text-right pr-2' : ''}>
                    {isLeft && (
                      <div>
                        <EditableTranslation translationKey={step.titleKey} onSave={onSave}>
                          <h3 className="text-xl font-bold mb-1">
                            {t(step.titleKey, step.defaultTitle)}
                          </h3>
                        </EditableTranslation>
                        <EditableTranslation translationKey={step.descKey} onSave={onSave}>
                          <p className="text-sm text-muted-foreground leading-relaxed">
                            {t(step.descKey, step.defaultDesc)}
                          </p>
                        </EditableTranslation>
                      </div>
                    )}
                  </div>

                  {/* Center: number circle */}
                  <div className="relative z-10 flex items-center justify-center">
                    <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center">
                      <span className="text-lg font-bold text-secondary-foreground">
                        {String(step.number).padStart(2, '0')}
                      </span>
                    </div>
                  </div>

                  {/* Right column */}
                  <div className={!isLeft ? 'pl-2' : ''}>
                    {!isLeft && (
                      <div>
                        <EditableTranslation translationKey={step.titleKey} onSave={onSave}>
                          <h3 className="text-xl font-bold mb-1">
                            {t(step.titleKey, step.defaultTitle)}
                          </h3>
                        </EditableTranslation>
                        <EditableTranslation translationKey={step.descKey} onSave={onSave}>
                          <p className="text-sm text-muted-foreground leading-relaxed">
                            {t(step.descKey, step.defaultDesc)}
                          </p>
                        </EditableTranslation>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Mobile / Tablet: Vertical timeline on left */}
        <div className="lg:hidden max-w-lg mx-auto">
          <div className="relative pl-14">
            {/* Vertical left line */}
            <div className="absolute left-5 top-0 bottom-0 w-px bg-border" />

            {coreLoopSteps.map((step, index) => (
              <div
                key={step.number}
                className={`relative pb-8 last:pb-0 transition-all duration-700 ${
                  isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
                }`}
                style={{ transitionDelay: `${index * 100}ms` }}
              >
                {/* Number circle */}
                <div className="absolute -left-14 top-0 z-10 w-10 h-10 rounded-full bg-secondary flex items-center justify-center">
                  <span className="text-sm font-bold text-secondary-foreground">
                    {String(step.number).padStart(2, '0')}
                  </span>
                </div>

                <EditableTranslation translationKey={step.titleKey} onSave={onSave}>
                  <h3 className="text-lg font-bold mb-1">
                    {t(step.titleKey, step.defaultTitle)}
                  </h3>
                </EditableTranslation>
                <EditableTranslation translationKey={step.descKey} onSave={onSave}>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {t(step.descKey, step.defaultDesc)}
                  </p>
                </EditableTranslation>
              </div>
            ))}
          </div>
        </div>

        {/* Tagline pill */}
        <div className="text-center mt-8 md:mt-12">
          <div className="inline-block px-8 py-4 bg-primary/10 border-2 border-primary/20 rounded-xl">
            <EditableTranslation translationKey="how_it_works.caption_main" onSave={onSave}>
              <p className="text-base md:text-lg font-semibold text-foreground mb-1">
                {t('how_it_works.caption_main', "It's not automation. It's orchestration.")}
              </p>
            </EditableTranslation>
            <EditableTranslation translationKey="how_it_works.caption_sub" onSave={onSave}>
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
