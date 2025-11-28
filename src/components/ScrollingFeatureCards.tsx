import { useRef, useState, useEffect, useMemo, useCallback } from 'react';
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

// Helper function to calculate rendered image bounds for object-contain
const calculateContainedImageBounds = (
  containerWidth: number,
  containerHeight: number,
  naturalWidth: number,
  naturalHeight: number
): { left: number; top: number; width: number; height: number } => {
  const containerAspect = containerWidth / containerHeight;
  const imageAspect = naturalWidth / naturalHeight;
  
  let renderedWidth: number;
  let renderedHeight: number;
  
  if (imageAspect > containerAspect) {
    // Image is wider - constrained by width
    renderedWidth = containerWidth;
    renderedHeight = containerWidth / imageAspect;
  } else {
    // Image is taller - constrained by height
    renderedHeight = containerHeight;
    renderedWidth = containerHeight * imageAspect;
  }
  
  return {
    left: (containerWidth - renderedWidth) / 2,
    top: (containerHeight - renderedHeight) / 2,
    width: renderedWidth,
    height: renderedHeight
  };
};

// Component for images with rounded corners that works with both contain and cover
const ImageWithRoundedCorners: React.FC<{
  src: string;
  srcSet?: string;
  sizes?: string;
  alt: string;
  fitMode: 'contain' | 'cover';
  objectPosition?: string;
  borderRadius: number; // in pixels (e.g., 16)
}> = ({ src, srcSet, sizes, alt, fitMode, objectPosition, borderRadius }) => {
  const imgRef = useRef<HTMLImageElement>(null);
  const [clipPath, setClipPath] = useState<string>('');
  
  const updateClipPath = useCallback(() => {
    const img = imgRef.current;
    if (!img || fitMode !== 'contain') return;
    
    const containerWidth = img.clientWidth;
    const containerHeight = img.clientHeight;
    const naturalWidth = img.naturalWidth;
    const naturalHeight = img.naturalHeight;
    
    if (!naturalWidth || !naturalHeight) return;
    
    const bounds = calculateContainedImageBounds(
      containerWidth, containerHeight, naturalWidth, naturalHeight
    );
    
    // Convert pixel bounds to inset clip-path with rounded corners
    setClipPath(`inset(${bounds.top}px ${containerWidth - bounds.left - bounds.width}px ${containerHeight - bounds.top - bounds.height}px ${bounds.left}px round ${borderRadius}px)`);
  }, [fitMode, borderRadius]);
  
  useEffect(() => {
    const img = imgRef.current;
    if (!img) return;
    
    img.addEventListener('load', updateClipPath);
    window.addEventListener('resize', updateClipPath);
    
    // Initial calculation if already loaded
    if (img.complete) updateClipPath();
    
    return () => {
      img.removeEventListener('load', updateClipPath);
      window.removeEventListener('resize', updateClipPath);
    };
  }, [updateClipPath]);
  
  const baseClasses = fitMode === 'contain' 
    ? 'w-full h-full object-contain block'
    : cn(
        'w-full h-full object-cover block',
        objectPosition === 'top' && 'object-top',
        objectPosition === 'center' && 'object-center', 
        objectPosition === 'bottom' && 'object-bottom'
      );
  
  return (
    <img
      ref={imgRef}
      src={src}
      srcSet={srcSet}
      sizes={sizes}
      alt={alt}
      loading="lazy"
      decoding="async"
      className={baseClasses}
      style={{
        clipPath: fitMode === 'contain' ? clipPath : `inset(0 round ${borderRadius}px)`,
        imageRendering: 'auto',
        WebkitFontSmoothing: 'antialiased',
        backfaceVisibility: 'hidden',
      }}
    />
  );
};

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

  // Remove hardcoded fallback images - let smart fallback chain handle empty states
  const [imageUrls, setImageUrls] = useState<Record<number, string>>({});
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
        newCardHeights[i] = data.card_height || 'h-auto min-h-[600px] sm:h-[675px] lg:h-[720px] xl:h-[780px]';
        newCardWidths[i] = data.card_width || 'w-[70%]';
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
        } else if (!data.image_url && data.carousel_config_id) {
          // Smart fallback: If image_url is empty but carousel exists, use carousel's first image
          const { data: carouselConfig } = await supabase
            .from('carousel_configs')
            .select('images')
            .eq('id', data.carousel_config_id)
            .single();
          
          if (carouselConfig?.images?.[0]?.url) {
            newImageUrls[i] = carouselConfig.images[0].url;
            newCarouselData[i] = { display_type: 'image' };
          }
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

  // Image container always fills available space - card wrapper controls size
  const getContainerClasses = (): string => {
    return 'relative w-full h-full flex items-center justify-center';
  };

  // Mask: overflow-hidden + shadow + flex centering (border radius on mask for cover, on image for contain)
  const getMaskClasses = (fitMode: 'contain' | 'cover', borderRadius: string): string => {
    const borderClasses = fitMode === 'cover' ? 'border border-white/10' : '';
    // Apply border radius to mask for BOTH modes - overflow-hidden clips the entire area
    return `relative w-full h-full overflow-hidden shadow-xl isolate ${borderClasses} ${borderRadius} flex items-center justify-center`;
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
    const cardHeight = cardHeights[index] || 'h-[500px]'; // For key generation only
    const cardBorderRadius = cardBorderRadii[index] || 'rounded-2xl';
    const containerClasses = getContainerClasses();
    const maskClasses = getMaskClasses(cardFitMode, cardBorderRadius);
    
    // Convert border radius class to pixel value for ImageWithRoundedCorners
  const getRadiusInPixels = (radiusClass: string): number => {
    const radiusMap: Record<string, number> = {
      'rounded-none': 0,
      'rounded-sm': 2,
      rounded: 4,
      'rounded-md': 6,
      'rounded-lg': 8,
      'rounded-xl': 12,
      'rounded-2xl': 16,
      'rounded-3xl': 24,
      'rounded-full': 9999,
    };
    return radiusMap[radiusClass] ?? 16;
  };

  const borderRadiusPixels = getRadiusInPixels(cardBorderRadius);
    
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
                    <ImageWithRoundedCorners
                      key={`carousel-img-${imgIndex}-${refreshKey}-${cardFitMode}-${cardHeight}-${cardBorderRadius}`}
                      src={getCardImageUrl(image.url, cardFitMode)}
                      srcSet={generateSrcSet(image.url, [640, 1280, 1920, 2560, 3840], { quality: 100, format: 'origin', fit: cardFitMode })}
                      sizes="(max-width: 768px) 100vw, 72vw"
                      alt={image.alt || `Slide ${imgIndex + 1}`}
                      fitMode={cardFitMode}
                      objectPosition={cardObjectPosition}
                      borderRadius={borderRadiusPixels}
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
            <ImageWithRoundedCorners
              key={`single-img-${index}-${refreshKey}-${cardFitMode}-${cardHeight}-${cardBorderRadius}`}
              src={getCardImageUrl(imageUrl, cardFitMode)}
              srcSet={generateSrcSet(imageUrl, [640, 1280, 1920, 2560, 3840], { quality: 100, format: 'origin', fit: cardFitMode })}
              sizes="(max-width: 768px) 100vw, 72vw"
              alt={card.imageAlt}
              fitMode={cardFitMode}
              objectPosition={cardObjectPosition}
              borderRadius={borderRadiusPixels}
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
        className="relative pt-24 pb-32"
        style={{ minHeight: `${100 + (cards.length * 20)}vh` }}
      >
        {/* Edge-hugging container */}
        <div className="px-6 sm:px-12 lg:px-24 max-w-[1600px] mx-auto">
          {/* Two-column grid: sticky left, scrolling cards right */}
          <div className="grid grid-cols-1 xl:grid-cols-[35fr_65fr] gap-8 xl:gap-16">
            
            {/* LEFT COLUMN - Sticky Header - Hidden below xl */}
            <div className="hidden xl:block xl:sticky xl:top-32 xl:self-start">
              <h2 className={headingStyles.h2}>
                <EditableTranslation translationKey="scrolling_features.title">
                  Turn insights into action — at every stage
                </EditableTranslation>
              </h2>
              
              <p className={cn(headingStyles.body, "text-base opacity-90 mt-6 mb-8")}>
                <EditableTranslation translationKey="scrolling_features.subtitle">
                  Mixpanel helps improve product and web experiences by understanding user behavior, spotting patterns, and making informed decisions.
                </EditableTranslation>
              </p>

              <EditableButton
                buttonText="Book a Demo"
                buttonUrl={mainCtaUrl}
                onSave={(text, url) => {
                  setMainCtaUrl(url);
                }}
              >
                <Button 
                  size="lg"
                  className="rounded-full px-8 py-4 group self-start"
                  style={{
                    backgroundColor: 'rgb(31, 32, 35)',
                    color: 'rgb(255, 255, 255)',
                  }}
                  asChild
                >
                  <a href={mainCtaUrl}>
                    <EditableTranslation translationKey="scrolling_features.cta">
                      Book a Demo
                    </EditableTranslation>
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </a>
                </Button>
              </EditableButton>
            </div>

        {/* RIGHT COLUMN - Scrolling Cards Grid */}
        <div className={cn("relative grid gap-6", "grid-cols-1 md:grid-cols-2 xl:grid-cols-1")}>
            {cards.map((card, index) => {
              const state = cardStates[index] || { opacity: 0, translateY: 20, scale: 1 };
              const Icon = card.icon;
              const isActive = index === activeCardIndex;
              
              return (
                <div
                  key={card.number}
                  className={cn(
                    "relative rounded-3xl overflow-hidden bg-white shadow-lg",
                    cardHeights[index] || 'h-auto'
                  )}
                  style={{
                    opacity: state.opacity,
                    transform: `translateY(${state.translateY}px) scale(${state.scale})`,
                    transition: 'opacity 0.5s ease-out, transform 0.5s ease-out',
                  }}
                    onMouseEnter={() => editMode && setHoveredCard(index)}
                    onMouseLeave={() => editMode && setHoveredCard(null)}
                  >
                  <div className="relative p-6 lg:p-10 h-full bg-white">
                    {/* Edit Button - Only in Edit Mode */}
                    {editMode && hoveredCard === index && (
                      <button
                        className="absolute top-4 right-4 p-3 bg-primary text-primary-foreground rounded-full shadow-xl hover:scale-110 transition-transform z-10"
                        onClick={() => setEditingCard(index)}
                      >
                        <Pencil className="w-5 h-5" />
                      </button>
                    )}
                    <div className="w-full h-full">
                      <div className="grid gap-4 xl:gap-8 items-center h-full min-h-0 grid-cols-1 xl:grid-cols-[45fr_55fr]">
                        {/* Left: Content */}
                        <div className="flex flex-col justify-center gap-6 min-w-0">
                          <div className="flex items-center gap-3">
                            <Badge 
                              className="px-2 py-1 text-xs font-normal tracking-wide"
                              style={{
                                backgroundColor: 'rgba(120, 86, 255, 0.1)',
                                border: '1px solid rgba(120, 86, 255, 0.5)',
                                color: 'rgb(46, 22, 112)',
                                borderRadius: '4px',
                              }}
                            >
                              {String(index + 1).padStart(2, '0')}
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
                            className="text-lg md:text-xl xl:text-2xl font-bold leading-tight break-words hyphens-auto"
                            style={{ color: 'rgb(31, 32, 35)' }}
                          >
                            <EditableTranslation translationKey={card.titleKey}>
                              {cardData[index]?.title || card.title}
                            </EditableTranslation>
                          </h3>
                          
                          <p 
                            className="text-sm xl:text-base leading-relaxed opacity-80 break-words"
                            style={{ color: 'rgba(0, 0, 0, 0.7)' }}
                          >
                            <EditableTranslation translationKey={card.descriptionKey}>
                              {cardData[index]?.description || card.description}
                            </EditableTranslation>
                          </p>
                        
                          <Button 
                            variant="secondary"
                            className="self-start rounded-full px-6 py-3 group"
                            style={{
                              backgroundColor: 'rgba(0, 0, 0, 0.07)',
                              color: 'rgb(31, 32, 35)',
                            }}
                            asChild
                          >
                            <a href={card.ctaUrl || '#'}>
                              <EditableTranslation translationKey={card.ctaKey}>
                                {cardData[index]?.ctaText || card.ctaText}
                              </EditableTranslation>
                              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                            </a>
                          </Button>
                        </div>
                        
                        {/* Right: Image with gradient background */}
                        <div 
                          className="relative rounded-3xl overflow-hidden aspect-square xl:aspect-[16/10]"
                          style={{
                            backgroundImage: 'var(--gradient-warmth)'
                          }}
                        >
                          {/* Image wrapper with asymmetric padding - gradient hugs top and right only */}
                          <div className="absolute inset-0 pt-3 pr-3 pb-0 pl-0 xl:pt-5 xl:pr-5 flex items-start justify-end">
                            <div className="relative w-full h-full rounded-r-2xl overflow-hidden shadow-lg bg-white">
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
            </div> {/* End RIGHT COLUMN */}
          </div> {/* End grid */}
        </div>
      </section>
    </EditableBackground>
  );
}
