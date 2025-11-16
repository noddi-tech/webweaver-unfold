import { useRef, useState, useEffect, useMemo } from 'react';
import { Calendar, Package, Users, BarChart3, Settings, ArrowRight, Pencil } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import Autoplay from 'embla-carousel-autoplay';
import { useScrollProgress } from '@/hooks/useScrollProgress';
import { useAppTranslation } from '@/hooks/useAppTranslation';
import { EditableTranslation } from '@/components/EditableTranslation';
import { EditableUniversalMedia } from '@/components/EditableUniversalMedia';
import { EditableButton } from '@/components/EditableButton';
import { EditableBackground } from '@/components/EditableBackground';
import { UnifiedStyleModal } from '@/components/UnifiedStyleModal';
import { useTypography } from '@/hooks/useTypography';
import { useEditMode } from '@/contexts/EditModeContext';
import { useColorSystem } from '@/hooks/useColorSystem';
import { useAllowedBackgrounds } from '@/hooks/useAllowedBackgrounds';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { normalizeColorToken } from '@/lib/colorUtils';

// Import all feature card images
import bookingHeroImg from '@/assets/booking-hero.png';
import dashboardPreviewImg from '@/assets/dashboard-preview.jpg';
import bookingStepTimeImg from '@/assets/booking-step-4-time.png';
import npsDashboardImg from '@/assets/nps-dashboard.png';
import whitelabelDemoImg from '@/assets/whitelabel-demo.png';

interface FeatureCard {
  number: string;
  icon: typeof Calendar;
  title: string;
  titleKey: string;
  description: string;
  descriptionKey: string;
  ctaText: string;
  ctaKey: string;
  ctaUrl?: string;
  imageUrl: string;
  imageAlt: string;
}

