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
import { getOptimizedImageUrl, generateSrcSet } from '@/utils/imageTransform';

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
  const [fitModes, setFitModes] = useState<Record<number, 'contain' | 'cover'>>({});
  const [aspectRatios, setAspectRatios] = useState<Record<number, string>>({});
  const [objectPositions, setObjectPositions] = useState<Record<number, 'top' | 'center' | 'bottom'>>({});
  const [cardHeights, setCardHeights] = useState<Record<number, string>>({});
  const [cardWidths, setCardWidths] = useState<Record<number, string>>({});
  const [cardBorderRadii, setCardBorderRadii] = useState<Record<number, string>>({});
  const [cardGap, setCardGap] = useState<string>('gap-8');
  const [refreshKey, setRefreshKey] = useState(0);
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

  // Force re-render when fitModes, aspectRatios, cardHeights, cardWidths, cardBorderRadii, or cardGap change
  useEffect(() => {
    setRefreshKey(prev => prev + 1);
  }, [fitModes, aspectRatios, cardHeights, cardWidths, cardBorderRadii, cardGap]);

  const loadImageSettings = async () => {
    const newImageUrls: Record<number, string> = {};
    const newCarouselData: Record<number, any> = {};
    const newFitModes: Record<number, 'contain' | 'cover'> = {};
    const newAspectRatios: Record<number, string> = {};
    const newObjectPositions: Record<number, 'top' | 'center' | 'bottom'> = {};
    const newCardHeights: Record<number, string> = {};
    const newCardWidths: Record<number, string> = {};
    const newCardBorderRadii: Record<number, string> = {};
    let newCardGap = 'gap-8';
    
    for (let i = 0; i < 5; i++) {
      const { data } = await supabase
        .from('image_carousel_settings')
        .select('image_url, display_type, carousel_config_id, fit_mode, aspect_ratio, object_position, card_height, card_width, card_border_radius, card_gap')
        .eq('location_id', `scrolling-card-${i + 1}`)
        .maybeSingle();
      
      if (data) {
        // Store fit mode, aspect ratio, object position and card layout
        newFitModes[i] = (data.fit_mode as 'contain' | 'cover') || 'contain';
        newAspectRatios[i] = data.aspect_ratio || 'auto';
        newObjectPositions[i] = (data.object_position as 'top' | 'center' | 'bottom') || 'center';
        newCardHeights[i] = data.card_height || 'h-[500px]';
        newCardWidths[i] = data.card_width || 'w-full';
        newCardBorderRadii[i] = data.card_border_radius || 'rounded-2xl';
        
        // Gap is global (use first card's gap)
        if (i === 0 && data.card_gap) {
          newCardGap = data.card_gap;
        }
        
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
    if (Object.keys(newObjectPositions).length > 0) {
      setObjectPositions(prev => ({ ...prev, ...newObjectPositions }));
    }
    if (Object.keys(newCardHeights).length > 0) {
      setCardHeights(prev => ({ ...prev, ...newCardHeights }));
    }
    if (Object.keys(newCardWidths).length > 0) {
      setCardWidths(prev => ({ ...prev, ...newCardWidths }));
    }
    if (Object.keys(newCardBorderRadii).length > 0) {
      setCardBorderRadii(prev => ({ ...prev, ...newCardBorderRadii }));
    }
    setCardGap(newCardGap);
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

      // @ts-ignore
      const { data: iconColorData } = await supabase
        .from('text_content')
        .select('color_token')
        .eq('element_id', `${elementPrefix}-icon-color`)
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
          iconColor: iconColorData?.color_token || 'foreground',
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

  // Fixed-size cards with adjustable height, width, and border radius
  const getContainerClasses = (height: string, width: string, aspectRatio: string): string => {
    // If aspect ratio is set (not 'auto'), use it instead of fixed height
    if (aspectRatio !== 'auto') {
      const aspectClass = `aspect-[${aspectRatio.replace(':', '/')}]`;
      return `relative ${width} ${aspectClass}`;
    }
    // Fall back to fixed height for 'auto' aspect ratio
    return `relative ${width} ${height}`;
  };

  // Mask: overflow-hidden + shadow + flex centering (border radius on mask for cover, on image for contain)
  const getMaskClasses = (fitMode: 'contain' | 'cover', borderRadius: string): string => {
    const borderClasses = fitMode === 'cover' ? 'border border-white/10' : '';
    const radiusClasses = fitMode === 'cover' ? borderRadius : '';
    return `relative w-full h-full overflow-hidden shadow-xl isolate ${borderClasses} ${radiusClasses} flex items-center justify-center`;
  };

  // Helper to get optimized image URL for high-quality display
  const getCardImageUrl = (originalUrl: string, fitMode: 'contain' | 'cover'): string => {
    return getOptimizedImageUrl(originalUrl, {
      width: 2560,      // Increased resolution for retina displays
      quality: 100,     // Maximum quality
      format: 'origin', // Keep original format for best quality
      fit: fitMode,     // Match the card's fit mode
    });
  };

  const renderMedia = (index: number, card: FeatureCard) => {
    const mediaData = carouselData[index];
    const cardFitMode = fitModes[index] || 'contain';
    const cardObjectPosition = objectPositions[index] || 'center';
    const aspectRatio = aspectRatios[index] || 'auto'; // Keep for metadata/preview only
    const cardHeight = cardHeights[index] || 'h-[500px]';
    const cardWidth = cardWidths[index] || 'w-full';
    const cardBorderRadius = cardBorderRadii[index] || 'rounded-2xl';
    const containerClasses = getContainerClasses(cardHeight, cardWidth, aspectRatio);
    const maskClasses = getMaskClasses(cardFitMode, cardBorderRadius);
    
    // Contain mode: fill viewport with w-full h-full, object-fit scales image to fit entirely within
    // Cover mode: fill container completely, allowing cropping with configurable positioning (top/center/bottom)
    // Border radius: applied to image for contain, applied to mask for cover
    const imageClasses = cardFitMode === 'contain'
      ? `w-full h-full object-contain block ${cardBorderRadius}`
      : cn(
          'w-full h-full object-cover block',
          cardObjectPosition === 'top' && 'object-top',
          cardObjectPosition === 'center' && 'object-center',
          cardObjectPosition === 'bottom' && 'object-bottom'
        );
    
    // If carousel data exists and has images
    if (mediaData?.display_type === 'carousel' && mediaData.carousel_config?.images?.length > 0) {
      const config = mediaData.carousel_config;
      const plugins = config.autoplay 
        ? [Autoplay({ delay: config.autoplay_delay, stopOnInteraction: true })]
        : [];
      
      return (
        <div className={containerClasses} key={`media-${index}-${refreshKey}-${cardFitMode}-${cardHeight}-${cardBorderRadius}`}>
          <Carousel 
            key={`carousel-${index}-${refreshKey}-${cardFitMode}-${cardHeight}-${cardBorderRadius}`}
            opts={{ loop: true }}
            plugins={plugins}
            className="w-full h-full"
          >
            <CarouselContent className="h-full -ml-0">
              {config.images.map((image, imgIndex) => (
                <CarouselItem 
                  key={imgIndex} 
                  className="h-full pl-0"
                >
                  <div className={maskClasses}>
                    <img
                      key={`carousel-img-${imgIndex}-${refreshKey}-${cardFitMode}-${cardHeight}-${cardBorderRadius}`}
                      src={getCardImageUrl(image.url, cardFitMode)}
                      srcSet={generateSrcSet(image.url, [640, 1280, 1920, 2560, 3840], { quality: 100, format: 'origin', fit: cardFitMode })}
                      sizes="(max-width: 768px) 100vw, 72vw"
                      alt={image.alt || `Slide ${imgIndex + 1}`}
                      loading="lazy"
                      decoding="async"
                      className={imageClasses}
                      style={{
                        imageRendering: 'auto',
                        WebkitFontSmoothing: 'antialiased',
                        backfaceVisibility: 'hidden',
                        transform: 'translateZ(0)',
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
    const imageUrl = imageUrls[index] || card.imageUrl;
      return (
        <div className={containerClasses} key={`media-${index}-${refreshKey}-${cardFitMode}-${cardHeight}-${cardBorderRadius}`}>
          <div className={maskClasses}>
            <img
              key={`single-img-${index}-${refreshKey}-${cardFitMode}-${cardHeight}-${cardBorderRadius}`}
              src={getCardImageUrl(imageUrl, cardFitMode)}
              srcSet={generateSrcSet(imageUrl, [640, 1280, 1920, 2560, 3840], { quality: 100, format: 'origin', fit: cardFitMode })}
              sizes="(max-width: 768px) 100vw, 72vw"
              alt={card.imageAlt}
              loading="lazy"
              decoding="async"
              className={imageClasses}
              style={{
                imageRendering: 'auto',
                WebkitFontSmoothing: 'antialiased',
                backfaceVisibility: 'hidden',
                transform: 'translateZ(0)',
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
        className="relative pt-12 pb-24"
        style={{ minHeight: `${100 + (cards.length * 20)}vh` }}
      >
        {/* Edge-hugging container with grid layout */}
        <div className="px-16">
          <div className="grid lg:grid-cols-[3fr_7fr] gap-12 lg:gap-16">
            {/* Left Column: Sticky Navigation */}
            <EditableBackground
              elementId="scrolling-features-sticky-column"
              defaultBackground="bg-transparent"
              allowedBackgrounds={allowedBackgrounds}
              className="rounded-2xl"
            >
              <div className="hidden lg:block lg:sticky lg:top-32 lg:self-start space-y-6">
                <h2 className={headingStyles.h2}>
                  <EditableTranslation translationKey="scrolling_features.title">
                    Functions That Talk to Each Other
                  </EditableTranslation>
                </h2>
                <p className={cn(headingStyles.body, "text-base opacity-80")}>
                  <EditableTranslation translationKey="scrolling_features.subtitle">
                    Every module shares the same data model. No syncing. No waiting. Just one unified system.
                  </EditableTranslation>
                </p>
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

            {/* Right Column: Feature Cards */}
            <div className={cn("relative flex flex-col", cardGap)}>
              {cards.map((card, index) => {
                const state = cardStates[index] || { opacity: 0, translateY: 20, scale: 1 };
                const Icon = card.icon;
                const isActive = index === activeCardIndex;
                
                return (
                  <div
                    key={card.number}
                    className="relative rounded-3xl overflow-hidden shadow-[0_20px_50px_-12px_rgba(0,0,0,0.15)]"
              style={{
                opacity: 1,
                transform: 'translateY(0) scale(1)',
              }}
                    onMouseEnter={() => editMode && setHoveredCard(index)}
                    onMouseLeave={() => editMode && setHoveredCard(null)}
                  >
                    <div className={cn(
                      "backdrop-blur-xl relative p-4 md:p-6 lg:p-8",
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
                      <div className="w-full">
                        <div className="grid md:grid-cols-[28fr_72fr] gap-4 md:gap-6 lg:gap-8 items-center">
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
                                <Icon 
                                  className="h-5 w-5" 
                                  style={{ color: `hsl(var(--${normalizeColorToken(cardData[index]?.iconColor || 'foreground')}))` }}
                                />
                              </div>
                            </div>
                            
                            <h3 
                              className="text-2xl lg:text-4xl font-bold leading-tight"
                              style={{ color: `hsl(var(--${normalizeColorToken(cardData[index]?.titleColor || 'foreground')}))` }}
                            >
                              <EditableTranslation translationKey={card.titleKey}>
                                {cardData[index]?.title || card.title}
                              </EditableTranslation>
                            </h3>
                            
                            <p 
                              className="text-base lg:text-lg leading-relaxed opacity-80"
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
                          
                          {/* Right: Image (72% width = ~1000px+) */}
                          <div className="-my-2 -mr-2 md:-my-3 md:-mr-4 lg:-my-4 lg:-mr-6">
                            <EditableUniversalMedia
                              locationId={`scrolling-card-${index + 1}`}
                              onSave={() => loadImageSettings()}
                              placeholder={`Click to set image/carousel for ${card.title}`}
                            >
                              {renderMedia(index, card)}
                            </EditableUniversalMedia>
                          </div>
                        </div>
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
