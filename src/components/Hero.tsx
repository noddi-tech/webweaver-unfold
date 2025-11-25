import { Button } from "@/components/ui/button";
import { ArrowRight, Award, Sparkles, Target, Users } from "lucide-react";
import { LanguageLink } from "@/components/LanguageLink";
import noddiLocationScreen from "@/assets/noddi-location-screen.png";
import tiamatLocationScreen from "@/assets/tiamat-location-screen.png";
import hurtigrutaLocationScreen from "@/assets/hurtigruta-location-screen.png";
import { useState, useEffect, useRef } from "react";
import { Counter } from "@/components/ui/counter";
import { useTypography } from "@/hooks/useTypography";
import { useAppTranslation } from "@/hooks/useAppTranslation";
import { EditableTranslation } from "@/components/EditableTranslation";
import { LockedText } from "@/components/LockedText";
import { EditableUniversalMedia } from "@/components/EditableUniversalMedia";
import { EditableBackground } from "@/components/EditableBackground";
import { EditableIcon } from "@/components/EditableIcon";
import { useAllowedBackgrounds } from "@/hooks/useAllowedBackgrounds";
import { supabase } from "@/integrations/supabase/client";
import { LogoMarquee } from "@/components/LogoMarquee";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";

const Hero = () => {
  const { t } = useAppTranslation();
  const { h1, body } = useTypography();
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);
  const [count, setCount] = useState(0);
  const plugin = useRef(Autoplay({ delay: 3500, stopOnInteraction: true }));
  const [refreshKey, setRefreshKey] = useState(0);
  const { allowedBackgrounds } = useAllowedBackgrounds();
  
  // Media settings state
  const [isLoading, setIsLoading] = useState(true);
  const [mediaKey, setMediaKey] = useState(0);
  const [displayType, setDisplayType] = useState<'image' | 'carousel'>('carousel');
  const [imageSettings, setImageSettings] = useState({
    image_url: '',
    image_alt: '',
  });
  const [carouselSettings, setCarouselSettings] = useState<any>({
    autoplay: true,
    autoplay_delay: 3.5,
    show_navigation: true,
    show_dots: true,
    images: [],
  });

  // Fallback images
  const fallbackImages = [
    {
      url: noddiLocationScreen,
      alt: "Noddi location selection screen showing saved addresses and search functionality",
      title: "Noddi",
    },
    {
      url: tiamatLocationScreen,
      alt: "Tiamat Dekk location selection screen with address delivery confirmation",
      title: "Tiamat Dekk",
    },
    {
      url: hurtigrutaLocationScreen,
      alt: "Hurtigruta Carglass location selection screen with address delivery options",
      title: "Hurtigruta Carglass",
    },
  ];

  const fallbackImage = noddiLocationScreen;

  useEffect(() => {
    loadMediaSettings();
  }, []);

  const loadMediaSettings = async () => {
    setIsLoading(true);
    try {
      // Step 1: Get settings without JOIN
      const { data: settings, error } = await supabase
        .from('image_carousel_settings')
        .select('*')
        .eq('location_id', 'homepage-hero')
        .maybeSingle();

      if (error) {
        console.error('❌ Query error:', error);
        setIsLoading(false);
        return;
      }

      console.log('📊 Hero settings loaded:', settings);

      if (settings) {
        console.log('✅ Settings received:', { 
          displayType: settings.display_type, 
          imageUrl: settings.image_url,
          carouselConfigId: settings.carousel_config_id
        });
        
        setDisplayType(settings.display_type as 'image' | 'carousel');
        
        if (settings.display_type === 'image') {
          setImageSettings({
            image_url: settings.image_url || '',
            image_alt: settings.image_alt || '',
          });
          console.log('🖼️ Single image mode:', settings.image_url);
        } else if (settings.carousel_config_id) {
          // Step 2: Fetch carousel config separately if needed
          const { data: carouselConfig, error: carouselError } = await supabase
            .from('carousel_configs')
            .select('*')
            .eq('id', settings.carousel_config_id)
            .single();
            
          if (carouselError) {
            console.error('❌ Carousel config error:', carouselError);
          } else if (carouselConfig) {
            // Parse carousel images
            const images = Array.isArray(carouselConfig.images) ? carouselConfig.images : [];
            
            setCarouselSettings({
              autoplay: carouselConfig.autoplay,
              autoplay_delay: carouselConfig.autoplay_delay,
              show_navigation: carouselConfig.show_navigation,
              show_dots: carouselConfig.show_dots,
              images: images.length > 0 ? images : fallbackImages,
            });
            
            console.log('🎠 Carousel mode:', images.length, 'images');
            
            // Update autoplay plugin delay
            if (plugin.current) {
              plugin.current = Autoplay({ 
                delay: carouselConfig.autoplay_delay * 1000,
                stopOnInteraction: true 
              });
            }
          }
        }
        
        // Force re-render after loading
        setMediaKey(prev => prev + 1);
      } else {
        console.warn('⚠️ No settings found for homepage-hero');
      }
    } catch (error) {
      console.error('❌ Error loading media settings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!api) {
      return;
    }

    setCount(api.scrollSnapList().length);
    setCurrent(api.selectedScrollSnap() + 1);

    api.on("select", () => {
      setCurrent(api.selectedScrollSnap() + 1);
    });
  }, [api]);

  const shouldShowNavigation = carouselSettings.show_navigation && carouselSettings.images.length > 1;
  const shouldShowDots = carouselSettings.show_dots && carouselSettings.images.length > 1;
  const totalSlides = carouselSettings.images.length;
  const currentSlide = current - 1;

  return (
    <section className="pt-32 pb-0 relative overflow-visible bg-background">
      <div className="container max-w-container px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Centered single column layout */}
        <div className="flex flex-col items-center text-center gap-12">
          {/* Text Content - Centered */}
          <div className="space-y-8" key={refreshKey}>
            <EditableTranslation translationKey="hero.title" onSave={() => setRefreshKey(prev => prev + 1)}>
              <h1 className={`${h1} text-foreground text-center`}>{t('hero.title', 'One platform. Every function.')}</h1>
            </EditableTranslation>

            <EditableTranslation translationKey="hero.subtitle" onSave={() => setRefreshKey(prev => prev + 1)}>
              <p className={`${body} text-muted-foreground text-center`}>{t('hero.subtitle', 'Booking to billing. Built for automotive services.')}</p>
            </EditableTranslation>

            {/* Metrics Badges - Centered */}
            <div className="flex flex-wrap gap-6 justify-center">
            <EditableBackground
                elementId="hero-metrics-badge"
                defaultBackground="glass-card"
                allowedBackgrounds={allowedBackgrounds}
              >
                <div className="flex items-center gap-3 px-6 py-4 rounded-xl shadow-lg hover-scale">
                  <EditableIcon
                    elementId="hero-award-icon"
                    icon={Award}
                    defaultBackground="bg-gradient-primary"
                    size="sm"
                  />
                  <div>
                    <LockedText reason="Metric value - Update in code">
                      <div className="text-lg font-bold bg-gradient-primary bg-clip-text text-transparent">
                        Net Promoter Score <Counter end={90} prefix="~" />
                      </div>
                    </LockedText>
                    <EditableTranslation translationKey="hero.metrics.nps" onSave={() => setRefreshKey(prev => prev + 1)}>
                      <div className="text-xs text-muted-foreground">{t('hero.metrics.nps', 'from end customers. Like no one else in the industry')}</div>
                    </EditableTranslation>
                  </div>
                </div>
              </EditableBackground>
            </div>

            {/* CTA Button - Centered */}
            <div className="flex justify-center">
              <LanguageLink to="/contact">
                <EditableTranslation translationKey="hero.cta" onSave={() => setRefreshKey(prev => prev + 1)}>
                  <Button size="lg" className="text-lg px-8 py-4 group shadow-lg">
                    {t('hero.cta', 'Get a Demo')}
                    <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </EditableTranslation>
              </LanguageLink>
            </div>
          </div>

          {/* Logo Marquee - Before Image */}
          <div className="w-full mt-16">
            <LogoMarquee />
          </div>

          {/* Full-width Image - 16:9 Aspect Ratio */}
          <div className="relative w-full max-w-5xl mt-12">
            <EditableUniversalMedia
              key={mediaKey}
              locationId="homepage-hero"
              onSave={loadMediaSettings}
              placeholder="Click to configure hero image/carousel"
            >
              {isLoading ? (
                <div className="relative">
                  <div className="w-full h-[600px] rounded-xl bg-muted/20 animate-pulse" />
                </div>
              ) : displayType === 'carousel' ? (
                <div className="relative">
                  <div 
                    className="p-32 rounded-2xl relative overflow-visible"
                    style={{
                      background: `linear-gradient(to top, 
                        hsl(var(--vibrant-purple) / 0.25) 0%, 
                        hsl(var(--brand-pink) / 0.15) 40%, 
                        hsl(var(--brand-peach) / 0.1) 70%, 
                        transparent 100%)`
                    }}
                  >
                    <Carousel
                      key={mediaKey}
                      setApi={setApi}
                      opts={{
                        align: 'center',
                        loop: carouselSettings.autoplay,
                      }}
                      plugins={carouselSettings.autoplay ? [
                        Autoplay({
                          delay: carouselSettings.autoplay_delay * 1000,
                          stopOnInteraction: false,
                        })
                      ] : []}
                      className="w-full"
                    >
                      <CarouselContent>
                        {carouselSettings.images.map((image: any, index: number) => (
                          <CarouselItem key={`hero-slide-${index}`}>
                            <div className="aspect-video rounded-xl overflow-hidden shadow-2xl">
                              <img
                                src={image.url}
                                alt={image.alt || `Slide ${index + 1}`}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          </CarouselItem>
                        ))}
                      </CarouselContent>
                      
                      {shouldShowNavigation && (
                        <>
                          <CarouselPrevious className="left-4" />
                          <CarouselNext className="right-4" />
                        </>
                      )}
                    </Carousel>

                    {shouldShowDots && totalSlides > 0 && (
                      <div className="flex justify-center gap-2 mt-8">
                        {Array.from({ length: totalSlides }).map((_, index) => (
                          <button
                            key={`hero-dot-${index}`}
                            onClick={() => api?.scrollTo(index)}
                            className={`h-2 rounded-full transition-all ${
                              index === currentSlide
                                ? 'w-8 bg-primary'
                                : 'w-2 bg-primary/30 hover:bg-primary/50'
                            }`}
                            aria-label={`Go to slide ${index + 1}`}
                          />
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Floating Callouts */}
                  <div 
                    className="absolute -left-[10%] top-1/3 w-[14%] rounded-lg shadow-2xl overflow-hidden opacity-0 animate-fade-in hidden lg:block"
                    style={{ animationDelay: '0.3s', animationFillMode: 'forwards' }}
                  >
                    <img 
                      src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=600&fit=crop" 
                      alt="Dashboard callout" 
                      className="w-full"
                    />
                  </div>
                  <div 
                    className="absolute -right-[8%] top-[15%] w-[30%] rounded-lg shadow-2xl overflow-hidden opacity-0 animate-fade-in hidden lg:block"
                    style={{ animationDelay: '0.5s', animationFillMode: 'forwards' }}
                  >
                    <img 
                      src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&h=400&fit=crop" 
                      alt="Analytics callout" 
                      className="w-full"
                    />
                  </div>
                  <div 
                    className="absolute -right-[5%] bottom-[10%] w-[18%] rounded-lg shadow-2xl overflow-hidden opacity-0 animate-fade-in hidden lg:block"
                    style={{ animationDelay: '0.7s', animationFillMode: 'forwards' }}
                  >
                    <img 
                      src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=400&fit=crop" 
                      alt="Metrics callout" 
                      className="w-full"
                    />
                  </div>
                </div>
              ) : (
                <div className="relative">
                  <div 
                    className="p-32 rounded-2xl relative overflow-visible"
                    style={{
                      background: `linear-gradient(to top, 
                        hsl(var(--vibrant-purple) / 0.25) 0%, 
                        hsl(var(--brand-pink) / 0.15) 40%, 
                        hsl(var(--brand-peach) / 0.1) 70%, 
                        transparent 100%)`
                    }}
                  >
                    <div className="aspect-video rounded-xl overflow-hidden shadow-2xl">
                      <img
                        key={mediaKey}
                        src={imageSettings.image_url || fallbackImage}
                        alt={imageSettings.image_alt || 'Hero image'}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>

                  {/* Floating Callouts */}
                  <div 
                    className="absolute -left-[10%] top-1/3 w-[14%] rounded-lg shadow-2xl overflow-hidden opacity-0 animate-fade-in hidden lg:block"
                    style={{ animationDelay: '0.3s', animationFillMode: 'forwards' }}
                  >
                    <img 
                      src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=600&fit=crop" 
                      alt="Dashboard callout" 
                      className="w-full"
                    />
                  </div>
                  <div 
                    className="absolute -right-[8%] top-[15%] w-[30%] rounded-lg shadow-2xl overflow-hidden opacity-0 animate-fade-in hidden lg:block"
                    style={{ animationDelay: '0.5s', animationFillMode: 'forwards' }}
                  >
                    <img 
                      src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&h=400&fit=crop" 
                      alt="Analytics callout" 
                      className="w-full"
                    />
                  </div>
                  <div 
                    className="absolute -right-[5%] bottom-[10%] w-[18%] rounded-lg shadow-2xl overflow-hidden opacity-0 animate-fade-in hidden lg:block"
                    style={{ animationDelay: '0.7s', animationFillMode: 'forwards' }}
                  >
                    <img 
                      src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=400&fit=crop" 
                      alt="Metrics callout" 
                      className="w-full"
                    />
                  </div>
                </div>
              )}
            </EditableUniversalMedia>
          </div>
        </div>
      </div>

      {/* Feature Highlights - Full Width Dark Section */}
      <div className="relative w-full mt-16">
        <div 
          className="absolute inset-0" 
          style={{
            background: `linear-gradient(to bottom, 
              hsl(var(--primary)) 0%, 
              hsl(var(--primary) / 0.95) 100%)`
          }}
        />
        <div className="relative container mx-auto px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 py-16">
            {/* Feature 1 */}
            <div className="text-center opacity-0 animate-fade-in" style={{ animationDelay: '0.2s', animationFillMode: 'forwards' }}>
              <div className="flex justify-center mb-4">
                <div 
                  className="w-12 h-12 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: 'hsl(var(--vibrant-purple) / 0.2)' }}
                >
                  <Sparkles className="w-6 h-6 text-primary-foreground" />
                </div>
              </div>
              <EditableTranslation translationKey="hero.feature1.title">
                <h3 className="text-lg font-semibold text-primary-foreground mb-2">Discover freely</h3>
              </EditableTranslation>
              <EditableTranslation translationKey="hero.feature1.description">
                <p className="text-sm text-primary-foreground/70">Answer product questions in seconds without bottlenecks.</p>
              </EditableTranslation>
            </div>

            {/* Feature 2 */}
            <div className="text-center opacity-0 animate-fade-in" style={{ animationDelay: '0.4s', animationFillMode: 'forwards' }}>
              <div className="flex justify-center mb-4">
                <div 
                  className="w-12 h-12 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: 'hsl(var(--vibrant-purple) / 0.2)' }}
                >
                  <Users className="w-6 h-6 text-primary-foreground" />
                </div>
              </div>
              <EditableTranslation translationKey="hero.feature2.title">
                <h3 className="text-lg font-semibold text-primary-foreground mb-2">Understand behavior</h3>
              </EditableTranslation>
              <EditableTranslation translationKey="hero.feature2.description">
                <p className="text-sm text-primary-foreground/70">See how users engage, convert, and return, all in one unified view.</p>
              </EditableTranslation>
            </div>

            {/* Feature 3 */}
            <div className="text-center opacity-0 animate-fade-in" style={{ animationDelay: '0.6s', animationFillMode: 'forwards' }}>
              <div className="flex justify-center mb-4">
                <div 
                  className="w-12 h-12 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: 'hsl(var(--vibrant-purple) / 0.2)' }}
                >
                  <Target className="h-6 w-6 text-primary-foreground" />
                </div>
              </div>
              <EditableTranslation translationKey="hero.feature3.title">
                <h3 className="text-lg font-semibold text-primary-foreground mb-2">Act with confidence</h3>
              </EditableTranslation>
              <EditableTranslation translationKey="hero.feature3.description">
                <p className="text-sm text-primary-foreground/70">Back every decision with insights you can trust. Then share, test, and improve together.</p>
              </EditableTranslation>
            </div>
          </div>
        </div>

        {/* Ellipse Glow */}
        <div 
          className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[80%] h-32 blur-3xl pointer-events-none"
          style={{
            background: 'radial-gradient(circle, hsl(var(--vibrant-purple) / 0.25) 0%, transparent 70%)'
          }}
        />
      </div>
    </section>
  );
};

export default Hero;
