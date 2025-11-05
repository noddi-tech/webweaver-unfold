import { useRef } from 'react';
import { Calendar, Package, Bell, Map, Workflow, PieChart, Building2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useScrollProgress } from '@/hooks/useScrollProgress';
import { useAppTranslation } from '@/hooks/useAppTranslation';
import { EditableTranslation } from '@/components/EditableTranslation';
import { useTypography } from '@/hooks/useTypography';

interface FeatureCard {
  number: string;
  icon: typeof Calendar;
  title: string;
  titleKey: string;
  description: string;
  descriptionKey: string;
  ctaText: string;
  ctaKey: string;
}

export function ScrollingFeatureCards() {
  const sectionRef = useRef<HTMLElement>(null);
  const { t } = useAppTranslation();
  const { h2, h3, body } = useTypography();

  const cards: FeatureCard[] = [
    {
      number: '01',
      icon: Calendar,
      title: t('function_cards.function_1.title', 'Booking Flow'),
      titleKey: 'function_cards.function_1.title',
      description: t('function_cards.function_1.headline', 'One minute from address to confirmed slot. No fluff — just speed and clarity.'),
      descriptionKey: 'function_cards.function_1.headline',
      ctaText: t('function_cards.function_1.cta', 'Learn More'),
      ctaKey: 'function_cards.function_1.cta',
    },
    {
      number: '02',
      icon: Package,
      title: t('function_cards.function_2.title', 'Tire Sales & Inventory'),
      titleKey: 'function_cards.function_2.title',
      description: t('function_cards.function_2.headline', 'Knows your stock, margin, and timing — and sells accordingly.'),
      descriptionKey: 'function_cards.function_2.headline',
      ctaText: t('function_cards.function_2.cta', 'Learn More'),
      ctaKey: 'function_cards.function_2.cta',
    },
    {
      number: '03',
      icon: Bell,
      title: t('function_cards.function_3.title', 'Auto Recall Engine'),
      titleKey: 'function_cards.function_3.title',
      description: t('function_cards.function_3.headline', 'Reminds like a human, responds like software. 77.9% acceptance rate.'),
      descriptionKey: 'function_cards.function_3.headline',
      ctaText: t('function_cards.function_3.cta', 'Learn More'),
      ctaKey: 'function_cards.function_3.cta',
    },
    {
      number: '04',
      icon: Map,
      title: t('function_cards.function_4.title', 'Capacity & Route Optimization'),
      titleKey: 'function_cards.function_4.title',
      description: t('function_cards.function_4.headline', 'AI plans daily schedules based on location, staff, and load.'),
      descriptionKey: 'function_cards.function_4.headline',
      ctaText: t('function_cards.function_4.cta', 'Learn More'),
      ctaKey: 'function_cards.function_4.cta',
    },
    {
      number: '05',
      icon: Workflow,
      title: t('function_cards.function_5.title', 'Workflow Automation'),
      titleKey: 'function_cards.function_5.title',
      description: t('function_cards.function_5.headline', 'Rules you set once, results you see always. No sync meetings required.'),
      descriptionKey: 'function_cards.function_5.headline',
      ctaText: t('function_cards.function_5.cta', 'Learn More'),
      ctaKey: 'function_cards.function_5.cta',
    },
  ];

  const { cardStates } = useScrollProgress(sectionRef, cards.length);

  return (
    <section ref={sectionRef} className="relative min-h-[300vh] py-section">
      <div className="container max-w-container px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-[40%_60%] gap-8 lg:gap-16">
          {/* Sticky Left Column */}
          <div className="lg:sticky lg:top-32 lg:h-fit">
            <EditableTranslation translationKey="function_cards.scroll_title">
              <h2 className={`${h2} mb-6 text-foreground`}>
                {t('function_cards.scroll_title', 'Functions That Talk to Each Other')}
              </h2>
            </EditableTranslation>
            <EditableTranslation translationKey="function_cards.scroll_subtitle">
              <p className={`${body} text-muted-foreground mb-8 max-w-xl`}>
                {t('function_cards.scroll_subtitle', 'Every module shares the same data model. No syncing. No waiting.')}
              </p>
            </EditableTranslation>
            <Button size="lg" className="hidden lg:inline-flex">
              {t('function_cards.scroll_cta', 'See All Functions')}
            </Button>
          </div>

          {/* Scrolling Cards Column */}
          <div className="relative space-y-6">
            {cards.map((card, index) => {
              const Icon = card.icon;
              const state = cardStates[index] || { opacity: 0, translateY: 20 };

              return (
                <div
                  key={index}
                  className="transition-all duration-500 ease-out"
                  style={{
                    opacity: state.opacity,
                    transform: `translateY(${state.translateY}px)`,
                    willChange: 'transform, opacity',
                  }}
                >
                  <div className="bg-gradient-hero backdrop-blur-md border border-border/50 rounded-2xl p-8 shadow-lg">
                    {/* Badge */}
                    <Badge 
                      variant="secondary" 
                      className="mb-6 bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20"
                    >
                      {card.number}
                    </Badge>

                    {/* Content */}
                    <div className="mb-6">
                      <div className="flex items-start gap-4 mb-4">
                        <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-white/10 backdrop-blur-sm">
                          <Icon className="w-6 h-6 text-white" />
                        </div>
                        <div className="flex-1">
                          <EditableTranslation translationKey={card.titleKey}>
                            <h3 className={`${h3} text-white mb-2`}>
                              {card.title}
                            </h3>
                          </EditableTranslation>
                        </div>
                      </div>
                      <EditableTranslation translationKey={card.descriptionKey}>
                        <p className="text-white/80 leading-relaxed">
                          {card.description}
                        </p>
                      </EditableTranslation>
                    </div>

                    {/* CTA Button */}
                    <EditableTranslation translationKey={card.ctaKey}>
                      <Button 
                        variant="secondary" 
                        className="bg-white/10 text-white border-white/20 hover:bg-white/20"
                      >
                        {card.ctaText}
                      </Button>
                    </EditableTranslation>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