export function ScrollingFeatureCards() {
  const sectionRef = useRef<HTMLElement>(null);
  const { t } = useAppTranslation();
  const headingStyles = useTypography();
  const { editMode } = useEditMode();
  const { GRADIENT_COLORS, GLASS_EFFECTS } = useColorSystem();
  const { allowedBackgrounds } = useAllowedBackgrounds();
  
  // Define unique default styles for each card using CMS colors
  const defaultCardStyles = useMemo(() => [
    { 
      background: GLASS_EFFECTS[0]?.preview || 'glass-card',
      numberColor: 'primary',
      titleColor: 'foreground',
      descriptionColor: 'muted-foreground',
      ctaBgColor: 'primary',
      ctaTextColor: 'primary-foreground'
    },
    { 
      background: GRADIENT_COLORS[0]?.preview || 'bg-gradient-hero',
      numberColor: 'primary-foreground',
      titleColor: 'primary-foreground',
      descriptionColor: 'primary-foreground',
      ctaBgColor: 'primary-foreground',
      ctaTextColor: 'primary'
    },
    { 
      background: GRADIENT_COLORS[1]?.preview || 'bg-gradient-sunset',
      numberColor: 'primary-foreground',
      titleColor: 'primary-foreground',
      descriptionColor: 'primary-foreground',
      ctaBgColor: 'primary-foreground',
      ctaTextColor: 'primary'
    },
    { 
      background: GRADIENT_COLORS[3]?.preview || 'bg-gradient-ocean',
      numberColor: 'primary-foreground',
      titleColor: 'primary-foreground',
      descriptionColor: 'primary-foreground',
      ctaBgColor: 'primary-foreground',
      ctaTextColor: 'primary'
    },
    { 
      background: GRADIENT_COLORS[2]?.preview || 'bg-gradient-warmth',
      numberColor: 'primary-foreground',
      titleColor: 'primary-foreground',
      descriptionColor: 'primary-foreground',
      ctaBgColor: 'primary-foreground',
      ctaTextColor: 'primary'
    },
  ], [GRADIENT_COLORS, GLASS_EFFECTS]);

  const [imageUrls, setImageUrls] = useState<Record<number, string>>({
    0: bookingHeroImg,
    1: dashboardPreviewImg,
    2: bookingStepTimeImg,
    3: npsDashboardImg,
    4: whitelabelDemoImg,
  });
  const [mainCtaUrl, setMainCtaUrl] = useState('/functions');
  const [editingCard, setEditingCard] = useState<number | null>(null);
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);
  const [cardData, setCardData] = useState<Record<number, any>>({});
  const [carouselData, setCarouselData] = useState<Record<number, {
    display_type: 'image' | 'carousel';
    carousel_config?: {
      id: string;
      name: string;
      autoplay: boolean;
      autoplay_delay: number;
      show_navigation: boolean;
      show_dots: boolean;
      images: Array<{url: string; alt: string; title?: string}>;
    };
  }>>({});
  const [fitModes, setFitModes] = useState<Record<number, 'contain' | 'cover'>>({});
  const [aspectRatios, setAspectRatios] = useState<Record<number, string>>({});
  const [refreshKey, setRefreshKey] = useState(0);

  // Force re-render when fitModes or aspectRatios change
  useEffect(() => {
    setRefreshKey(prev => prev + 1);
  }, [fitModes, aspectRatios]);

  const loadImageSettings = async () => {
    const newImageUrls: Record<number, string> = {};
    const newCarouselData: Record<number, any> = {};
    const newFitModes: Record<number, 'contain' | 'cover'> = {};
    const newAspectRatios: Record<number, string> = {};
    
    for (let i = 0; i < 5; i++) {
      const { data } = await supabase
        .from('image_carousel_settings')
        .select('image_url, display_type, carousel_config_id, fit_mode, aspect_ratio')
        .eq('location_id', `scrolling-card-${i + 1}`)
        .maybeSingle();
      
      if (data) {
        // Store fit mode and aspect ratio
        newFitModes[i] = (data.fit_mode as 'contain' | 'cover') || 'contain';
        newAspectRatios[i] = data.aspect_ratio || 'auto';
        
        if (data.display_type === 'carousel' && data.carousel_config_id) {
          // Load carousel configuration
          const { data: carouselConfig } = await supabase
            .from('carousel_configs')
            .select('*')
            .eq('id', data.carousel_config_id)
            .single();
          
          if (carouselConfig) {
            newCarouselData[i] = {
              display_type: 'carousel',
              carousel_config: {
                id: carouselConfig.id,
                name: carouselConfig.name,
                autoplay: carouselConfig.autoplay,
                autoplay_delay: carouselConfig.autoplay_delay || 3000,
                show_navigation: carouselConfig.show_navigation,
                show_dots: carouselConfig.show_dots,
                images: Array.isArray(carouselConfig.images) 
                  ? carouselConfig.images 
                  : []
              }
            };
          }
        } else if (data.image_url) {
          // Single image
          newImageUrls[i] = data.image_url;
          newCarouselData[i] = { display_type: 'image' };
        }
      }
    }
    
    if (Object.keys(newImageUrls).length > 0) {
      setImageUrls(prev => ({ ...prev, ...newImageUrls }));
    }
    if (Object.keys(newCarouselData).length > 0) {
      setCarouselData(prev => ({ ...prev, ...newCarouselData }));
    }
    if (Object.keys(newFitModes).length > 0) {
      setFitModes(prev => ({ ...prev, ...newFitModes }));
    }
    if (Object.keys(newAspectRatios).length > 0) {
      setAspectRatios(prev => ({ ...prev, ...newAspectRatios }));
    }
  };

  const loadCardData = async (index: number) => {
    const elementPrefix = `scrolling-card-${index + 1}`;
    const defaults = defaultCardStyles[index];
    
    try {
      // Load main background
      // @ts-ignore
      const { data: bgData } = await supabase
        .from('background_styles')
        .select('background_class')
        .eq('element_id', `${elementPrefix}-background`)
        .maybeSingle();

      // Load icon card background
      // @ts-ignore
      const { data: iconCardBgData } = await supabase
        .from('background_styles')
        .select('background_class')
        .eq('element_id', `${elementPrefix}-icon-card`)
        .maybeSingle();

      // Load text elements
      // @ts-ignore
      const { data: numberData } = await supabase
        .from('text_content')
        .select('content, color_token')
        .eq('element_id', `${elementPrefix}-number`)
        .maybeSingle();

      // @ts-ignore
      const { data: titleData } = await supabase
        .from('text_content')
        .select('content, color_token')
        .eq('element_id', `${elementPrefix}-title`)
        .maybeSingle();

      // @ts-ignore
      const { data: descData } = await supabase
        .from('text_content')
        .select('content, color_token')
        .eq('element_id', `${elementPrefix}-description`)
        .maybeSingle();

      // @ts-ignore
      const { data: ctaData } = await supabase
        .from('text_content')
        .select('content, color_token')
        .eq('element_id', `${elementPrefix}-cta`)
        .maybeSingle();

      // Use per-card defaults as fallbacks for beautiful styling
      setCardData(prev => ({
        ...prev,
        [index]: {
          background: bgData?.background_class || defaults.background,
          iconCardBg: iconCardBgData?.background_class || 'bg-white/10',
          number: numberData?.content || cards[index].number,
          numberColor: numberData?.color_token || defaults.numberColor,
          title: titleData?.content || cards[index].title,
          titleColor: titleData?.color_token || defaults.titleColor,
          description: descData?.content || cards[index].description,
          descriptionColor: descData?.color_token || defaults.descriptionColor,
          ctaText: ctaData?.content || cards[index].ctaText,
          ctaBgColor: defaults.ctaBgColor,
          ctaTextColor: ctaData?.color_token || defaults.ctaTextColor,
        }
      }));
    } catch (error) {
      console.error('Error loading card data:', error);
    }
  };

  useEffect(() => {
    loadImageSettings();
    // Load data for all cards
    cards.forEach((_, index) => {
      loadCardData(index);
    });
  }, []);

  // Uniform container size for all cards
  const getContainerClasses = (aspectRatio: string = 'auto'): string => {
    // If aspect ratio is specified, use it. Otherwise fall back to fixed heights
    if (aspectRatio && aspectRatio !== 'auto') {
      return `relative w-full overflow-hidden ${aspectRatio}`;
    }
    return 'relative w-full h-[400px] lg:h-[500px] overflow-hidden';
  };

  // Inner wrapper fills the container completely
  const getInnerWrapperClasses = (fitMode: 'contain' | 'cover'): string => {
    const borderClasses = fitMode === 'cover' ? 'border border-white/10' : '';
    return `relative w-full h-full rounded-2xl overflow-hidden shadow-xl ${borderClasses} isolate flex items-center justify-center`;
  };

  const renderMedia = (index: number, card: FeatureCard) => {
    const mediaData = carouselData[index];
    const cardFitMode = fitModes[index] || 'contain';
    const cardAspectRatio = aspectRatios[index] || 'auto';
    const containerClasses = getContainerClasses(cardAspectRatio);
    const innerWrapperClasses = getInnerWrapperClasses(cardFitMode);
    const imageClasses = cardFitMode === 'contain' 
      ? 'w-full h-full object-contain block' 
      : 'w-full h-full object-cover block';
    
    // If carousel data exists and has images
    if (mediaData?.display_type === 'carousel' && mediaData.carousel_config?.images?.length > 0) {
      const config = mediaData.carousel_config;
      const plugins = config.autoplay 
        ? [Autoplay({ delay: config.autoplay_delay, stopOnInteraction: true })]
        : [];
      
      return (
        <div className={containerClasses} key={`media-${index}-${refreshKey}-${cardFitMode}-${cardAspectRatio}`}>
          <Carousel 
            key={`carousel-${index}-${refreshKey}-${cardFitMode}-${cardAspectRatio}`}
            opts={{ loop: true }}
            plugins={plugins}
            className="w-full h-full"
          >
            <CarouselContent className="h-full">
              {config.images.map((image, imgIndex) => (
                <CarouselItem key={imgIndex} className="flex items-center justify-center h-full">
                   <div className={innerWrapperClasses}>
                   <img
                     key={`carousel-img-${imgIndex}-${refreshKey}-${cardFitMode}-${cardAspectRatio}`}
                     src={image.url}
                     alt={image.alt || `Slide ${imgIndex + 1}`}
                     loading="lazy"
                     decoding="async"
                     className={imageClasses}
                     style={{
                       imageRendering: 'auto',
                       backfaceVisibility: 'hidden',
                       willChange: 'transform',
                     }}
                   />
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            
            {config.show_navigation && (
              <>
                <CarouselPrevious className="left-4 bg-white/80 hover:bg-white" />
                <CarouselNext className="right-4 bg-white/80 hover:bg-white" />
              </>
            )}
          </Carousel>
        </div>
      );
    }
    
    // Fallback to single image
    return (
      <div className={containerClasses} key={`media-${index}-${refreshKey}-${cardFitMode}-${cardAspectRatio}`}>
        <div className={innerWrapperClasses}>
            <img
              key={`single-img-${index}-${refreshKey}-${cardFitMode}-${cardAspectRatio}`}
              src={imageUrls[index] || card.imageUrl}
              alt={card.imageAlt}
              loading="lazy"
              decoding="async"
              className={imageClasses}
              style={{
                imageRendering: 'auto',
                backfaceVisibility: 'hidden',
                willChange: 'transform',
              }}
            />
        </div>
      </div>
    );
  };

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
      imageUrl: bookingHeroImg,
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
      imageUrl: dashboardPreviewImg,
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
      imageUrl: bookingStepTimeImg,
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
      imageUrl: npsDashboardImg,
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
      imageUrl: whitelabelDemoImg,
      imageAlt: 'Workshop management interface and configuration',
    },
  ];

  const { cardStates, activeCardIndex } = useScrollProgress(sectionRef, cards.length);

  return (
    <EditableBackground
      elementId="scrolling-features-section"
      defaultBackground="bg-background"
      allowedBackgrounds={allowedBackgrounds}
    >
      <section
        ref={sectionRef}
        className="relative py-24"
        style={{ minHeight: `${100 + (cards.length * 20)}vh` }}
      >
        <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-[3fr_7fr] gap-12 lg:gap-16">
            {/* Left Column - Sticky (30% width) */}
            <EditableBackground
              elementId="scrolling-features-sticky-column"
              defaultBackground="bg-transparent"
              allowedBackgrounds={allowedBackgrounds}
              className="rounded-2xl"
            >
              <div className="lg:sticky lg:top-24 lg:h-fit space-y-8 lg:pr-8 p-6">
                <div className="space-y-6">
                  <h2 className={headingStyles.h2}>
                    <EditableTranslation translationKey="scrolling_features.title">
                      Functions That Talk to Each Other
                    </EditableTranslation>
                  </h2>
                  <p className={cn(headingStyles.body, "max-w-xl text-lg opacity-80")}>
                    <EditableTranslation translationKey="scrolling_features.subtitle">
                      Every module shares the same data model. No syncing. No waiting. Just one unified system.
                    </EditableTranslation>
                  </p>
                </div>
            <EditableButton
              buttonText="See All Functions"
              buttonUrl={mainCtaUrl}
              onSave={(text, url) => {
                setMainCtaUrl(url);
              }}
            >
              <Button size="lg" className="group" asChild>
                <a href={mainCtaUrl}>
                  <EditableTranslation translationKey="scrolling_features.cta">
                    See All Functions
                  </EditableTranslation>
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </a>
              </Button>
            </EditableButton>
              </div>
            </EditableBackground>

          {/* Right Column - Scrolling Cards */}
          <div className="relative space-y-12 lg:space-y-16">
            {cards.map((card, index) => {
              const state = cardStates[index] || { opacity: 0, translateY: 20, scale: 1 };
              const Icon = card.icon;
              const isActive = index === activeCardIndex;
              
              return (
                <div
                  key={card.number}
                  className="relative"
                  style={{
                    opacity: state.opacity,
                    transform: `translateY(${state.translateY}px) scale(${state.scale})`,
                    transition: 'opacity 0.6s cubic-bezier(0.4, 0, 0.2, 1), transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
                    willChange: state.opacity > 0.2 ? 'transform, opacity' : 'auto',
                  }}
                  onMouseEnter={() => editMode && setHoveredCard(index)}
                  onMouseLeave={() => editMode && setHoveredCard(null)}
                >
                  <div className={cn(
                    "backdrop-blur-xl rounded-3xl shadow-2xl p-10 lg:p-12 relative",
                    cardData[index]?.background || 'bg-gradient-hero/90'
                  )}>
                    {/* Edit Button - Only in Edit Mode */}
                    {editMode && hoveredCard === index && (
                      <button
                        className="absolute top-4 right-4 p-3 bg-primary text-primary-foreground rounded-full shadow-xl hover:scale-110 transition-transform z-10"
                        onClick={() => setEditingCard(index)}
                      >
                        <Pencil className="w-5 h-5" />
                      </button>
                    )}
                    <div className="grid md:grid-cols-[35fr_65fr] gap-8 lg:gap-12 items-center">
                      {/* Left: Content */}
                      <div className="space-y-6">
                        <div className="flex items-center gap-3">
                          <Badge 
                            className="border px-3 py-1.5 text-sm font-medium"
                            style={{
                              backgroundColor: `hsl(var(--${normalizeColorToken(cardData[index]?.numberColor || 'primary')}) / 0.2)`,
                              borderColor: `hsl(var(--${normalizeColorToken(cardData[index]?.numberColor || 'primary')}) / 0.3)`,
                              color: `hsl(var(--${normalizeColorToken(cardData[index]?.numberColor || 'foreground')}))`
                            }}
                          >
                            <span className="font-medium">
                              {cardData[index]?.number || card.number}
                            </span>
                          </Badge>
                          <div 
                            className={cn(
                              'p-2.5 rounded-lg backdrop-blur-sm',
                              cardData[index]?.iconCardBg || 'bg-white/10'
                            )}
                          >
                            <Icon className="h-5 w-5" />
                          </div>
                        </div>
                        
                        <h3 
                          className="text-2xl lg:text-3xl font-semibold leading-tight"
                          style={{ color: `hsl(var(--${normalizeColorToken(cardData[index]?.titleColor || 'foreground')}))` }}
                        >
                          <EditableTranslation translationKey={card.titleKey}>
                            {cardData[index]?.title || card.title}
                          </EditableTranslation>
                        </h3>
                        
                        <p 
                          className="text-base leading-relaxed opacity-80"
                          style={{ color: `hsl(var(--${normalizeColorToken(cardData[index]?.descriptionColor || 'muted-foreground')}))` }}
                        >
                          <EditableTranslation translationKey={card.descriptionKey}>
                            {cardData[index]?.description || card.description}
                          </EditableTranslation>
                        </p>
                      
                        <Button 
                          variant="ghost" 
                          className="hover:bg-white/20 border border-white/20 group mt-2"
                          asChild
                        >
                          <a href={card.ctaUrl || '#'}>
                            <span
                              style={{ color: `hsl(var(--${normalizeColorToken(cardData[index]?.ctaTextColor || 'primary-foreground')}))` }}
                            >
                              <EditableTranslation translationKey={card.ctaKey}>
                                {cardData[index]?.ctaText || card.ctaText}
                              </EditableTranslation>
                            </span>
                            <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                          </a>
                        </Button>
                      </div>
                      
                      {/* Right: Image */}
                      <EditableUniversalMedia
                        locationId={`scrolling-card-${index + 1}`}
                        onSave={() => loadImageSettings()}
                        placeholder={`Click to set image/carousel for ${card.title}`}
                      >
                        {renderMedia(index, card)}
                      </EditableUniversalMedia>
                    </div>
                  </div>

                  {/* Unified Style Modal for this card */}
                  <UnifiedStyleModal
                    isOpen={editingCard === index}
                    onClose={() => setEditingCard(null)}
                    elementIdPrefix={`scrolling-card-${index + 1}`}
                    initialData={cardData[index]}
                    onSave={(data) => {
                      setCardData(prev => ({
                        ...prev,
                        [index]: data
                      }));
                      loadCardData(index);
                    }}
                  />
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
    </EditableBackground>
  );
}
