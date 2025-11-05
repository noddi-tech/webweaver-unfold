import { useRef } from 'react';
import { Calendar, Package, Users, BarChart3, Settings, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useScrollProgress } from '@/hooks/useScrollProgress';
import { useAppTranslation } from '@/hooks/useAppTranslation';
import { EditableTranslation } from '@/components/EditableTranslation';
import { useTypography } from '@/hooks/useTypography';
import { cn } from '@/lib/utils';

interface FeatureCard {
  number: string;
  icon: typeof Calendar;
  title: string;
  titleKey: string;
  description: string;
  descriptionKey: string;
  ctaText: string;
  ctaKey: string;
  imageUrl: string;
  imageAlt: string;
}

export function ScrollingFeatureCards() {
  const sectionRef = useRef<HTMLElement>(null);
  const { t } = useAppTranslation();
  const headingStyles = useTypography();

  const cards: FeatureCard[] = [
    {
      number: '01',
      icon: Calendar,
      title: 'Booking Flow',
      titleKey: 'function_cards.function_1.title',
      description: 'One minute from address to confirmed slot. Intelligent scheduling that respects workshop capacity and technician availability.',
      descriptionKey: 'function_cards.function_1.headline',
      ctaText: 'Learn More',
      ctaKey: 'function_cards.function_1.cta',
      imageUrl: '/src/assets/booking-hero.png',
      imageAlt: 'Booking flow interface showing step-by-step customer journey',
    },
    {
      number: '02',
      icon: Package,
      title: 'Tire Sales & Inventory',
      titleKey: 'function_cards.function_2.title',
      description: 'Real-time inventory synchronization across all locations. Automatic supplier integration for seamless ordering.',
      descriptionKey: 'function_cards.function_2.headline',
      ctaText: 'Explore Features',
      ctaKey: 'function_cards.function_2.cta',
      imageUrl: '/src/assets/dashboard-preview.jpg',
      imageAlt: 'Inventory dashboard with real-time stock levels',
    },
    {
      number: '03',
      icon: Users,
      title: 'Customer Communication',
      titleKey: 'function_cards.function_3.title',
      description: 'Automated SMS and email notifications. Keep customers informed at every step of the service journey.',
      descriptionKey: 'function_cards.function_3.headline',
      ctaText: 'See How',
      ctaKey: 'function_cards.function_3.cta',
      imageUrl: '/src/assets/booking-step-4-time.png',
      imageAlt: 'Customer communication flow and notifications',
    },
    {
      number: '04',
      icon: BarChart3,
      title: 'Analytics & Reporting',
      titleKey: 'function_cards.function_4.title',
      description: 'Deep insights into workshop performance, booking patterns, and revenue optimization opportunities.',
      descriptionKey: 'function_cards.function_4.headline',
      ctaText: 'View Analytics',
      ctaKey: 'function_cards.function_4.cta',
      imageUrl: '/src/assets/nps-dashboard.png',
      imageAlt: 'Analytics dashboard showing key performance metrics',
    },
    {
      number: '05',
      icon: Settings,
      title: 'Workshop Management',
      titleKey: 'function_cards.function_5.title',
      description: 'Complete control over services, pricing, and capacity. Flexible configuration for any workshop size.',
      descriptionKey: 'function_cards.function_5.headline',
      ctaText: 'Discover More',
      ctaKey: 'function_cards.function_5.cta',
      imageUrl: '/src/assets/whitelabel-demo.png',
      imageAlt: 'Workshop management interface and configuration',
    },
  ];

  const { cardStates, activeCardIndex } = useScrollProgress(sectionRef, cards.length);

  return (
    <section
      ref={sectionRef}
      className="relative py-24 bg-background"
      style={{ minHeight: `${100 + (cards.length * 40)}vh` }}
    >
      <div className="container-responsive">
        <div className="grid lg:grid-cols-2 gap-16 lg:gap-24">
          {/* Left Column - Sticky */}
          <div className="lg:sticky lg:top-24 lg:h-fit space-y-8">
            <div className="space-y-6">
              <h2 className={cn(headingStyles.h2, "text-foreground")}>
                <EditableTranslation translationKey="scrolling_features.title">
                  Functions That Talk to Each Other
                </EditableTranslation>
              </h2>
              <p className={cn(headingStyles.body, "text-muted-foreground max-w-xl text-lg")}>
                <EditableTranslation translationKey="scrolling_features.subtitle">
                  Every module shares the same data model. No syncing. No waiting. Just one unified system.
                </EditableTranslation>
              </p>
            </div>
            <Button size="lg" className="group">
              <EditableTranslation translationKey="scrolling_features.cta">
                See All Functions
              </EditableTranslation>
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Button>
          </div>

          {/* Right Column - Scrolling Cards */}
          <div className="relative space-y-16 lg:space-y-24">
            {cards.map((card, index) => {
              const state = cardStates[index] || { opacity: 0, translateY: 20 };
              const Icon = card.icon;
              const isActive = index === activeCardIndex;
              
              return (
                <div
                  key={card.number}
                  className="relative"
                  style={{
                    opacity: state.opacity,
                    transform: `translateY(${state.translateY}px)`,
                    transition: 'opacity 0.6s cubic-bezier(0.4, 0, 0.2, 1), transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
                    willChange: state.opacity > 0.3 ? 'transform, opacity' : 'auto',
                  }}
                >
                  <div className="bg-gradient-hero/90 backdrop-blur-xl border border-white/10 rounded-3xl p-8 lg:p-10 shadow-2xl">
                    <div className="grid md:grid-cols-2 gap-8 items-center">
                      {/* Left: Content */}
                      <div className="space-y-6">
                        <div className="flex items-center gap-3">
                          <Badge 
                            className="bg-purple-500/20 text-purple-200 border border-purple-400/30 px-3 py-1.5 text-sm font-medium hover:bg-purple-500/30"
                          >
                            {card.number}
                          </Badge>
                          <div className="p-2.5 rounded-lg bg-white/10 backdrop-blur-sm">
                            <Icon className="h-5 w-5 text-white" />
                          </div>
                        </div>
                        
                        <h3 className="text-2xl lg:text-3xl font-semibold text-white leading-tight">
                          <EditableTranslation translationKey={card.titleKey}>
                            {card.title}
                          </EditableTranslation>
                        </h3>
                        
                        <p className="text-white/80 text-base leading-relaxed">
                          <EditableTranslation translationKey={card.descriptionKey}>
                            {card.description}
                          </EditableTranslation>
                        </p>
                        
                        <Button 
                          variant="ghost" 
                          className="text-white hover:bg-white/20 border border-white/20 group mt-2"
                        >
                          <EditableTranslation translationKey={card.ctaKey}>
                            {card.ctaText}
                          </EditableTranslation>
                          <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                        </Button>
                      </div>
                      
                      {/* Right: Image */}
                      <div className="relative aspect-video rounded-2xl overflow-hidden shadow-xl border border-white/10">
                        <img 
                          src={card.imageUrl}
                          alt={card.imageAlt}
                          loading="lazy"
                          decoding="async"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </div>
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
